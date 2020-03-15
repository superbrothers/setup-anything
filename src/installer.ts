import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as path from "path";
import * as filenamifyUrl from "filenamify-url";
import * as util from "util";
import * as childProcess from "child_process";
const execFile = util.promisify(childProcess.execFile);
import * as fs from "fs";
const { rename, chmod } = fs.promises;

export const expandEnv = async (str: string): Promise<string> => {
  const { stdout } = await execFile("echo", ["-n", str], { shell: true });
  return stdout;
};

export const downloadTool = async (
  url: string,
  toolName: string,
  archiveFormat: string,
  toolDir: string
): Promise<string> => {
  url = await expandEnv(url);
  toolDir = await expandEnv(toolDir);

  core.info(`Downloading from ${url}`);
  const downloadedPath: string = await tc.downloadTool(url);
  core.debug(`Downloaded to ${downloadedPath}`);

  let extractedPath: string;
  let binPath: string;
  if (archiveFormat === "none") {
    let toolPath = downloadedPath;

    if (toolName !== "") {
      toolPath = path.join(path.dirname(downloadedPath), toolName);
      core.info(`Renaming to ${toolName}`);
      await rename(downloadedPath, toolPath);
      core.debug(`Renamed ${downloadedPath} to ${toolPath}`);
    }

    const mode = "0666";
    core.info(`Changing file permissions to ${mode}...`);
    await chmod(toolPath, mode);

    binPath = path.dirname(toolPath);
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

    binPath = path.join(extractedPath, toolDir);
  }

  return binPath;
};

export const findTool = (url: string): string => {
  const version = filenamifyUrl(url);
  return tc.find("setup-anything", version);
};

export const cacheTool = async (
  sourceDir: string,
  url: string
): Promise<string> => {
  const version = filenamifyUrl(url);
  return tc.cacheDir(sourceDir, "setup-anything", version);
};
