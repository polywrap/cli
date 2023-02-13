/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any */
import { template as schemaTemplate } from "./templates/schema.mustache";
import { addHeader } from "./templates/header.mustache";

import Mustache from "mustache";
import {
  addFirstLast,
  toGraphQLType,
  transformAbi,
  moduleCapabilities,
  addAnnotations,
} from "@polywrap/schema-parse";
import { GenericDefinition, WrapAbi } from "@polywrap/wrap-manifest-types-js";

// Remove mustache's built-in HTML escaping
Mustache.escape = (value) => value;

export function renderSchema(abi: WrapAbi, header: boolean): string {
  // Prepare the Abi for the renderer
  abi = transformAbi(abi, addFirstLast);
  abi = transformAbi(abi, toGraphQLType);
  abi = transformAbi(abi, moduleCapabilities());
  abi = transformAbi(abi, addAnnotations);
  abi = transformAbi(abi, {
    enter: {
      GenericDefinition: (def: GenericDefinition) => {
        const comment = (def as any).comment || null;
        return { ...def, comment };
      },
    },
  });

  let schema = Mustache.render(schemaTemplate, {
    abi,
  });

  if (header) {
    schema = addHeader(schema);
  }

  // Remove needless whitespace
  return schema.replace(/[\n]{2,}/gm, "\n\n");
}
