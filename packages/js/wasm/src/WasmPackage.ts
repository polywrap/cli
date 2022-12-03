import { IFileReader } from "./IFileReader";
import { IWasmPackage } from "./IWasmPackage";
import { WasmWrapper } from "./WasmWrapper";
import { WRAP_MODULE_PATH, WRAP_MANIFEST_PATH } from "./constants";
import { createWasmPackage } from "./helpers/createWasmPackage";

import { GetManifestOptions, Wrapper } from "@polywrap/core-js";
import { Result, ResultErr, ResultOk } from "@polywrap/result";

export class WasmPackage implements IWasmPackage {
  constructor(private readonly fileReader: IFileReader) {}

  static from(manifestBuffer: Uint8Array, wasmModule: Uint8Array): WasmPackage;
  static from(
    manifestBuffer: Uint8Array,
    wasmModule: Uint8Array,
    fileReader: IFileReader
  ): WasmPackage;
  static from(manifestBuffer: Uint8Array, fileReader: IFileReader): WasmPackage;
  static from(fileReader: IFileReader): WasmPackage;
  static from(
    manifestBufferOrFileReader: Uint8Array | IFileReader,
    wasmModuleOrFileReader?: Uint8Array | IFileReader,
    fileReader?: IFileReader
  ): WasmPackage {
    return createWasmPackage(
      manifestBufferOrFileReader,
      wasmModuleOrFileReader,
      fileReader
    );
  }

  async getManifest(_?: GetManifestOptions): Promise<Result<unknown, Error>> {
    const result = await this.fileReader.readFile(WRAP_MANIFEST_PATH);

    if (!result.ok) {
      return result;
    }

    const wrapManifest = result.value;
    return ResultOk(wrapManifest);
  }

  async getWasmModule(): Promise<Result<Uint8Array, Error>> {
    const result = await this.fileReader.readFile(WRAP_MODULE_PATH);

    if (!result.ok) {
      return ResultErr(Error(`Wrapper does not contain a wasm module`));
    }

    return result;
  }

  async createWrapper(
    options?: GetManifestOptions
  ): Promise<Result<Wrapper, Error>> {
    const result = await this.getManifest(options);

    if (!result.ok) {
      return result;
    }

    return ResultOk(new WasmWrapper(result.value, this.fileReader));
  }
}
