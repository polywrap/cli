import { Argument, Command, Program } from "./types";
import {
  defaultBuildManifest,
  defaultDeployManifest,
  defaultInfraManifest,
  defaultMetaManifest,
  defaultWorkflowManifest,
  getProjectManifestLanguage,
  intlMsg,
  isAppManifestLanguage,
  isPluginManifestLanguage,
  isPolywrapManifestLanguage,
  maybeGetManifestFormatVersion,
  parseManifestFileOption,
  CacheDirectory,
  defaultCodegenManifest,
} from "../lib";
import {
  getYamlishSchemaForManifestJsonSchemaObject,
  migrateAppProjectManifest,
  migrateBuildExtensionManifest,
  migrateCodegenExtensionManifest,
  migrateDeployExtensionManifest,
  migrateInfraExtensionManifest,
  migrateMetaExtensionManifest,
  migratePluginProjectManifest,
  migratePolywrapProjectManifest,
  migrateWorkflow,
} from "../lib/manifest";
import { defaultProjectManifestFiles } from "../lib/option-defaults";

import { JSONSchema4 } from "json-schema";
import {
  AppManifestFormats,
  AppManifestSchemaFiles,
  BuildManifestFormats,
  BuildManifestSchemaFiles,
  CodegenManifestFormats,
  CodegenManifestSchemaFiles,
  DeployManifestFormats,
  DeployManifestSchemaFiles,
  InfraManifestFormats,
  InfraManifestSchemaFiles,
  MetaManifestFormats,
  MetaManifestSchemaFiles,
  PluginManifestFormats,
  PluginManifestSchemaFiles,
  PolywrapManifestFormats,
  PolywrapManifestSchemaFiles,
  PolywrapWorkflowFormats,
  PolywrapWorkflowSchemaFiles,
  latestAppManifestFormat,
  latestBuildManifestFormat,
  latestCodegenManifestFormat,
  latestDeployManifestFormat,
  latestInfraManifestFormat,
  latestMetaManifestFormat,
  latestPluginManifestFormat,
  latestPolywrapManifestFormat,
  latestPolywrapWorkflowFormat,
} from "@polywrap/polywrap-manifest-types-js";
import { dereference } from "json-schema-ref-parser";
import fs from "fs";
import path from "path";

const pathStr = intlMsg.commands_manifest_options_m_path();

const defaultProjectManifestStr = defaultProjectManifestFiles.join(" | ");

const manifestTypes = [
  "project",
  "codegen",
  "build",
  "deploy",
  "infra",
  "meta",
  "workflow",
] as const;
type ManifestType = typeof manifestTypes[number];

type ManifestSchemaCommandOptions = {
  raw: boolean;
  manifestFile: ManifestType;
};

type ManifestMigrateCommandOptions = {
  manifestFile: string;
};

export const manifest: Command = {
  setup: (program: Program) => {
    const manifestCommand = program
      .command("manifest")
      .alias("m")
      .description(intlMsg.commands_manifest_description());

    manifestCommand
      .command("schema")
      .alias("s")
      .description(intlMsg.commands_manifest_command_s())
      .addArgument(
        new Argument(
          "type",
          intlMsg.commands_manifest_options_t({ default: manifestTypes[0] })
        )
          .argOptional()
          .choices(manifestTypes)
          .default(manifestTypes[0])
      )
      .option(
        `-r, --raw`,
        intlMsg.commands_manifest_command_s_option_r(),
        false
      )
      .option(
        `-m, --manifest-file <${pathStr}>`,
        `${intlMsg.commands_manifest_options_m({
          default: defaultProjectManifestStr,
        })}`
      )
      .action(async (type, options) => {
        await runSchemaCommand(type, options);
      });

    manifestCommand
      .command("migrate")
      .alias("m")
      .description(intlMsg.commands_manifest_command_m())
      .addArgument(
        new Argument(
          "type",
          intlMsg.commands_manifest_options_t({ default: manifestTypes[0] })
        )
          .argOptional()
          .choices(manifestTypes)
          .default(manifestTypes[0])
      )
      .option(
        `-m, --manifest-file <${pathStr}>`,
        `${intlMsg.commands_manifest_options_m({
          default: defaultProjectManifestStr,
        })}`
      )
      .action(async (type, options) => {
        await runMigrateCommand(type, options);
      });
  },
};

