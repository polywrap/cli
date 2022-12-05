import {
  Uri,
  PolywrapClient, PolywrapCoreClientConfig
} from "../..";
import fs from "fs";

import { coreInterfaceUris, IUriPackage, IUriRedirect } from "@polywrap/core-js";
import { buildWrapper } from "@polywrap/test-env-js";
import { ResultErr } from "@polywrap/result";
import { StaticResolver, UriResolverLike } from "@polywrap/uri-resolvers-js";
import { WasmPackage } from "@polywrap/wasm-js";

jest.setTimeout(200000);

describe("sanity", () => {
  test("default client config", () => {
    const client = new PolywrapClient();

    new Uri("wrap://ens/http-resolver.polywrap.eth"),
      expect(client.getInterfaces()).toStrictEqual([
        {
          interface: coreInterfaceUris.uriResolver,
          implementations: [
            new Uri("wrap://ens/ipfs-resolver.polywrap.eth"),
            new Uri("wrap://ens/ens-resolver.polywrap.eth"),
            new Uri("wrap://ens/fs-resolver.polywrap.eth"),
            new Uri("wrap://ens/http-resolver.polywrap.eth"),
            new Uri("wrap://ipfs/QmfRCVA1MSAjUbrXXjya4xA9QHkbWeiKRsT7Um1cvrR7FY"),
          ],
        },
        {
          interface: new Uri("wrap://ens/wrappers.polywrap.eth:logger@1.0.0"),
          implementations: [new Uri("wrap://plugin/logger")],
        },
      ]);
  });

  test("validate requested uri is available", async () => {
    const fooPath = `${__dirname}/../utils/validate/wrapper-a`;
    const greetingPath = `${__dirname}/../utils/validate/wrapper-b`;
    const modifiedFooPath = `${__dirname}/../utils/validate/wrapper-c`
    const fooUri = `ens/foo.eth`;
    const greetingUri = `ens/greeting.eth`;
    const modifiedFooUri = `ens/foo-modified.eth`;

    const getPackage = async (name: string) => {
      const manifest = await fs.promises.readFile(
        `${__dirname}/../utils/validate/${name}/build/wrap.info`
      );

      const wasmModule = await fs.promises.readFile(
        `${__dirname}/../utils/validate/${name}/build/wrap.wasm`
      );
      return WasmPackage.from(manifest, wasmModule)
    }

    let config: unknown = {
      resolver: {
        tryResolveUri: (_a: unknown, _b: unknown, _c: unknown) => {
          return Promise.resolve(ResultErr())
        }
      },
      interfaces: undefined,
      envs: undefined
    }

    await buildWrapper(fooPath);
    let client = new PolywrapClient(config as PolywrapCoreClientConfig, { noDefaults: true });
    let result = await client.validate(fooUri, {});
    expect(result.ok).toBeFalsy();
    let resultError = (result as { error: Error }).error;
    expect(resultError).toBeTruthy();
    expect(resultError.message).toContain("Error resolving URI");

    let fooPackage: IUriPackage<string> = {
      uri: fooUri,
      package: await getPackage("wrapper-a")
    }

    let resolvers: UriResolverLike[] = [ fooPackage ]
    let staticResolver = StaticResolver.from(resolvers)

    config = {
      resolver: staticResolver
    };
    
    client = new PolywrapClient(config as PolywrapCoreClientConfig, { noDefaults: true });
    result = await client.validate(fooUri, {});

    expect(result.ok).toBeTruthy();

    result = await client.validate(greetingUri, {
      recursive: true
    })
    resultError = (result as { error: Error }).error;
    expect(result.ok).toBeFalsy();
    expect(resultError).toBeTruthy();
    expect(resultError.message).toContain("Error resolving URI");

    await buildWrapper(greetingPath);

    let modifiedFooWrapper: IUriPackage<string> = {
      uri: greetingUri,
      package: await getPackage("wrapper-b")
    };
    resolvers.push(modifiedFooWrapper);
    staticResolver = StaticResolver.from(resolvers);

    (config as Record<string, unknown>).resolver = staticResolver;
    client = new PolywrapClient(config as PolywrapCoreClientConfig, { noDefaults: true });

    result = await client.validate(greetingUri, {
      recursive: true
    })

    expect(result.ok).toBeTruthy()

    await buildWrapper(modifiedFooPath);
      let redirectUri: IUriRedirect<string> = {
      from: fooUri,
      to: modifiedFooUri
    };
    resolvers.push(redirectUri);

    staticResolver = StaticResolver.from(resolvers);

    (config as Record<string, unknown>).resolver = staticResolver;
    client = new PolywrapClient(config as PolywrapCoreClientConfig, { noDefaults: true });

    result = await client.validate(greetingUri, {
      abi: true
    })

    expect(result.ok).toBeFalsy();
  });
});
