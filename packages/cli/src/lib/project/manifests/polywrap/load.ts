import {
  displayPath,
  intlMsg,
  loadEnvironmentVariables,
  PolywrapManifestLanguage,
  Logger,
  logActivity,
} from "../../../";

import {
  PolywrapManifest,
  BuildManifest,
  MetaManifest,
  DeployManifest,
  deserializePolywrapManifest,
  deserializeBuildManifest,
  deserializeMetaManifest,
  deserializeDeployManifest,
  InfraManifest,
  deserializeInfraManifest,
  PolywrapWorkflow,
  deserializePolywrapWorkflow,
} from "@polywrap/polywrap-manifest-types-js";
import { Schema as JsonSchema } from "jsonschema";
import path from "path";
import fs from "fs";

export const defaultPolywrapManifest = ["polywrap.yaml", "polywrap.yml"];

export async function loadPolywrapManifest(
  manifestPath: string,
  logger: Logger
): Promise<PolywrapManifest> {
  const run = (): Promise<PolywrapManifest> => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    try {
      const result = deserializePolywrapManifest(manifest);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<PolywrapManifest>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return await run();
    }
  );
}

export const defaultBuildManifest = [
  "polywrap.build.yaml",
  "polywrap.build.yml",
];

export async function loadBuildManifest(
  language: PolywrapManifestLanguage,
  manifestPath: string,
  logger: Logger
): Promise<BuildManifest> {
  const run = (): BuildManifest => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    let extSchema: JsonSchema | undefined = undefined;

    if (language.startsWith("wasm")) {
      const extSchemaPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "defaults",
        "build-strategies",
        language,
        "manifest.ext.json"
      );

      extSchema = JSON.parse(
        fs.readFileSync(extSchemaPath, "utf-8")
      ) as JsonSchema;
    }

    return deserializeBuildManifest(manifest, {
      extSchema: extSchema,
    });
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<BuildManifest>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return run();
    }
  );
}

export const defaultDeployManifest = [
  "polywrap.deploy.yaml",
  "polywrap.deploy.yml",
];

export async function loadDeployManifest(
  manifestPath: string,
  logger: Logger
): Promise<DeployManifest> {
  const run = (): Promise<DeployManifest> => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    try {
      let result = deserializeDeployManifest(manifest);
      result = (loadEnvironmentVariables(
        (result as unknown) as Record<string, unknown>
      ) as unknown) as DeployManifest;
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<DeployManifest>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return await run();
    }
  );
}

export async function loadDeployManifestExt(
  manifestExtPath: string,
  logger: Logger
): Promise<JsonSchema | undefined> {
  const run = (): JsonSchema | undefined => {
    const configSchemaPath = path.join(
      path.dirname(manifestExtPath),
      "/polywrap.deploy.ext.json"
    );

    let extSchema: JsonSchema | undefined;

    if (fs.existsSync(configSchemaPath)) {
      extSchema = JSON.parse(
        fs.readFileSync(configSchemaPath, "utf-8")
      ) as JsonSchema;
    }

    return extSchema;
  };

  manifestExtPath = displayPath(manifestExtPath);
  return await logActivity(
    logger,
    intlMsg.lib_helpers_deployManifestExt_loadText({ path: manifestExtPath }),
    intlMsg.lib_helpers_deployManifestExt_loadError({
      path: manifestExtPath,
    }),
    intlMsg.lib_helpers_deployManifestExt_loadWarning({
      path: manifestExtPath,
    }),
    async () => {
      return run();
    }
  );
}

export const defaultMetaManifest = ["polywrap.meta.yaml", "polywrap.meta.yml"];

export async function loadMetaManifest(
  manifestPath: string,
  logger: Logger
): Promise<MetaManifest> {
  const run = (): Promise<MetaManifest> => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    try {
      const result = deserializeMetaManifest(manifest);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<MetaManifest>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return await run();
    }
  );
}

export const defaultInfraManifest = [
  "polywrap.infra.yaml",
  "polywrap.infra.yml",
];

export async function loadInfraManifest(
  manifestPath: string,
  logger: Logger
): Promise<InfraManifest> {
  const run = (): Promise<InfraManifest> => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    try {
      let result = deserializeInfraManifest(manifest);
      result = (loadEnvironmentVariables(
        (result as unknown) as Record<string, unknown>
      ) as unknown) as InfraManifest;
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<InfraManifest>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return await run();
    }
  );
}

export const defaultWorkflowManifest = [
  "polywrap.test.yaml",
  "polywrap.test.yml",
];

export async function loadWorkflowManifest(
  manifestPath: string,
  logger: Logger
): Promise<PolywrapWorkflow> {
  const run = (): Promise<PolywrapWorkflow> => {
    const manifest = fs.readFileSync(manifestPath, "utf-8");

    if (!manifest) {
      const noLoadMessage = intlMsg.lib_helpers_manifest_unableToLoad({
        path: `${manifestPath}`,
      });
      throw Error(noLoadMessage);
    }

    try {
      const result = deserializePolywrapWorkflow(manifest);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity<PolywrapWorkflow>(
    logger,
    intlMsg.lib_helpers_manifest_loadText({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadError({ path: manifestPath }),
    intlMsg.lib_helpers_manifest_loadWarning({ path: manifestPath }),
    async () => {
      return await run();
    }
  );
}
