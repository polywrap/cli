import { OutputEntry, readDirectorySync } from "@polywrap/os-js";
import Mustache from "mustache";
import path from "path";

export function renderTemplates(
  templateDirAbs: string,
  view: unknown,
  subTemplates: Record<string, string>,
  subDirectories = false
): OutputEntry[] {
  const output: OutputEntry[] = [];
  const directory = readDirectorySync(templateDirAbs);

  const processDirectory = (entries: OutputEntry[], output: OutputEntry[]) => {
    subTemplates = loadSubTemplates(entries, subTemplates);

    // Generate all files, recurse all directories
    for (const dirent of entries) {
      if (dirent.type === "File") {
        const name = path.parse(dirent.name).name;

        // file templates don't start with '$'
        if (!name.startsWith("$")) {
          const data = Mustache.render(dirent.data, view, subTemplates);

          // If the file isn't empty, add it to the output
          if (data) {
            output.push({
              type: "File",
              name: name.replace("-", "."),
              data,
            });
          }
        }
      } else if (dirent.type === "Directory" && subDirectories) {
        const subOutput: OutputEntry[] = [];

        processDirectory(dirent.data as OutputEntry[], subOutput);

        output.push({
          type: "Directory",
          name: dirent.name,
          data: subOutput,
        });
      }
    }
  };

  processDirectory(directory.entries, output);

  return output;
}

export function loadSubTemplates(
  entries: OutputEntry[],
  existingSubTemplates?: Record<string, string>
): Record<string, string> {
  const subTemplates: Record<string, string> = existingSubTemplates
    ? existingSubTemplates
    : {};

  for (const file of entries) {
    if (file.type !== "File") {
      continue;
    }

    const name = path.parse(file.name).name;

    // sub-templates start with '$' in their file names
    if (name.startsWith("$")) {
      // remove the $ from the name
      const subTemplateName = name.substring(1);
      subTemplates[subTemplateName] = file.data as string;
    }
  }

  return subTemplates;
}
