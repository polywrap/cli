import {
  createArrayPropertyDefinition,
  createMethodDefinition,
  createQueryDefinition,
  createScalarDefinition,
  createScalarPropertyDefinition,
  createArrayDefinition,
  createObjectPropertyDefinition,
  createObjectDefinition,
  createEnumDefinition,
  TypeInfo,
  createEnumPropertyDefinition,
  createObjectRef
} from "@web3api/schema-parse";

export const typeInfo: TypeInfo = {
  importedObjectTypes: [],
  importedEnumTypes: [],
  importedQueryTypes: [],
  queryTypes: [
    {
      ...createQueryDefinition({ type: "Mutation" }),
      methods: [
        {
          ...createMethodDefinition({
            type: "mutation",
            name: "method1",
            return: createScalarPropertyDefinition({
              name: "method1",
              type: "String",
              required: true
            })
          }),
          arguments: [
            createScalarPropertyDefinition({
              name: "str",
              required: true,
              type: "String"
            }),
            createScalarPropertyDefinition({
              name: "optStr",
              required: false,
              type: "String"
            }),
            createScalarPropertyDefinition({
              name: "u",
              required: true,
              type: "UInt"
            }),
            createArrayPropertyDefinition({
              name: "uArrayArray",
              required: true,
              type: "[[UInt]]",
              item: createArrayDefinition({
                name: "uArrayArray",
                required: false,
                type: "[UInt]",
                item: createScalarDefinition({
                  name: "uArrayArray",
                  required: false,
                  type: "UInt"
                })
              })
            })
          ]
        },
        {
          ...createMethodDefinition({
            type: "mutation",
            name: "method2",
            return: createArrayPropertyDefinition({
              name: "method2",
              type: "[Int32]",
              required: true,
              item: createScalarDefinition({
                name: "method2",
                required: true,
                type: "Int32"
              })
            })
          }),
          arguments: [
            createArrayPropertyDefinition({
              name: "arg",
              required: true,
              type: "[String]",
              item: createScalarDefinition({
                name: "arg",
                required: true,
                type: "String"
              })
            })
          ]
        }
      ]
    }
  ],
  objectTypes: [
    {
      ...createObjectDefinition({ type: "CustomMutationType" }),
      properties: [
        createScalarPropertyDefinition({ name: "str", type: "String", required: true }),
        createScalarPropertyDefinition({ name: "optStr", type: "String", required: false }),
        createScalarPropertyDefinition({ name: "u", type: "UInt", required: true }),
        createScalarPropertyDefinition({ name: "optU", type: "UInt", required: false }),
        createScalarPropertyDefinition({ name: "u8", type: "UInt8", required: true }),
        createScalarPropertyDefinition({ name: "i", type: "Int", required: true }),
        createScalarPropertyDefinition({ name: "i8", type: "Int8", required: true }),
        createScalarPropertyDefinition({ name: "bytes", type: "Bytes", required: true }),
        createArrayPropertyDefinition({
          name: "uArray",
          type: "[UInt]",
          required: true,
          item: createScalarDefinition({ name: "uArray", type: "UInt", required: true })
        }),
        createArrayPropertyDefinition({
          name: "uOptArray",
          type: "[UInt]",
          required: false,
          item: createScalarDefinition({ name: "uOptArray", type: "UInt", required: true })
        }),
        createArrayPropertyDefinition({
          name: "optStrOptArray",
          type: "[String]",
          required: false,
          item: createScalarDefinition({ name: "optStrOptArray", type: "String", required: false })
        }),
        createArrayPropertyDefinition({
          name: "crazyArray",
          type: "[[[[UInt32]]]]",
          required: false,
          item: createArrayDefinition({
            name: "crazyArray",
            type: "[[[UInt32]]]",
            required: false,
            item: createArrayDefinition({
              name: "crazyArray",
              type: "[[UInt32]]",
              required: true,
              item: createArrayDefinition({
                name: "crazyArray",
                type: "[UInt32]",
                required: false,
                item: createScalarDefinition({ name: "crazyArray", type: "UInt32", required: true })
              })
            })
          })
        }),
        createObjectPropertyDefinition({
          name: "commonType",
          type: "CommonType",
          required: true
        }),
      ],
    },
    {
      ...createObjectDefinition({ type: "AnotherMutationType" }),
      properties: [createScalarPropertyDefinition({ name: "prop", type: "String" })],
    },
    {
      ...createObjectDefinition({ type: "CommonType" }),
      properties: [
        createScalarPropertyDefinition({ name: "prop", type: "UInt8", required: true }),
        createObjectPropertyDefinition({ name: "nestedObject", type: "NestedType", required: true }),
        createArrayPropertyDefinition({
          name: "objectArray",
          type: "[[ArrayObject]]",
          required: true,
          item: createArrayDefinition({
            name: "objectArray",
            type: "[ArrayObject]",
            required: false,
            item: createObjectRef({
              name: "objectArray",
              type: "ArrayObject",
              required: false
            })
          })
        }),
        createEnumPropertyDefinition({
          name: "enum",
          type: "CommonEnum",
          required: true
        })
      ],
    },
    {
      ...createObjectDefinition({
        type: "NestedType"
      }),
      properties: [
        createScalarPropertyDefinition({ name: "prop", type: "String", required: true }),
      ],
    },
    {
      ...createObjectDefinition({
        type: "ArrayObject"
      }),
      properties: [
        createScalarPropertyDefinition({ name: "prop", type: "String", required: true }),
      ],
    }
  ],
  enumTypes: [
    createEnumDefinition({
      type: "CommonEnum",
      constants: ["STRING", "BYTES"]
    })
  ]
}
