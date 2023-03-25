import { WrapAbi } from "@polywrap/schema-parse";

export const abi: WrapAbi = {
  version: "0.1",
  "objectTypes": [
    {
      "type": "ExternalType",
      "kind": 1,
      "properties": [
        {
          "type": "String",
          "name": "str",
          "kind": 34,
          "scalar": {
            "type": "String",
            "name": "str",
            "kind": 4
          }
        }
      ],
      "interfaces": []
    }
  ],
  "enumTypes": [],
  "interfaceTypes": [],
  "importedObjectTypes": [],
  "importedModuleTypes": [],
  "importedEnumTypes": [],
  "importedEnvTypes": [],
  "envType": {
    "type": "Env",
    "kind": 65536,
    "properties": [
      {
        "type": "ExternalType",
        "name": "externalProp",
        "kind": 34,
        "object": {
          "type": "ExternalType",
          "name": "externalProp",
          "kind": 8192
        }
      }
    ],
    "interfaces": []
  },
  "moduleType": {
    "type": "Module",
    "kind": 128,
    "methods": [
      {
        "type": "Method",
        "name": "envMethod",
        "required": true,
        "kind": 64,
        "arguments": [
          {
            "type": "String",
            "name": "arg",
            "required": true,
            "kind": 34,
            "scalar": {
              "type": "String",
              "name": "arg",
              "required": true,
              "kind": 4
            }
          }
        ],
        "return": {
          "type": "String",
          "name": "envMethod",
          "required": true,
          "kind": 34,
          "scalar": {
            "type": "String",
            "name": "envMethod",
            "required": true,
            "kind": 4
          }
        },
        "env": {
          "required": true
        }
      },
      {
        "type": "Method",
        "name": "optEnvMethod",
        "required": true,
        "kind": 64,
        "arguments": [
          {
            "type": "String",
            "name": "arg",
            "required": true,
            "kind": 34,
            "scalar": {
              "type": "String",
              "name": "arg",
              "required": true,
              "kind": 4
            }
          }
        ],
        "return": {
          "type": "String",
          "name": "optEnvMethod",
          "required": true,
          "kind": 34,
          "scalar": {
            "type": "String",
            "name": "optEnvMethod",
            "required": true,
            "kind": 4
          }
        },
        "env": {
          "required": false
        }
      }
    ],
    "imports": [],
    "interfaces": []
  }
};
