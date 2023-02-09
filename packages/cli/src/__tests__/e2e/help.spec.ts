import { clearStyle, polywrapCli } from "./utils";

import { runCLI } from "@polywrap/test-env-js";


const HELP = `Usage: polywrap [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  build|b [options]            Build Polywrap Projects (type: interface, wasm)
  codegen|g [options]          Generate Code For Polywrap Projects
  create|c                     Create New Projects
  deploy|d [options]           Deploys Polywrap Projects
  docgen|o [options] <action>  Generate wrapper documentation
  infra|i [options] <action>   Modular Infrastructure-As-Code Orchestrator
  manifest|m                   Inspect & Migrade Polywrap Manifests
  test|t [options]             Execute Tests
  help [command]               display help for command
`;

describe("e2e tests for no help", () => {

  it("Should display the help content", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCLI({
      args: ["help"],
      cli: polywrapCli,
    });

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toEqual(HELP);
  });
});
