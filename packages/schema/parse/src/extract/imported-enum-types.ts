import {
  TypeInfo,
  createImportedEnumDefinition,
  ImportedEnumDefinition,
} from "../typeInfo";
import { extractImportedDefinition } from "./imported-types-utils";

import { ASTVisitor, EnumTypeDefinitionNode } from "graphql";

const visitorEnter = (importedEnumTypes: ImportedEnumDefinition[]) => ({
  EnumTypeDefinition: (node: EnumTypeDefinitionNode) => {
    const constants: string[] = [];
    const imported = extractImportedDefinition(node);

    if (!imported) {
      return;
    }

    if (node.values) {
      for (const value of node.values) {
        constants.push(value.name.value);
      }
    }

    const enumType = createImportedEnumDefinition({
      type: node.name.value,
      constants,
      uri: imported.uri,
      namespace: imported.namespace,
      nativeType: imported.nativeType,
      comment: node.description?.value,
    });
    importedEnumTypes.push(enumType);
  },
});

export const getImportedEnumTypesVisitor = (
  typeInfo: TypeInfo
): ASTVisitor => ({
  enter: visitorEnter(typeInfo.importedEnumTypes),
});
