import { GetPathToTestWrappers } from "@polywrap/test-cases";
import { buildWrapper } from "@polywrap/test-env-js";
import { testCases } from "./jobrunner-test-cases";
import { JobRunner } from "../../lib";
import path from "path";
import { PolywrapClient } from "@polywrap/client-js";

jest.setTimeout(200000);

describe("workflow JobRunner", () => {

  let client: PolywrapClient;

  beforeAll(async () => {
    await buildWrapper(
      path.join(GetPathToTestWrappers(), "wasm-as", "simple-calculator")
    );
    client = new PolywrapClient({});
  });

  for (const testCase of testCases) {
    it(testCase.name, async () => {
      expect(client).toBeTruthy();
      const ids = Object.keys(testCase.workflow.jobs);
      const jobRunner = new JobRunner(client, testCase.onExecution);
      await jobRunner.run(testCase.workflow.jobs, ids);
    });
  }
});
