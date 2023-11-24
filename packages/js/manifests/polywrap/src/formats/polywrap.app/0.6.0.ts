/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface AppManifest {
  /**
   * Polywrap manifest format version.
   */
  format: "0.6.0";
  /**
   * Basic project properties.
   */
  project: {
    /**
     * Name of this project.
     */
    name: string;
    /**
     * Type of this project.
     */
    type: string;
  };
  /**
   * Project source files.
   */
  source?: {
    /**
     * Path to the project's graphql schema.
     */
    schema?: string;
  };
  /**
   * Specify URIs to be used to import ABIs in your schema.
   */
  imports?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` ".*".
     */
    [k: string]: ImportUri | string;
  };
  /**
   * Specify redirects from import URIs to ABIs on your filesystem.
   */
  import_abis?: ImportAbi[];
  __type: "AppManifest";
}
export interface ImportUri {
  /**
   * Wrap URI to import.
   */
  uri: string;
  /**
   * List of types to import from Wrap (defaults to all).
   */
  types?: string[];
  /**
   * List of functions to import from Wrap (defaults to all).
   */
  functions?: string[];
}
export interface ImportAbi {
  /**
   * Import URI
   */
  uri: string;
  /**
   * Path to a local ABI (or schema). Supported file formats: [*.graphql, *.info, *.json, *.yaml]
   */
  abi: string;
}