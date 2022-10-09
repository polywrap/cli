import { displayPath, Logger, logActivity, intlMsg } from "../../";

import {
  BuildManifest,
  PolywrapManifest,
  MetaManifest,
  PluginManifest,
} from "@polywrap/polywrap-manifest-types-js";
import { writeFileSync, normalizePath } from "@polywrap/os-js";
import YAML from "yaml";
import path from "path";
import fs from "fs";

export async function outputManifest(
  manifest: PolywrapManifest | BuildManifest | MetaManifest | PluginManifest,
  manifestPath: string,
  logger: Logger
): Promise<unknown> {
  const run = () => {
    const removeUndefinedProps = (
      obj: unknown
    ): Record<string, unknown> | Array<unknown> | undefined => {
      if (!obj || typeof obj !== "object") {
        return undefined;
      }

      if (Array.isArray(obj)) {
        return obj;
      }

      const input = obj as Record<string, unknown>;
      const newObj: Record<string, unknown> = {};

      Object.keys(input).forEach((key) => {
        if (input[key]) {
          if (typeof input[key] === "object") {
            const result = removeUndefinedProps(input[key]);

            if (result) {
              newObj[key] = result;
            }
          } else if (!key.startsWith("__")) {
            newObj[key] = input[key];
          }
        }
      });

      return newObj;
    };

    const sanitizedManifest = removeUndefinedProps(manifest);
    const isYaml =
      manifestPath.endsWith(".yaml") || manifestPath.endsWith(".yml");
    const str = isYaml
      ? YAML.stringify(sanitizedManifest, null, 2)
      : JSON.stringify(sanitizedManifest, null, 2);

    if (!str) {
      const noDumpMessage = intlMsg.lib_helpers_manifest_unableToDump({
        manifest: `${manifest}`,
      });
      throw Error(noDumpMessage);
    }

    // Create folders if they don't exist
    const manifestDir = path.dirname(manifestPath);
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }

    writeFileSync(manifestPath, str, "utf-8");
  };

  manifestPath = displayPath(manifestPath);
  return await logActivity(
    logger,
    intlMsg.lib_helpers_manifest_outputText({
      path: normalizePath(manifestPath),
    }),
    intlMsg.lib_helpers_manifest_outputError({
      path: normalizePath(manifestPath),
    }),
    intlMsg.lib_helpers_manifest_outputWarning({
      path: normalizePath(manifestPath),
    }),
    (): Promise<unknown> => {
      return Promise.resolve(run());
    }
  );
}
