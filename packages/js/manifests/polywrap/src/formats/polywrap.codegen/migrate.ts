/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/migrate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/migrate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyCodegenManifest,
  CodegenManifest,
  CodegenManifestFormats,
  latestCodegenManifestFormat
} from ".";


type Migrator = {
  [key in CodegenManifestFormats]?: (m: AnyCodegenManifest) => CodegenManifest;
};

export const migrators: Migrator = {
};

export function migrateCodegenManifest(
  manifest: AnyCodegenManifest,
  to: CodegenManifestFormats
): CodegenManifest {
  let from = manifest.format as CodegenManifestFormats;

  // HACK: Patch fix for backwards compatability
  if(from === "0.1" && ("0.1.0" in migrators)) {
    from = "0.1.0" as CodegenManifestFormats;
  }

  if (from === latestCodegenManifestFormat) {
    return manifest as CodegenManifest;
  }

  if (!(Object.values(CodegenManifestFormats).some(x => x === from))) {
    throw new Error(`Unrecognized CodegenManifestFormat "${manifest.format}"`);
  }

  throw new Error(`This should never happen, CodegenManifest migrators is empty. from: ${from}, to: ${to}`);
}
