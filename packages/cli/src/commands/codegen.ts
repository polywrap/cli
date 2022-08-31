import { Command, Program } from "./types";
import {
  CodeGenerator,
  PolywrapProject,
  SchemaComposer,
  intlMsg,
  defaultPolywrapManifest,
  parseDirOption,
  parseCodegenScriptOption,
  parseWasmManifestFileOption,
  parseClientConfigOption,
} from "../lib";

import path from "path";
import { PolywrapClient, PolywrapClientConfig } from "@polywrap/client-js";

const defaultCodegenDir = "./wrap";
const pathStr = intlMsg.commands_codegen_options_o_path();
const defaultManifestStr = defaultPolywrapManifest.join(" | ");

type CodegenCommandOptions = {
  manifestFile: string;
  codegenDir: string;
  script?: string;
  clientConfig: Partial<PolywrapClientConfig>;
};

export const codegen: Command = {
  setup: (program: Program) => {
    program
      .command("codegen")
      .alias("g")
      .description(intlMsg.commands_codegen_description())
      .option(
        `-m, --manifest-file <${pathStr}>`,
        `${intlMsg.commands_codegen_options_m({
          default: defaultManifestStr,
        })}`
      )
      .option(
        `-g, --codegen-dir <${pathStr}>`,
        ` ${intlMsg.commands_codegen_options_codegen({
          default: defaultCodegenDir,
        })}`
      )
      .option(
        `-s, --script <${pathStr}>`,
        `${intlMsg.commands_codegen_options_s()}`
      )
      .option(
        `-c, --client-config <${intlMsg.commands_common_options_configPath()}>`,
        `${intlMsg.commands_common_options_config()}`
      )
      .action(async (options) => {
        await run({
          ...options,
          clientConfig: await parseClientConfigOption(options.clientConfig),
          codegenDir: parseDirOption(options.codegenDir, defaultCodegenDir),
          script: parseCodegenScriptOption(options.script),
          manifestFile: parseWasmManifestFileOption(options.manifestFile),
        });
      });
  },
};

async function run(options: CodegenCommandOptions) {
  const { manifestFile, codegenDir, script, clientConfig } = options;

  // Get Client
  const client = new PolywrapClient(clientConfig);

  // Polywrap Project
  const project = new PolywrapProject({
    rootDir: path.dirname(manifestFile),
    polywrapManifestPath: manifestFile,
  });
  await project.validate();
  const schemaComposer = new SchemaComposer({
    project,
    client,
  });

  const abi = await schemaComposer.getComposedAbis();

  const codeGenerator = new CodeGenerator({
    project,
    abi,
  });

  const generationSubPath = await CodeGenerator.getGenerationSubpath(project);
  const generationAbsPath = generationSubPath
    ? path.join(project.getManifestDir(), generationSubPath)
    : undefined;

  const result = script
    ? await codeGenerator.generateFromScript({
        script,
        codegenDirAbs: codegenDir,
      })
    : await codeGenerator.generate(generationAbsPath);

  if (result) {
    console.log(`🔥 ${intlMsg.commands_codegen_success()} 🔥`);
    process.exitCode = 0;
  } else {
    process.exitCode = 1;
  }
}
