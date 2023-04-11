import { clearStyle, polywrapCli } from "../utils";
import { testBuildOutput } from "../helpers/testBuildOutput";
import { BuildCommandOptions } from "../../../commands";

import { GetPathToCliTestFiles } from "@polywrap/test-cases";
import { Commands, runCli } from "@polywrap/cli-js";
import fs from "fs";
import os from "os";
import path from "path";

const HELP = `Usage: polywrap build|b [options]

Build Polywrap Projects (type: interface, wasm)

Options:
  -m, --manifest-file <path>           Path to the Polywrap Build manifest file
                                       (default: polywrap.yaml | polywrap.yml)
  -o, --output-dir <path>              Output directory for build results
                                       (default: ./build)
  -c, --client-config <config-path>    Add custom configuration to the
                                       PolywrapClient
  -n, --no-codegen                     Skip code generation before build
  --codegen-dir                        Codegen output directory (default:
                                       ./src/wrap)
  --wrapper-envs <envs-path>           Path to a JSON file containing wrapper
                                       envs
  -s, --strategy <vm | image | local>  Strategy to use for building the wrapper
                                       (default: vm)
  -w, --watch                          Automatically execute command when
                                       changes are made (default: false)
  -v, --verbose                        Verbose output (default: false)
  -q, --quiet                          Suppress output (default: false)
  -l, --log-file [path]                Log file to save console output to
  -h, --help                           display help for command
`;

jest.setTimeout(500000);

