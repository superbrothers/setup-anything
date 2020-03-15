import * as core from "@actions/core";
import * as installer from "./installer";

export const run = async (): Promise<void> => {
  try {
    const url: string = core.getInput("url", { required: true });
    const archiveFormat: string = core.getInput("archive_format", {
      required: true
    });
    const binDir: string = core.getInput("bin_dir", { required: true });

    let toolPath: string = installer.findTool(url);
    if (toolPath === "") {
      const binPath = await installer.downloadTool(url, archiveFormat, binDir);
      toolPath = await installer.cacheTool(binPath, url);
    }
    core.addPath(toolPath);
  } catch (err) {
    core.setFailed(err.message);
  }
};
