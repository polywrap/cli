import { TypeInfoTransforms } from ".";
import {
  InterfaceDefinition,
  CapabilityDefinition,
  TypeInfo,
} from "../typeInfo";

export interface ModuleCapability {
  type: string;
  uri: string;
  namespace: string;
}

export function moduleCapabilities(): TypeInfoTransforms {
  const capabilities: ModuleCapability[] = [];

  const enabledInterfaces: Set<string> = new Set();

  return {
    enter: {
      InterfaceDefinition: (def: InterfaceDefinition) => {
        for (const type in def.capabilities) {
          const info = def.capabilities[type as keyof CapabilityDefinition];
          if (info.enabled) {
            capabilities.push({
              uri: def.uri,
              namespace: def.namespace,
              type,
            });
            enabledInterfaces.add(def.namespace);
          }
        }
        return def;
      },
    },
    leave: {
      TypeInfo: (info: TypeInfo) => {
        if (info.moduleType) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (info.moduleType as any).capabilities = capabilities;
        }

        for (const importedModuleDef of info.importedModuleTypes) {
          if (enabledInterfaces.has(importedModuleDef.type)) {
            importedModuleDef.isInterface = true;
          }
        }

        return info;
      },
    },
  };
}
