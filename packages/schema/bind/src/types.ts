import { Abi } from "@polywrap/abi-types";
import { OutputDirectory } from "@polywrap/os-js";

export type BindLanguage = "wasm-as" | "wasm-rs" | "plugin-ts" | "app-ts";

export interface BindOutput {
  output: OutputDirectory;
  outputDirAbs: string;
}

export interface BindOptions {
  projectName: string;
  bindLanguage: BindLanguage;
  abi: Abi;
  config?: Record<string, unknown>;
  outputDirAbs: string;
}
