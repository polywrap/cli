import {
  createImportedModuleDefinition,
  createMethodDefinition,
  createPropertyDefinition,
} from "..";
import { extractImportedDefinition } from "./utils/imported-types-utils";
import {
  extractEnvDirective,
  extractInputValueDefinition,
  extractListType,
  extractNamedType,
  State,
} from "./utils/module-types-utils";
import { extractAnnotateDirective } from "./utils/object-types-utils";

import {
  ASTVisitor,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from "graphql";
import {
  ImportedModuleDefinition,
  MapDefinition,
  WrapAbi,
} from "@polywrap/wrap-manifest-types-js";

const visitorEnter = (
  importedModuleTypes: ImportedModuleDefinition[],
  state: State
) => ({
  ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) => {
    const imported = extractImportedDefinition(node, "module");

    if (!imported) {
      return;
    }

    const dir =
      node.directives &&
      node.directives.find((dir) => dir.name.value === "enabled_interface");
    const isInterface = dir ? true : false;

    const importedType = createImportedModuleDefinition({
      uri: imported.uri,
      namespace: imported.namespace,
      nativeType: imported.nativeType,
      isInterface: isInterface,
      comment: node.description?.value,
    });
    importedModuleTypes.push(importedType);
    state.currentImport = importedType;
  },
  FieldDefinition: (node: FieldDefinitionNode) => {
    const importDef = state.currentImport;

    if (!importDef) {
      return;
    }

    const name = node.name.value;

    const { type, def } = extractAnnotateDirective(node, name);

    const returnType = createPropertyDefinition({
      type: type ? type : "N/A",
      name: node.name.value,
      map: def
        ? ({ ...def, name: node.name.value } as MapDefinition)
        : undefined,
      required: def && def.required ? true : undefined,
    });

    const method = createMethodDefinition({
      name: node.name.value,
      return: returnType,
      comment: node.description?.value,
    });

    const envDirDefinition = extractEnvDirective(node);

    if (envDirDefinition) {
      method.env = envDirDefinition;
    }

    if (!importDef.methods) {
      importDef.methods = [];
    }

    importDef.methods.push(method);
    state.currentMethod = method;
    state.currentReturn = returnType;
  },
  InputValueDefinition: (node: InputValueDefinitionNode) => {
    extractInputValueDefinition(node, state);
  },
  NonNullType: (_node: NonNullTypeNode) => {
    state.nonNullType = true;
  },
  NamedType: (node: NamedTypeNode) => {
    extractNamedType(node, state);
  },
  ListType: (_node: ListTypeNode) => {
    extractListType(state);
  },
});

const visitorLeave = (state: State) => ({
  ObjectTypeDefinition: (_node: ObjectTypeDefinitionNode) => {
    state.currentImport = undefined;
  },
  FieldDefinition: (_node: FieldDefinitionNode) => {
    state.currentMethod = undefined;
    state.currentReturn = undefined;
  },
  InputValueDefinition: (_node: InputValueDefinitionNode) => {
    state.currentArgument = undefined;
  },
  NonNullType: (_node: NonNullTypeNode) => {
    state.nonNullType = undefined;
  },
});

export const getImportedModuleTypesVisitor = (abi: WrapAbi): ASTVisitor => {
  const state: State = {};

  return {
    enter: visitorEnter(abi.importedModuleTypes || [], state),
    leave: visitorLeave(state),
  };
};
