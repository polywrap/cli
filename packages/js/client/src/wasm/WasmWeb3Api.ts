/* eslint-disable @typescript-eslint/naming-convention */
import { W3Exports } from "./types";
import { createImports } from "./imports";

import {
  InvokeApiOptions,
  InvokeApiResult,
  Api,
  Web3ApiManifest,
  Uri,
  Client,
  UriResolver,
  InvokableModules,
  GetManifestOptions,
  deserializeWeb3ApiManifest,
  deserializeBuildManifest,
  deserializeMetaManifest,
  AnyManifest,
  ManifestType,
  combinePaths,
  GetFileOptions,
} from "@web3api/core-js";
import * as MsgPack from "@msgpack/msgpack";
import { Tracer } from "@web3api/tracing-js";
import { AsyncWasmInstance } from "@web3api/asyncify-js";

type InvokeResult =
  | { type: "InvokeResult"; invokeResult: ArrayBuffer }
  | { type: "InvokeError"; invokeError: string };

export interface State {
  method: string;
  args: ArrayBuffer;
  invoke: {
    result?: ArrayBuffer;
    error?: string;
  };
  subinvoke: {
    result?: ArrayBuffer;
    error?: string;
    args: unknown[];
  };
  invokeResult: InvokeResult;
}

export class WasmWeb3Api extends Api {
  public static requiredExports: readonly string[] = ["_w3_invoke"];

  private _schema?: string;

  private _wasm: {
    query?: ArrayBuffer;
    mutation?: ArrayBuffer;
  } = {};

  constructor(
    private _uri: Uri,
    private _manifest: Web3ApiManifest,
    private _uriResolver: Uri
  ) {
    super();

    Tracer.startSpan("WasmWeb3Api: constructor");
    Tracer.setAttribute("input", {
      uri: this._uri,
      manifest: this._manifest,
      uriResolver: this._uriResolver,
    });
    Tracer.endSpan();
  }

  public async invoke(
    options: InvokeApiOptions<Uri>,
    client: Client
  ): Promise<InvokeApiResult<unknown | ArrayBuffer>> {
    const run = Tracer.traceFunc(
      "WasmWeb3Api: invoke",
      async (
        options: InvokeApiOptions<Uri>,
        client: Client
      ): Promise<InvokeApiResult<unknown | ArrayBuffer>> => {
        const { module: invokableModule, method, input, decode } = options;
        const wasm = await this._getWasmModule(invokableModule, client);
        const state: State = {
          invoke: {},
          subinvoke: {
            args: [],
          },
          invokeResult: {} as InvokeResult,
          method,
          args:
            input instanceof ArrayBuffer
              ? input
              : MsgPack.encode(input, { ignoreUndefined: true }),
        };

        const abort = (message: string) => {
          throw new Error(
            `WasmWeb3Api: Thread aborted execution.\nURI: ${this._uri.uri}\n` +
              `Module: ${module}\nMethod: ${method}\n` +
              `Input: ${JSON.stringify(input, null, 2)}\nMessage: ${message}.\n`
          );
        };

        const memory = new WebAssembly.Memory({ initial: 1 });
        const instance = await AsyncWasmInstance.createInstance({
          module: wasm,
          imports: createImports({
            state,
            client,
            memory,
            abort,
          }),
          requiredExports: WasmWeb3Api.requiredExports,
        });

        const exports = instance.exports as W3Exports;

        const result = await exports._w3_invoke(
          state.method.length,
          state.args.byteLength
        );

        const invokeResult = this._processInvokeResult(state, result, abort);

        switch (invokeResult.type) {
          case "InvokeError": {
            throw Error(
              `WasmWeb3Api: invocation exception encountered.\n` +
                `uri: ${this._uri.uri}\nmodule: ${module}\n` +
                `method: ${method}\n` +
                `input: ${JSON.stringify(input, null, 2)}\n` +
                `exception: ${invokeResult.invokeError}`
            );
          }
          case "InvokeResult": {
            if (decode) {
              try {
                return {
                  data: MsgPack.decode(
                    invokeResult.invokeResult as ArrayBuffer
                  ),
                };
              } catch (err) {
                throw Error(
                  `WasmWeb3Api: Failed to decode query result.\nResult: ${JSON.stringify(
                    invokeResult.invokeResult
                  )}\nError: ${err}`
                );
              }
            } else {
              return { data: invokeResult.invokeResult };
            }
          }
          default: {
            throw Error(`WasmWeb3Api: Unknown state "${state}"`);
          }
        }
      }
    );

    return run(options, client).catch((error: Error) => {
      return {
        error,
      };
    });
  }

