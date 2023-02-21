import { Abi } from "./definitions";

export interface ImportStatement {
  kind: "local" | "external";
  importedTypes: string[];
  uriOrPath: string;
}

export interface ExternalImportStatement extends ImportStatement {
  kind: "external";
  namespace: string;
}

export interface LocalImportStatement extends ImportStatement {
  kind: "local";
}

export interface SchemaParser {
  parseExternalImportStatements: (schema: string) => Promise<ExternalImportStatement[]>
  parseLocalImportStatements: (schema: string) => Promise<LocalImportStatement[]>
  parse: (schema: string) => Promise<Abi>
}

export interface ParserOptions {
  noValidate?: boolean;
}

export interface ExternalSchemaFetcher {
  fetch: (uri: string) => Promise<Abi>;
}

export interface LocalSchemaFetcher {
  fetch: (path: string) => Promise<string>;
}