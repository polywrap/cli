import {
  TypeInfo,
  ImportedObjectDefinition,
  createImportedObjectDefinition,
  createInterfaceImplementedDefinition,
} from "../typeInfo";
import {
  extractFieldDefinition,
  extractListType,
  extractNamedType,
  State,
} from "./object-types-utils";
import { extractImportedDefinition } from "./imported-types-utils";

import {
  ObjectTypeDefinitionNode,
  NonNullTypeNode,
  NamedTypeNode,
  ListTypeNode,
  FieldDefinitionNode,
  ASTVisitor,
} from "graphql";

const visitorEnter = (
  importedObjectTypes: ImportedObjectDefinition[],
  state: State
) => ({
  ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) => {
    const imported = extractImportedDefinition(node);

    if (!imported) {
      return;
    }

    const importedType = createImportedObjectDefinition({
      type: node.name.value,
      uri: imported.uri,
      namespace: imported.namespace,
      nativeType: imported.nativeType,
      interfaces: node.interfaces?.map((x) =>
        createInterfaceImplementedDefinition({ type: x.name.value })
      ),
      comment: node.description?.value,
    });
    importedObjectTypes.push(importedType);
    state.currentType = importedType;
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
  FieldDefinition: (node: FieldDefinitionNode) => {
    extractFieldDefinition(node, state);
  },
});

const visitorLeave = (state: State) => ({
  ObjectTypeDefinition: (_node: ObjectTypeDefinitionNode) => {
    state.currentType = undefined;
  },
  FieldDefinition: (_node: FieldDefinitionNode) => {
    state.currentProperty = undefined;
  },
  NonNullType: (_node: NonNullTypeNode) => {
    state.nonNullType = false;
  },
});

export const getImportedObjectTypesVisitor = (
  typeInfo: TypeInfo
): ASTVisitor => {
  const state: State = {};

  return {
    enter: visitorEnter(typeInfo.importedObjectTypes, state),
    leave: visitorLeave(state),
  };
};