describe("e2e tests for build command", () => {
  const testCaseRoot = path.join(GetPathToCliTestFiles(), "wasm/build-cmd/assemblyscript");
  const testCases = fs
    .readdirSync(testCaseRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const getTestCaseDir = (index: number) =>
    path.join(testCaseRoot, testCases[index]);

  const testCliOutput = (
    testCaseDir: string,
    exitCode: number,
    stdout: string,
    stder: string
  ) => {
    const output = clearStyle(stdout);
    const error = clearStyle(stder);

    const expected = JSON.parse(
      fs.readFileSync(
        path.join(testCaseDir, "expected", "stdout.json"),
        "utf-8"
      )
    );

    if (expected.stdout) {
      if (Array.isArray(expected.stdout)) {
        for (const line of expected.stdout) {
          expect(output).toContain(line);
        }
      } else {
        expect(output).toContain(expected.stdout);
      }
    }

    if (expected.stderr) {
      if (Array.isArray(expected.stderr)) {
        for (const line of expected.stderr) {
          expect(error).toContain(line);
        }
      } else {
        expect(error).toContain(expected.stderr);
      }
    }

    if (expected.exitCode) {
      expect(exitCode).toEqual(expected.exitCode);
    }

    if (expected.files) {
      for (const file of expected.files) {
        expect(fs.existsSync(path.join(testCaseDir, file))).toBeTruthy();
      }
    }
  };

  it("Should show help text", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await Commands.build({
      help: true,
    }, {
      cwd: getTestCaseDir(0),
      cli: polywrapCli,
    });

    expect(code).toEqual(0);
    expect(error).toBe("");
    expect(clearStyle(output)).toEqual(HELP);
  });

  it("Should throw error for unknown option --invalid", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCli({
      args: ["build", "--invalid"],
      config: {
        cwd: getTestCaseDir(0),
        cli: polywrapCli,
      }
    });

    expect(code).toEqual(1);
    expect(error).toBe("error: unknown option '--invalid'\n");
    expect(output).toEqual(``);
  });

  describe("missing option arguments", () => {
    const missingOptionArgs = {
      "--manifest-file": "-m, --manifest-file <path>",
      "--output-dir": "-o, --output-dir <path>",
      "--client-config": "-c, --client-config <config-path>"
    }

    for (const [option, errorMessage] of Object.entries(missingOptionArgs)) {
      it(`Should throw error if params not specified for ${option} option`, async () => {
        const { exitCode: code, stdout: output, stderr: error } = await runCli({
          args: ["build", option],
          config: {
            cwd: getTestCaseDir(0),
            cli: polywrapCli,
          }
        });

        expect(code).toEqual(1);
        expect(error).toBe(
          `error: option '${errorMessage}' argument missing\n`
        );
        expect(output).toEqual(``);
      });
    }
  });

  it("Should throw error if params not specified for --client-config option", async () => {
    const { exitCode: code, stdout: output, stderr: error } = await runCli({
      args: ["build", "--client-config"],
      config: {
        cwd: getTestCaseDir(0),
        cli: polywrapCli,
      }
    });

    expect(code).toEqual(1);
    expect(error).toContain(
      "error: option '-c, --client-config <config-path>' argument missing"
    );
    expect(output).toBe("");
  });

  it("Should store build files in specified output dir", async () => {
    const outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), `polywrap-cli-tests`)
    );
    const testCaseDir = getTestCaseDir(0);
    const { exitCode: code, stdout: output } = await Commands.build({
      outputDir,
      verbose: true
    }, {
      cwd: testCaseDir,
      cli: polywrapCli,
    });

    const displayPath = "./" + path.relative(
      testCaseDir, outputDir
    );

    expect(code).toEqual(0);
    expect(output).toContain(`Artifacts written to ${displayPath}`);
    expect(output).toContain(`WRAP manifest written in ${displayPath}/wrap.info`);

    testBuildOutput(testCaseDir, outputDir);
  });

  it("Should write log to file", async () => {
    const testCaseDir = getTestCaseDir(0);
    const logFilePath = "./log-file.txt";
    const logFileAbsPath = path.join(testCaseDir, logFilePath);
    const { exitCode: code } = await Commands.build({
      logFile: logFilePath,
    }, {
      cwd: testCaseDir,
      cli: polywrapCli,
    });


    expect(code).toEqual(0);
    expect(fs.existsSync(logFileAbsPath)).toBeTruthy();
    expect(fs.statSync(logFileAbsPath).size).toBeGreaterThan(0);
    fs.unlinkSync(logFileAbsPath);
  });

  describe("Image strategy", () => {
    it("Builds for assemblyscript", async () => {
      const { exitCode: code, stdout: output } = await Commands.build({
        strategy: "image",
      }, {
        cwd: getTestCaseDir(0),
        cli: polywrapCli,
      });

      const buildDir = "./build";

      expect(code).toEqual(0);
      expect(output).toContain(`Artifacts written to ${buildDir}`);
      expect(output).toContain(`WRAP manifest written in ${buildDir}/wrap.info`);

      const imageNameUUIDSuffix = output.match(/(?<=polywrap-build-env-)(.*)(?= \/bin)/);
      
      expect(imageNameUUIDSuffix?.[0]).toBeTruthy();
      expect(imageNameUUIDSuffix?.[0].length).toBe(36);
    });
  })

  describe("Local strategy", () => {

    // Local strategy runs `yarn` by default, so we need to ensure that we clean up lockfiles
    const cleanupYarnLockfiles = async () => {
      for (let i = 0; i < testCases.length; i++) {
        const yarnLockfile = path.join(getTestCaseDir(0), "yarn.lock");
        if(fs.existsSync(yarnLockfile)){
          await fs.promises.unlink(yarnLockfile);
        }
      }
    };

    beforeAll(async () => {
      await cleanupYarnLockfiles();
    });

    afterAll(async () => {
      await cleanupYarnLockfiles();
    });

    it("Builds for assemblyscript", async () => {
      const { exitCode: code, stdout: output } = await Commands.build({
        strategy: "local",
        verbose: true
      }, {
        cwd: getTestCaseDir(0),
        cli: polywrapCli,
      });

      const buildDir = `./build`;

      expect(code).toEqual(0);
      expect(output).toContain(`Artifacts written to ${buildDir}`);
      expect(output).toContain(`WRAP manifest written in ${buildDir}/wrap.info`);
    });
  })
  
  describe("test-cases", () => {
    for (let i = 0; i < testCases.length; i++) {
      const testCaseName = testCases[i];
      const testCaseDir = getTestCaseDir(i);

      let args: BuildCommandOptions;
      let cmdFile = path.join(testCaseDir, "cmd.json");
      if (fs.existsSync(cmdFile)) {
        const cmdConfig = JSON.parse(fs.readFileSync(cmdFile, "utf-8"));
        if (cmdConfig) {
          args = cmdConfig;
        }
      }

      test(testCaseName, async () => {
        const { exitCode, stdout, stderr } = await Commands.build({
          ...args,
          verbose: true
        }, {
          cwd: testCaseDir,
          cli: polywrapCli,
        });

        const buildDir = path.join(testCaseDir, "build");

        testCliOutput(testCaseDir, exitCode, stdout, stderr);
        testBuildOutput(testCaseDir, buildDir);
      });
    }
  });
});
