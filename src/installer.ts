import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as filenamify from "filenamify";

export const download = async (url: string, toolName: string): Promise<string> => {
  core.info(`Downloading from ${url}`);

  const downloadPath: string = await tc.downloadTool(url);
  core.debug(`Downloaded to ${downloadPath}`)

  const cachePath: string = await tc.cacheFile(downloadPath, toolName, toolName, filenamify(url));
  core.info(`Cached ${downloadPath} to ${cachePath}`);

  return cachePath;
};