  public async getSchema(client: Client): Promise<string> {
    const run = Tracer.traceFunc(
      "WasmWeb3Api: getSchema",
      async (client: Client): Promise<string> => {
        if (this._schema) {
          return this._schema;
        }

        // Either the query or mutation module will work,
        // as they share the same schema file
        const module =
          this._manifest.modules.mutation || this._manifest.modules.query;

        if (!module) {
          // TODO: this won't work for abstract APIs
          throw Error(`WasmWeb3Api: No module was found.`);
        }

        this._schema = (await this.getFile(
          { path: module.schema, encoding: "utf8" },
          client
        )) as string;

        return this._schema;
      }
    );

    return run(client);
  }

  public async getManifest<TManifest extends ManifestType>(
    options: GetManifestOptions<TManifest>,
    client: Client
  ): Promise<AnyManifest<TManifest>> {
    if (!options?.type) {
      return this._manifest as AnyManifest<TManifest>;
    }
    let manifest: string;
    const fileTitle: string =
      options.type === "web3api" ? "web3api" : "web3api." + options.type;
    try {
      // try common yaml suffix
      const path: string = fileTitle + ".yaml";
      manifest = (await this.getFile(
        { path, encoding: "utf8" },
        client
      )) as string;
    } catch {
      // try alternate yaml suffix
      const path: string = fileTitle + ".yml";
      manifest = (await this.getFile(
        { path, encoding: "utf8" },
        client
      )) as string;
    }
    switch (options.type) {
      case "build":
        return deserializeBuildManifest(manifest) as AnyManifest<TManifest>;
      case "meta":
        return deserializeMetaManifest(manifest) as AnyManifest<TManifest>;
      default:
        return deserializeWeb3ApiManifest(manifest) as AnyManifest<TManifest>;
    }
  }

  public async getFile(
    options: GetFileOptions,
    client: Client
  ): Promise<ArrayBuffer | string> {
    const { path, encoding } = options;
    const { data, error } = await UriResolver.Query.getFile(
      client,
      this._uriResolver,
      combinePaths(this._uri.path, path)
    );

    if (error) {
      throw error;
    }

    // If nothing is returned, the file was not found
    if (!data) {
      throw Error(
        `WasmWeb3Api: File was not found.\nURI: ${this._uri}\nSubpath: ${path}`
      );
    }

    if (encoding) {
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(data);

      if (!text) {
        throw Error(
          `WasmWeb3Api: Decoding the file's bytes array failed.\nBytes: ${data}`
        );
      }
      return text;
    }
    return data;
  }

  private async _getWasmModule(
    module: InvokableModules,
    client: Client
  ): Promise<ArrayBuffer> {
    const run = Tracer.traceFunc(
      "WasmWeb3Api: getWasmModule",
      async (
        module: InvokableModules,
        client: Client
      ): Promise<ArrayBuffer> => {
        if (this._wasm[module] !== undefined) {
          return this._wasm[module] as ArrayBuffer;
        }

        const moduleManifest = this._manifest.modules[module];

        if (!moduleManifest) {
          throw Error(
            `Package manifest does not contain a definition for module "${module}"`
          );
        }

        if (!moduleManifest.module) {
          throw Error(
            `Package manifest module ${module} does not contain a definition for module"`
          );
        }

        const data = (await this.getFile(
          { path: moduleManifest.module },
          client
        )) as ArrayBuffer;

        this._wasm[module] = data;
        return data;
      }
    );

    return run(module, client);
  }

  private _processInvokeResult(
    state: State,
    result: boolean,
    abort: (message: string) => never
  ): InvokeResult {
    if (result) {
      if (!state.invoke.result) {
        abort("Invoke result is missing.");
      }

      return {
        type: "InvokeResult",
        invokeResult: state.invoke.result,
      };
    } else {
      if (!state.invoke.error) {
        abort("Invoke error is missing.");
      }

      return {
        type: "InvokeError",
        invokeError: state.invoke.error,
      };
    }
  }
}
