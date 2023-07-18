import { PolywrapClientConfigBuilder, IWrapPackage, PolywrapClient } from "@polywrap/client-js";
import { samplePlugin } from "../";

describe("e2e", () => {
  let client: PolywrapClient;
  const uri = "ens/sampleplugin.eth";

  beforeAll(() => {
    // Add the samplePlugin to the PolywrapClient
    const config = new PolywrapClientConfigBuilder()
      .addDefaults()
      .setPackage(
        uri,
        samplePlugin({
          defaultValue: "foo bar",
        }) as IWrapPackage
      )
      .build();

    client = new PolywrapClient(config);
  });

  it("sampleMethod", async () => {
    const result = await client.invoke({
      uri,
      method: "sampleMethod",
      args: {
        data: "fuz baz ",
      },
    });

    expect(result.ok).toBeTruthy();
    if (!result.ok) throw result.error;
    expect(result.value).toBeTruthy();
    expect(result.value).toBe("fuz baz foo bar");
  });
});
