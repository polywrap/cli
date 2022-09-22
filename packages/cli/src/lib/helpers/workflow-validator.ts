import { runCommandSync } from "../system";
import { intlMsg } from "../intl";
import { JobStatus, ValidationResult, WorkflowOutput } from "../workflow";

import path from "path";
import fs from "fs";
import os from "os";

const TMPDIR = fs.mkdtempSync(path.join(os.tmpdir(), `polywrap-cli`));

export function cueExists(): boolean {
  const { stdout } = runCommandSync("cue version", true);
  return stdout ? stdout.startsWith("cue version ") : false;
}

export function validateOutput(
  output: WorkflowOutput,
  validateScriptPath: string
): ValidationResult {
  if (!cueExists()) {
    console.warn(intlMsg.commands_run_error_cueDoesNotExist());
  }

  const { id, data, error } = output;

  const index = id.lastIndexOf(".");
  const jobId = id.substring(0, index);
  const stepId = id.substring(index + 1);

  const selector = `${jobId}.\\$${stepId}`;
  const jsonOutput = `${TMPDIR}/${id}.json`;

  fs.writeFileSync(jsonOutput, JSON.stringify({ data, error }, null, 2));

  const { stderr } = runCommandSync(
    `cue vet -d ${selector} ${validateScriptPath} ${jsonOutput}`,
    true
  );

  if (fs.existsSync(jsonOutput)) {
    fs.unlinkSync(jsonOutput);
  }

  if (!stderr) {
    return { status: JobStatus.SUCCEED };
  } else {
    process.exitCode = 1;
    return { status: JobStatus.FAILED, stderr: stderr.stderr };
  }
}
