import { BindOptions, BindLanguage, bindLanguage } from "../";

import fs from "fs";
import path from "path";
import { parseSchema } from "@polywrap/schema-parse";
import { GetPathToBindTestFiles } from "@polywrap/test-cases";
import { normalizeLineEndings } from "@polywrap/os-js";

const root = GetPathToBindTestFiles();

export type TestCase = {
  name: string;
  directory: string;
  input: BindOptions;
  outputLanguages: {
    language: string;
    directory?: string;
  }[];
};

export type TestCases = {
  name: string;
  promise: Promise<TestCase | undefined>;
}[];

export function fetchTestCases(): TestCases {
  const cases: TestCases = [];
  const bindLanguages = Object.keys(bindLanguage);

  const fetchIfExists = (file: string): string | undefined => {
    if (fs.existsSync(file)) {
      return normalizeLineEndings(
        fs.readFileSync(file, { encoding: "utf-8" }),
        "\n"
      );
    } else {
      return undefined;
    }
  };

  const importCase = async (
    dirent: fs.Dirent
  ): Promise<TestCase | undefined> => {
    // The case must be a folder
    if (!dirent.isDirectory()) {
      return Promise.resolve(undefined);
    }

    // Fetch the input schema
    const schemaFile = path.join(
      root,
      dirent.name,
      "input",
      "schema.graphql"
    );

    const schema = fetchIfExists(schemaFile);

    if (!schema) {
      throw Error(`Expected input schema at ${schemaFile}`)
    }

    // Fetch each language's expected output
    const outputDir = path.join(root, dirent.name, "output");
    const outputLanguages: {
      language: string;
      directory?: string;
    }[] = [];

    for (const language of bindLanguages) {
      const outputLanguageDir = path.join(outputDir, language);
      if (fs.existsSync(outputLanguageDir)) {
        outputLanguages.push({
          language,
          directory: outputLanguageDir
        });
      } else {
        outputLanguages.push({ language });
      }
    }

    // Parse the input schema into the Abi structure
    const abi = parseSchema(schema);

    const input: BindOptions = {
      wrapInfo: {
        name: "Test",
        version: "0.1",
        abi,
        type: "TBD" as "wasm" | "plugin" | "interface",
      },
      bindLanguage: "TBD" as BindLanguage,
      outputDirAbs: path.join(root, "combined")
    };

    // Add the newly formed test case
    return {
      name: dirent.name,
      directory: outputDir,
      input,
      outputLanguages,
    };
  };

  fs.readdirSync(root, { withFileTypes: true }).forEach((dirent: fs.Dirent) => {
    cases.push({
      name: dirent.name,
      promise: importCase(dirent),
    });
  });

  return cases;
}
