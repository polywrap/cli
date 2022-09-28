import { PluginModule } from "@polywrap/core-js";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { getClient } from "../utils/getClient";

jest.setTimeout(200000);

describe("env", () => {
  const mockEnvPlugin = () => {
    interface Env extends Record<string, unknown> {
      arg1: number;
    }

    class MockEnvPlugin extends PluginModule<{}, Env> {
      mockEnv(): Env {
        return this.env;
      }
    }

    return {
      factory: () => new MockEnvPlugin({}),
      manifest: {} as WrapManifest,
    };
  };

  describe("env client types", () => {
    test("plugin env types", async () => {
      const implementationUri = "wrap://ens/some-implementation.eth";
      const envPlugin = mockEnvPlugin();
      const client = await getClient({
        plugins: [
          {
            uri: implementationUri,
            plugin: envPlugin,
          },
        ],
        envs: [
          {
            uri: implementationUri,
            env: {
              arg1: "10",
            },
          },
        ],
      });

      const mockEnv = await client.invoke({
        uri: implementationUri,
        method: "mockEnv",
      });

      if (!mockEnv.ok) fail(mockEnv.error);
      expect(mockEnv.value).toBeTruthy();
      expect(mockEnv.value).toMatchObject({ arg1: "10" });
    });
  });
});
