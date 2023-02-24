/* eslint-disable @typescript-eslint/naming-convention */
import { WrapExports } from "./types";
import { createImports } from "./imports";
import { IFileReader } from "./IFileReader";
import { WRAP_MODULE_PATH } from "./constants";
import { createWasmWrapper } from "./helpers/createWasmWrapper";

import {
  getInitialPageCount,
  PoolHandle,
  WasmMemoryPool,
} from "@polywrap/wasm-memory-js";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { msgpackEncode } from "@polywrap/msgpack-js";
import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import {
  CoreClient,
  GetFileOptions,
  GetManifestOptions,
  InvocableResult,
  InvokeOptions,
  isBuffer,
  Wrapper,
  WrapError,
  WrapErrorCode,
  ErrorSource,
} from "@polywrap/core-js";
import { Result, ResultErr, ResultOk } from "@polywrap/result";

export interface State {
  method: string;
  args: Uint8Array;
  invoke: {
    result?: Uint8Array;
    error?: string;
  };
  subinvoke: {
    result?: Uint8Array;
    error?: string;
    args: unknown[];
  };
  subinvokeImplementation: {
    result?: Uint8Array;
    error?: string;
    args: unknown[];
  };
  invokeResult?: Result<unknown>;
  getImplementationsResult?: Uint8Array;
  env: Uint8Array;
}

const EMPTY_ENCODED_OBJECT = msgpackEncode({});

export class WasmWrapper implements Wrapper {
  public static requiredExports: readonly string[] = ["_wrap_invoke"];

  private _wasmModule?: Uint8Array;
  private _wasmMemoryPool?: WasmMemoryPool;

  constructor(
    private _manifest: WrapManifest,
    private _fileReader: IFileReader
  ) {}

  static async from(
    manifestBuffer: Uint8Array,
    wasmModule: Uint8Array,
    options?: GetManifestOptions
  ): Promise<WasmWrapper>;
  static async from(
    manifestBuffer: Uint8Array,
    wasmModule: Uint8Array,
    fileReader: IFileReader,
    options?: GetManifestOptions
  ): Promise<WasmWrapper>;
  static async from(
    manifestBuffer: Uint8Array,
    fileReader: IFileReader,
    options?: GetManifestOptions
  ): Promise<WasmWrapper>;
  static async from(
    fileReader: IFileReader,
    options?: GetManifestOptions
  ): Promise<WasmWrapper>;
  static async from(
    manifestBufferOrFileReader: Uint8Array | IFileReader,
    wasmModuleOrFileReaderOrManifestOptions?:
      | Uint8Array
      | IFileReader
      | GetManifestOptions,
    fileReaderOrManifestOptions?: IFileReader | GetManifestOptions,
    manifestOptions?: GetManifestOptions
  ): Promise<WasmWrapper> {
    return createWasmWrapper(
      manifestBufferOrFileReader,
      wasmModuleOrFileReaderOrManifestOptions,
      fileReaderOrManifestOptions,
      manifestOptions
    );
  }

  public async getFile(
    options: GetFileOptions
  ): Promise<Result<Uint8Array | string, Error>> {
    const { path, encoding } = options;

    const dataResult = await this._fileReader.readFile(path);

    // If nothing is returned, the file was not found
    if (!dataResult.ok) {
      return ResultErr(
        Error(`WasmWrapper: File was not found.\nSubpath: ${path}`)
      );
    }

    const data = dataResult.value;

    if (encoding) {
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(data);

      if (!text) {
        const error = Error(
          `WasmWrapper: Decoding the file's bytes array failed.\nBytes: ${data}`
        );
        return ResultErr(error);
      }
      return ResultOk(text);
    }
    return ResultOk(data);
  }

  public getManifest(): WrapManifest {
    return this._manifest;
  }

