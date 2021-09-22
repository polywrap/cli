import { TypeInfo, EnumDefinition, createEnumDefinition } from "../typeInfo";

import { ASTVisitor, DirectiveNode, EnumTypeDefinitionNode } from "graphql";

const visitorEnter = (enumTypes: EnumDefinition[]) => ({
  EnumTypeDefinition: (node: EnumTypeDefinitionNode) => {
    // Skip imported types
    if (
      node.directives &&
      node.directives.findIndex(
        (dir: DirectiveNode) => dir.name.value === "imported"
      ) > -1
    ) {
      return;
    }

    const constants: string[] = [];
    if (node.values) {
      for (const value of node.values) {
        constants.push(value.name.value);
      }
    }

    const enumType = createEnumDefinition({
      type: node.name.value,
      constants,
      comment: node.description?.value,
    });
    enumTypes.push(enumType);
  },
});

export const getEnumTypesVisitor = (typeInfo: TypeInfo): ASTVisitor => ({
  enter: visitorEnter(typeInfo.enumTypes),
});
