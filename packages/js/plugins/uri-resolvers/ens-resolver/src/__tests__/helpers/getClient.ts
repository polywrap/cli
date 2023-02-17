import { ensResolverPlugin } from "../..";
import { ensAddresses, providers } from "@polywrap/test-env-js";
import {
  Connection,
  Connections,
  ethereumProviderPlugin,
} from "ethereum-provider-js";
import {
  RecursiveResolver,
  PackageToWrapperCacheResolver,
  WrapperCache,
  RetryResolver,
} from "@polywrap/uri-resolvers-js";
import { PolywrapClient } from "@polywrap/client-js";
import { ExtendableUriResolver } from "@polywrap/uri-resolver-extensions-js";
import {
  defaultEmbeddedPackages,
  defaultInterfaces,
  defaultPackages,
  defaultIpfsProviders,
  defaultWrappers
} from "@polywrap/client-config-builder-js";
import { httpPlugin } from "@polywrap/http-plugin-js";
import { Uri } from "@polywrap/core-js";

export const getClient = () => {
  return new PolywrapClient<string>(
    {
      envs: [{
        uri: defaultPackages.ipfsResolver,
        env: {
          provider: providers.ipfs,
          fallbackProviders: defaultIpfsProviders,
        },
      }],
      interfaces: [
        {
          interface: ExtendableUriResolver.extInterfaceUri.uri,
          implementations: [
            defaultPackages.ipfsResolver,
            defaultPackages.ensResolver,
            defaultWrappers.ensTextRecordResolver,
          ],
        },
        {
          interface: defaultInterfaces.ipfsHttpClient,
          implementations: [defaultInterfaces.ipfsHttpClient],
        },
        {
          interface: defaultInterfaces.ethereumProvider,
          implementations: [defaultInterfaces.ethereumProvider],
        },
      ],
      resolver: RecursiveResolver.from(
        PackageToWrapperCacheResolver.from(
          [
            {
              uri: Uri.from(defaultInterfaces.ipfsHttpClient),
              package: defaultEmbeddedPackages.ipfsHttpClient(),
            },
            {
              uri: Uri.from(defaultPackages.ipfsResolver),
              package: defaultEmbeddedPackages.ipfsResolver(),
            },
            {
              uri: Uri.from(defaultInterfaces.ethereumProvider),
              package: ethereumProviderPlugin({
                connections: new Connections({
                  networks: {
                    testnet: new Connection({
                      provider: providers.ethereum,
                    }),
                  },
                  defaultNetwork: "testnet",
                }),
              }),
            },
            {
              uri: Uri.from(defaultPackages.ensResolver),
              package: ensResolverPlugin({
                addresses: {
                  testnet: ensAddresses.ensAddress,
                },
              }),
            },
            {
              uri: Uri.from(defaultInterfaces.http),
              package: httpPlugin({}),
            },
            new RetryResolver(new ExtendableUriResolver(), {
              ipfs: { retries: 1, interval: 100 },
            }),
          ],
          new WrapperCache()
        )
      ),
    },
    { noDefaults: true }
  );
};