  public async invoke(
    options: InvokeOptions,
    client: CoreClient
  ): Promise<InvocableResult<Uint8Array>> {
    let memoryHandle: PoolHandle | undefined;

    try {
      const { method } = options;
      const args = options.args || {};
      const wasmResult = await this._getWasmModule();
      if (!wasmResult.ok) {
        const error = new WrapError(wasmResult.error, {
          code: WrapErrorCode.WRAPPER_READ_FAIL,
          uri: options.uri.uri,
          method,
          args: JSON.stringify(args, null, 2),
        });
        return ResultErr(error);
      }
      const wasm = wasmResult.value;

      const state: State = {
        invoke: {},
        subinvoke: {
          args: [],
        },
        subinvokeImplementation: {
          args: [],
        },
        method,
        args: args
          ? isBuffer(args)
            ? args
            : msgpackEncode(args)
          : EMPTY_ENCODED_OBJECT,
        env: options.env ? msgpackEncode(options.env) : EMPTY_ENCODED_OBJECT,
      };

      const abortWithInvokeAborted = (
        message: string,
        source?: ErrorSource
      ) => {
        const prev = WrapError.parse(message);
        const text = prev ? "SubInvocation exception encountered" : message;
        throw new WrapError(text, {
          code: WrapErrorCode.WRAPPER_INVOKE_ABORTED,
          uri: options.uri.uri,
          method,
          args: JSON.stringify(args, null, 2),
          source,
          innerError: prev,
        });
      };

      const abortWithInternalError = (message: string) => {
        throw new WrapError(message, {
          code: WrapErrorCode.WRAPPER_INTERNAL_ERROR,
          uri: options.uri.uri,
          method,
          args: JSON.stringify(args, null, 2),
        });
      };

      if (!this._wasmMemoryPool) console.log("IN: ", options.uri.uri, wasm.byteLength * 0.000001, "MB");
      memoryHandle = await this._getWasmMemory(wasm);
      console.log("BEFORE-INSTANCE: ", options.uri.uri, process.memoryUsage().rss * 0.000001, "MB");
      const instance = await AsyncWasmInstance.createInstance({
        module: wasm,
        imports: createImports({
          state,
          client,
          memory: memoryHandle.memory,
          abortWithInvokeAborted,
          abortWithInternalError,
        }),
        requiredExports: WasmWrapper.requiredExports,
      });
      console.log("AFTER-INSTANCE: ", options.uri.uri, process.memoryUsage().rss * 0.000001, "MB");

      const exports = instance.exports as WrapExports;

      const result = await exports._wrap_invoke(
        state.method.length,
        state.args.byteLength,
        state.env.byteLength
      );

      console.log("AFTER-INVOKE: ", options.uri.uri, process.memoryUsage().rss * 0.000001, "MB");

      const handle = memoryHandle;
      memoryHandle = undefined;
      this._wasmMemoryPool?.release(handle);

      const invokeResult = this._processInvokeResult(state, result);

      if (invokeResult.ok) {
        return {
          ...invokeResult,
          encoded: true,
        };
      } else {
        const error = new WrapError(invokeResult.error, {
          code: WrapErrorCode.WRAPPER_INVOKE_FAIL,
          uri: options.uri.uri,
          method,
          args: JSON.stringify(args, null, 2),
        });
        return ResultErr(error);
      }
    } catch (error) {
      if (memoryHandle) {
        this._wasmMemoryPool?.release(memoryHandle);
      }
      return ResultErr(error);
    }
  }

  private _processInvokeResult(
    state: State,
    result: boolean
  ): Result<Uint8Array, string> {
    if (result) {
      if (!state.invoke.result) {
        return ResultErr("Invoke result is missing.");
      }

      return ResultOk(state.invoke.result);
    } else {
      if (!state.invoke.error) {
        return ResultErr("Invoke error is missing.");
      }

      return ResultErr(state.invoke.error);
    }
  }

  private async _getWasmMemory(wasm: Uint8Array): Promise<PoolHandle> {
    if (!this._wasmMemoryPool) {
      console.log("NEW POOL!")
      this._wasmMemoryPool = new WasmMemoryPool({
        memoryConfig: {
          initial: getInitialPageCount(wasm),
        },
        max: 5,
        min: 1,
        sleepMs: 100,
      });
    }

    if (!this._wasmMemoryPool) {
      throw Error("This should never happen...");
    }

    return await this._wasmMemoryPool.acquire();
  }

  private async _getWasmModule(): Promise<Result<Uint8Array, string>> {
    if (this._wasmModule === undefined) {
      const result = await this._fileReader.readFile(WRAP_MODULE_PATH);

      if (!result.ok) {
        return ResultErr("Wrapper does not contain a wasm module");
      }

      this._wasmModule = result.value;
    }

    return ResultOk(this._wasmModule);
  }
}
