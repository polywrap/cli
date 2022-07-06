/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/validate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/validate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyPolywrapManifest,
  PolywrapManifestFormats
} from ".";

import schema_0_1_0 from "@polywrap/polywrap-manifest-schemas/formats/polywrap/0.1.0.json";

import {
  Schema,
  Validator,
  ValidationError,
  ValidatorResult
} from "jsonschema";

type PolywrapManifestSchemas = {
  [key in PolywrapManifestFormats]: Schema | undefined
};

const schemas: PolywrapManifestSchemas = {
  "0.1.0": schema_0_1_0,
};

const validator = new Validator();


export function validatePolywrapManifest(
  manifest: AnyPolywrapManifest,
  extSchema: Schema | undefined = undefined
): void {
  const schema = schemas[manifest.format as PolywrapManifestFormats];

  if (!schema) {
    throw Error(`Unrecognized PolywrapManifest schema format "${manifest.format}"\nmanifest: ${JSON.stringify(manifest, null, 2)}`);
  }

  const throwIfErrors = (result: ValidatorResult) => {
    if (result.errors.length) {
      throw new Error([
        `Validation errors encountered while sanitizing PolywrapManifest format ${manifest.format}`,
        ...result.errors.map((error: ValidationError) => error.toString())
      ].join("\n"));
    }
  };

  throwIfErrors(validator.validate(manifest, schema));

  if (extSchema) {
    throwIfErrors(validator.validate(manifest, extSchema));
  }
}
