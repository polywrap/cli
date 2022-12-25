import {
  Args_getFile,
  Args_tryResolveUri,
  Bytes,
  CoreClient,
  Http_Module,
  manifest,
  Module,
  UriResolver_MaybeUriOrManifest,
} from "./wrap";

import { PluginFactory, PluginPackage } from "@polywrap/plugin-js";

type NoConfig = Record<string, never>;

export class HttpResolverPlugin extends Module<NoConfig> {
  // wrappers.polywrap.eth:uri-resolver-ext@1.0.0
  public async tryResolveUri(
    args: Args_tryResolveUri,
    _client: CoreClient
  ): Promise<UriResolver_MaybeUriOrManifest | null> {
    if (args.authority !== "http" && args.authority !== "https") {
      return null;
    }

    const manifestSearchPattern = "wrap.info";

    let manifest: Bytes | undefined;
    try {
      const manifestResult = await Http_Module.get(
        {
          url: `${args.path}/${manifestSearchPattern}`,
          request: {
            responseType: "BINARY",
          },
        },
        _client
      );

      if (!manifestResult.ok) {
        return { uri: null, manifest: null };
      }
      const result = manifestResult.value;

      if (result && result.body) {
        manifest = Buffer.from(result.body, "base64");
      }
    } catch (e) {
      // TODO: logging
      // https://github.com/polywrap/monorepo/issues/33
    }

    return { uri: null, manifest: manifest ?? null };
  }

  public async getFile(
    args: Args_getFile,
    client: CoreClient
  ): Promise<Bytes | null> {
    try {
      const resolveResult = await Http_Module.get(
        {
          url: args.path,
          request: {
            responseType: "BINARY",
          },
        },
        client
      );

      if (!resolveResult.ok) {
        return null;
      }
      const result = resolveResult.value;

      if (!result || !result.body) {
        return null;
      }

      return Buffer.from(result.body, "base64");
    } catch (e) {
      return null;
    }
  }
}

export const httpResolverPlugin: PluginFactory<NoConfig> = () =>
  new PluginPackage(new HttpResolverPlugin({}), manifest);

export const plugin = httpResolverPlugin;
