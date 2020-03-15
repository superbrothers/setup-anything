import * as core from "@actions/core";
import * as installer from "./installer";

export const run = async (): Promise<void> => {
  try {
    const url: string = core.getInput("url", { required: true });
    const toolName: string = core.getInput("tool_name");
    const archiveFormat: string = core.getInput("archive_format");
    const toolDir: string = core.getInput("tool_dir");

    let toolPath: string = installer.findTool(url);
    if (toolPath === "") {
      const binPath = await installer.downloadTool(
        url,
        toolName,
        archiveFormat,
        toolDir
      );
      toolPath = await installer.cacheTool(binPath, url);
    }
    core.addPath(toolPath);
  } catch (err) {
    core.setFailed(err.message);
  }
};