export const runSchemaCommand = async (
  type: ManifestType,
  options: ManifestSchemaCommandOptions
): Promise<void> => {
  let manifestfile = "";

  switch (type) {
    case "project":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultProjectManifestFiles
      );
      break;

    case "codegen":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultCodegenManifest
      );
      break;

    case "build":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultBuildManifest
      );
      break;

    case "meta":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultMetaManifest
      );
      break;

    case "deploy":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultDeployManifest
      );
      break;

    case "infra":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultInfraManifest
      );
      break;

    case "workflow":
      manifestfile = parseManifestFileOption(
        options.manifestFile,
        defaultWorkflowManifest
      );
      break;
  }

  const manifestString = fs.readFileSync(manifestfile, {
    encoding: "utf-8",
  });

  const manifestVersion = maybeGetManifestFormatVersion(manifestString);

  const schemasPackageDir = path.dirname(
    require.resolve("@polywrap/polywrap-manifest-schemas")
  );

  let manifestSchemaFile = "";
  let language: string | undefined;

  switch (type) {
    case "project":
      language = getProjectManifestLanguage(manifestString);

      if (!language) {
        throw new Error("Unsupported project type!");
      }

      if (isPolywrapManifestLanguage(language)) {
        maybeFailOnUnsupportedManifestFormat(
          manifestVersion,
          Object.values(PolywrapManifestFormats),
          manifestfile
        );

        manifestSchemaFile = path.join(
          schemasPackageDir,
          PolywrapManifestSchemaFiles[
            manifestVersion ?? latestPolywrapManifestFormat
          ]
        );
      } else if (isAppManifestLanguage(language)) {
        maybeFailOnUnsupportedManifestFormat(
          manifestVersion,
          Object.values(AppManifestFormats),
          manifestfile
        );

        manifestSchemaFile = path.join(
          schemasPackageDir,
          AppManifestSchemaFiles[manifestVersion ?? latestAppManifestFormat]
        );
      } else if (isPluginManifestLanguage(language)) {
        maybeFailOnUnsupportedManifestFormat(
          manifestVersion,
          Object.values(PluginManifestFormats),
          manifestfile
        );

        manifestSchemaFile = path.join(
          schemasPackageDir,
          PluginManifestSchemaFiles[
            manifestVersion ?? latestPluginManifestFormat
          ]
        );
      } else {
        throw new Error("Unsupported project type!");
      }
      break;

    case "codegen":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(CodegenManifestFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        CodegenManifestSchemaFiles[
          manifestVersion ?? latestCodegenManifestFormat
        ]
      );
      break;

    case "build":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(BuildManifestFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        BuildManifestSchemaFiles[manifestVersion ?? latestBuildManifestFormat]
      );
      break;

    case "meta":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(MetaManifestFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        MetaManifestSchemaFiles[manifestVersion ?? latestMetaManifestFormat]
      );
      break;

    case "deploy":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(DeployManifestFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        DeployManifestSchemaFiles[manifestVersion ?? latestDeployManifestFormat]
      );
      break;

    case "infra":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(InfraManifestFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        InfraManifestSchemaFiles[manifestVersion ?? latestInfraManifestFormat]
      );
      break;

    case "workflow":
      maybeFailOnUnsupportedManifestFormat(
        manifestVersion,
        Object.values(PolywrapWorkflowFormats),
        manifestfile
      );

      manifestSchemaFile = path.join(
        schemasPackageDir,
        PolywrapWorkflowSchemaFiles[
          manifestVersion ?? latestPolywrapWorkflowFormat
        ]
      );
      break;
  }

  const schemaString = fs.readFileSync(manifestSchemaFile, {
    encoding: "utf-8",
  });

  if (options.raw) {
    console.log(schemaString);
  } else {
    const schema = await dereference(JSON.parse(schemaString));

    console.log(
      getYamlishSchemaForManifestJsonSchemaObject(
        schema.properties as JSONSchema4
      )
    );
  }
};

