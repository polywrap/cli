/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/migrate-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/migrate-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */
import {
  AnyPolywrapWorkflow,
  PolywrapWorkflow,
  PolywrapWorkflowFormats,
} from ".";
import { findShortestMigrationPath } from "../../migrations";
import { migrators } from "./migrators";
import { ILogger } from "@polywrap/logging-js";

export function migratePolywrapWorkflow(
  manifest: AnyPolywrapWorkflow,
  to: PolywrapWorkflowFormats,
  logger?: ILogger
): PolywrapWorkflow {
  let from = manifest.format as PolywrapWorkflowFormats;

  if (!(Object.values(PolywrapWorkflowFormats).some(x => x === from))) {
    throw new Error(`Unrecognized PolywrapWorkflowFormat "${manifest.format}"`);
  }

  if (!(Object.values(PolywrapWorkflowFormats).some(x => x === to))) {
    throw new Error(`Unrecognized PolywrapWorkflowFormat "${to}"`);
  }

  const migrationPath = findShortestMigrationPath(migrators, from, to);
  if (!migrationPath) {
    throw new Error(
      `Migration path from PolywrapWorkflowFormat "${from}" to "${to}" is not available`
    );
  }

  let newManifest = manifest;

  for(const migrator of migrationPath){
    newManifest = migrator.migrate(newManifest, logger) as AnyPolywrapWorkflow;
  }

  return newManifest as PolywrapWorkflow;
}
