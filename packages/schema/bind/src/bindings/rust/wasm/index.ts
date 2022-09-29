import * as Transforms from "./transforms";
import { Functions } from "../";
import { GenerateBindingFn, renderTemplates } from "../..";
import { loadSubTemplates } from "../../utils";
import { BindOptions, BindOutput } from "../../..";

import {
  transformAbi,
  extendType,
  addFirstLast,
  toPrefixedGraphQLType,
  hasImports,
  methodParentPointers,
} from "@polywrap/schema-parse";
import { OutputEntry, readDirectorySync } from "@polywrap/os-js";
import path from "path";
import { WrapAbi } from "@polywrap/wrap-manifest-types-js/src";

const templatesDir = readDirectorySync(path.join(__dirname, "./templates"));
const subTemplates = loadSubTemplates(templatesDir.entries);
const templatePath = (subpath: string) =>
  path.join(__dirname, "./templates", subpath);

const toLower = (type: string) => Functions.toLower()(type, (str) => str);

export const generateBinding: GenerateBindingFn = (
  options: BindOptions
): BindOutput => {
  const result: BindOutput = {
    output: {
      entries: [],
    },
    outputDirAbs: options.outputDirAbs,
  };
  const output = result.output;
  const abi = applyTransforms(options.abi);

  // Generate object type folders
  if (abi.objectTypes) {
    for (const objectType of abi.objectTypes) {
      output.entries.push({
        type: "Directory",
        name: Functions.detectKeyword()(toLower(objectType.type), (str) => str),
        data: renderTemplates(
          templatePath("object-type"),
          objectType,
          subTemplates
        ),
      });
    }
  }

  // Generate env type folders
  if (abi.envType) {
    output.entries.push({
      type: "Directory",
      name: Functions.detectKeyword()(toLower(abi.envType.type), (str) => str),
      data: renderTemplates(
        templatePath("env-type"),
        abi.envType,
        subTemplates
      ),
    });
  }

  // Generate imported folder
  const importEntries: OutputEntry[] = [];

  // Generate imported module type folders
  if (abi.importedModuleTypes) {
    for (const importedModuleType of abi.importedModuleTypes) {
      importEntries.push({
        type: "Directory",
        name: toLower(importedModuleType.type),
        data: renderTemplates(
          templatePath("imported/module-type"),
          importedModuleType,
          subTemplates
        ),
      });
    }
  }

  // Generate imported enum type folders
  if (abi.importedEnumTypes) {
    for (const importedEnumType of abi.importedEnumTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.detectKeyword()(
          toLower(importedEnumType.type),
          (str) => str
        ),
        data: renderTemplates(
          templatePath("imported/enum-type"),
          importedEnumType,
          subTemplates
        ),
      });
    }
  }

  // Generate imported object type folders
  if (abi.importedObjectTypes) {
    for (const importedObectType of abi.importedObjectTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.detectKeyword()(
          toLower(importedObectType.type),
          (str) => str
        ),
        data: renderTemplates(
          templatePath("imported/object-type"),
          importedObectType,
          subTemplates
        ),
      });
    }
  }

  // Generate imported env type folders
  if (abi.importedEnvTypes) {
    for (const importedEnvType of abi.importedEnvTypes) {
      importEntries.push({
        type: "Directory",
        name: Functions.detectKeyword()(
          toLower(importedEnvType.type),
          (str) => str
        ),
        data: renderTemplates(
          templatePath("imported/env-type"),
          importedEnvType,
          subTemplates
        ),
      });
    }
  }

  if (importEntries.length > 0) {
    output.entries.push({
      type: "Directory",
      name: "imported",
      data: [
        ...importEntries,
        ...renderTemplates(templatePath("imported"), abi, subTemplates),
      ],
    });
  }

  // Generate interface type folders
  if (abi.interfaceTypes) {
    for (const interfaceType of abi.interfaceTypes) {
      output.entries.push({
        type: "Directory",
        name: toLower(interfaceType.type),
        data: renderTemplates(
          templatePath("interface-type"),
          interfaceType,
          subTemplates
        ),
      });
    }
  }

  // Generate module type folders
  if (abi.moduleType) {
    output.entries.push({
      type: "Directory",
      name: toLower(abi.moduleType.type),
      data: renderTemplates(templatePath("module-type"), abi, subTemplates),
    });
  }

  // Generate enum type folders
  if (abi.enumTypes) {
    for (const enumType of abi.enumTypes) {
      output.entries.push({
        type: "Directory",
        name: Functions.detectKeyword()(toLower(enumType.type), (str) => str),
        data: renderTemplates(
          templatePath("enum-type"),
          enumType,
          subTemplates
        ),
      });
    }
  }

  // Generate root entry file
  const view = { ...options.config, ...abi };
  output.entries.push(...renderTemplates(templatePath(""), view, subTemplates));

  return result;
};

function applyTransforms(abi: WrapAbi): WrapAbi {
  const transforms = [
    extendType(Functions),
    addFirstLast,
    toPrefixedGraphQLType,
    hasImports,
    methodParentPointers(),
    Transforms.propertyDeps(),
    Transforms.byRef(),
  ];

  for (const transform of transforms) {
    abi = transformAbi(abi, transform);
  }
  return abi;
}