const runMigrateCommand = async (
  type: ManifestType,
  options: ManifestMigrateCommandOptions
) => {
  let manifestFile = "";
  let manifestString: string;
  let language: string | undefined;

  switch (type) {
    case "project":
      manifestFile = parseManifestFileOption(
        options.manifestFile,
        defaultProjectManifestFiles
      );

      manifestString = fs.readFileSync(manifestFile, {
        encoding: "utf-8",
      });

      language = getProjectManifestLanguage(manifestString);

      if (!language) {
        console.log(intlMsg.commands_manifest_projectTypeError());
        process.exit(1);
      }

      if (isPolywrapManifestLanguage(language)) {
        return migrateManifestFile(
          manifestFile,
          migratePolywrapProjectManifest,
          latestPolywrapManifestFormat
        );
      } else if (isAppManifestLanguage(language)) {
        return migrateManifestFile(
          manifestFile,
          migrateAppProjectManifest,
          latestPolywrapManifestFormat
        );
      } else if (isPluginManifestLanguage(language)) {
        return migrateManifestFile(
          manifestFile,
          migratePluginProjectManifest,
          latestPolywrapManifestFormat
        );
      }

      console.log(intlMsg.commands_manifest_projectTypeError());
      process.exit(1);
      break;

    case "codegen":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultCodegenManifest),
        migrateCodegenExtensionManifest,
        latestCodegenManifestFormat
      );
      break;

    case "build":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultBuildManifest),
        migrateBuildExtensionManifest,
        latestBuildManifestFormat
      );
      break;

    case "meta":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultMetaManifest),
        migrateMetaExtensionManifest,
        latestMetaManifestFormat
      );
      break;

    case "deploy":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultDeployManifest),
        migrateDeployExtensionManifest,
        latestDeployManifestFormat
      );
      break;

    case "infra":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultInfraManifest),
        migrateInfraExtensionManifest,
        latestInfraManifestFormat
      );
      break;

    case "workflow":
      migrateManifestFile(
        parseManifestFileOption(options.manifestFile, defaultWorkflowManifest),
        migrateWorkflow,
        latestPolywrapWorkflowFormat
      );
      break;
  }
};

function migrateManifestFile(
  manifestFile: string,
  migrationFn: (input: string) => string,
  version: string
): void {
  const manifestFileName = path.basename(manifestFile);
  const manifestFileDir = path.dirname(manifestFile);

  console.log(
    intlMsg.commands_manifest_command_m_migrateManifestMessage({
      manifestFile: manifestFileName,
      version: version,
    })
  );

  const manifestString = fs.readFileSync(manifestFile, {
    encoding: "utf-8",
  });

  const outputManifestString = migrationFn(manifestString);

  // Cache the old manifest file
  const cache = new CacheDirectory({
    rootDir: manifestFileDir,
    subDir: "manifest",
  });
  cache.writeCacheFile(
    manifestFileName,
    fs.readFileSync(manifestFile, "utf-8")
  );

  console.log(
    intlMsg.commands_manifest_command_m_preserveManifestMessage({
      preservedFilePath: path.relative(
        manifestFileDir,
        cache.getCachePath(manifestFileName)
      ),
    })
  );

  fs.writeFileSync(manifestFile, outputManifestString, {
    encoding: "utf-8",
  });
}

function maybeFailOnUnsupportedManifestFormat(
  format: string | undefined,
  formats: string[],
  manifestFile: string
) {
  if (!format) {
    return;
  }

  if (!formats.includes(format)) {
    console.error(
      intlMsg.commands_manifest_formatError({
        fileName: path.relative(".", manifestFile),
        values: Object.values(PolywrapManifestFormats).join(", "),
      })
    );
    process.exit(1);
  }
}
