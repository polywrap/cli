/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/validate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/validate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyDocsManifest,
  DocsManifestFormats
} from ".";

import DocsManifestSchema_0_1_0 from "@polywrap/polywrap-manifest-schemas/formats/polywrap.docs/0.1.0.json";

import {
  Schema,
  Validator,
  ValidationError,
  ValidatorResult
} from "jsonschema";

type DocsManifestSchemas = {
  [key in DocsManifestFormats]: Schema | undefined
};

const schemas: DocsManifestSchemas = {
  // NOTE: Patch fix for backwards compatability
  "0.1": DocsManifestSchema_0_1_0,
  "0.1.0": DocsManifestSchema_0_1_0,
};

const validator = new Validator();


export function validateDocsManifest(
  manifest: AnyDocsManifest,
  extSchema: Schema | undefined = undefined
): void {
  const schema = schemas[manifest.format as DocsManifestFormats];

  if (!schema) {
    throw Error(`Unrecognized DocsManifest schema format "${manifest.format}"\nmanifest: ${JSON.stringify(manifest, null, 2)}`);
  }

  const throwIfErrors = (result: ValidatorResult) => {
    if (result.errors.length) {
      throw new Error([
        `Validation errors encountered while sanitizing DocsManifest format ${manifest.format}`,
        ...result.errors.map((error: ValidationError) => error.toString())
      ].join("\n"));
    }
  };

  throwIfErrors(validator.validate(manifest, schema));

  if (extSchema) {
    throwIfErrors(validator.validate(manifest, extSchema));
  }
}