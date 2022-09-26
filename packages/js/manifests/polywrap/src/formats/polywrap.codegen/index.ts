/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  CodegenManifest as CodegenManifest_0_1_0,
} from "./0.1.0";

export {
  CodegenManifest_0_1_0,
};

export enum CodegenManifestFormats {
  // NOTE: Patch fix for backwards compatability
  "v0.1" = "0.1",
  "v0.1.0" = "0.1.0",
}

export const CodegenManifestSchemaFiles: Record<string, string> = {
  // NOTE: Patch fix for backwards compatability
  "0.1": "formats/polywrap.codegen/0.1.0.json",
  "0.1.0": "formats/polywrap.codegen/0.1.0.json",
}

export type AnyCodegenManifest =
  | CodegenManifest_0_1_0



export type CodegenManifest = CodegenManifest_0_1_0;

export const latestCodegenManifestFormat = CodegenManifestFormats["v0.1.0"]

export { migrateCodegenManifest } from "./migrate";

export { deserializeCodegenManifest } from "./deserialize";

export { validateCodegenManifest } from "./validate";
