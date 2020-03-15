import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as exec from "@actions/exec";
import * as path from "path";
import * as filenamifyUrl from "filenamify-url";

const toolName = "setup-anything";

export const downloadTool = async (
  url: string,
  archiveFormat: string,
  binDir: string
): Promise<string> => {
  url = await expandEnv(url);
  binDir = await expandEnv(binDir);

  core.info(`Downloading from ${url}`);
  const downloadedPath: string = await tc.downloadTool(url);
  core.debug(`Downloaded to ${downloadedPath}`);

  let extractedPath: string;
  let binPath: string;
  if (archiveFormat === "none") {
    binPath = path.dirname(downloadedPath);
  } else {
    core.info("Extracting...");
    switch (archiveFormat) {
      case "zip":
        extractedPath = await tc.extractZip(downloadedPath);
        break;
      case "7z":
        extractedPath = await tc.extract7z(downloadedPath);
        break;
      case "tar.gz":
      case "tgz":
      case "tar":
        extractedPath = await tc.extractTar(downloadedPath);
        break;
      default:
        throw new Error(
          `Does not support to extract this archive format: ${archiveFormat}`
        );
    }
    core.debug(`Extracted to ${extractedPath}`);

    binPath = path.join(extractedPath, binDir);
  }

  return binPath;
};

export const findTool = (url: string): string => {
  const version = filenamifyUrl(url);
  return tc.find(toolName, version);
};

export const cacheTool = async (
  sourceDir: string,
  url: string
): Promise<string> => {
  const version = filenamifyUrl(url);
  return tc.cacheDir(sourceDir, toolName, version);
};

export const expandEnv = async (str: string): Promise<string> => {
  let stdout: string;
  let stderr: string;

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        stderr += data.toString();
      },
    },
  };

  const code = await exec.exec("echo", str.split(" "), options);
  if (code > 0) {
    throw new Error(`'${stderr}' with exit code ${code}`)
  }
  return stdout;
};
