import { ProjectConfig, Project } from ".";
import {
  loadPluginManifest,
  PluginManifestLanguage,
  pluginManifestLanguages,
  isPluginManifestLanguage,
  pluginManifestLanguageToBindLanguage,
  pluginManifestOverrideCodegenDir,
} from "./manifests";
import { resetDir } from "../system";

import { PluginManifest } from "@polywrap/polywrap-manifest-types-js";
import {
  bindSchema,
  BindOutput,
  BindOptions,
  bindLanguageToWrapInfoType,
} from "@polywrap/schema-bind";
import { WrapAbi } from "@polywrap/schema-parse";
import path from "path";
import { latestWrapManifestVersion } from "@polywrap/wrap-manifest-types-js";

export interface PluginProjectConfig extends ProjectConfig {
  pluginManifestPath: string;
}

export class PluginProject extends Project<PluginManifest> {
  private _pluginManifest: PluginManifest | undefined;

  public static cacheLayout = {
    root: "plugin",
  };

  constructor(protected _config: PluginProjectConfig) {
    super(_config, {
      rootDir: _config.rootDir,
      subDir: PluginProject.cacheLayout.root,
    });
  }

  /// Project Base Methods

  public reset(): void {
    this._pluginManifest = undefined;
    this._cache.resetCache();
  }

  public async validate(): Promise<void> {
    const manifest = await this.getManifest();

    // Validate language
    Project.validateManifestLanguage(
      manifest.project.type,
      pluginManifestLanguages,
      isPluginManifestLanguage
    );
  }

  /// Manifest (polywrap.plugin.yaml)

  public async getName(): Promise<string> {
    return (await this.getManifest()).project.name;
  }

  public async getManifest(): Promise<PluginManifest> {
    if (!this._pluginManifest) {
      this._pluginManifest = await loadPluginManifest(
        this.getManifestPath(),
        this.logger
      );
    }

    return Promise.resolve(this._pluginManifest);
  }

  public getManifestDir(): string {
    return path.dirname(this._config.pluginManifestPath);
  }

  public getManifestPath(): string {
    return this._config.pluginManifestPath;
  }

  public async getManifestLanguage(): Promise<PluginManifestLanguage> {
    const language = (await this.getManifest()).project.type;

    Project.validateManifestLanguage(
      language,
      pluginManifestLanguages,
      isPluginManifestLanguage
    );

    return language as PluginManifestLanguage;
  }

  /// Schema

  public async getSchemaNamedPath(): Promise<string> {
    const manifest = await this.getManifest();
    const dir = this.getManifestDir();
    if (!manifest.source?.schema) {
      throw new Error(
        `No schema path specified in project manifest with name "${manifest.project.name}". This should never happen.`
      );
    }
    return path.isAbsolute(manifest.source.schema)
      ? manifest.source.schema
      : path.join(dir, manifest.source.schema);
  }

  public async getImportAbis(): Promise<PluginManifest["import_abis"]> {
    const manifest = await this.getManifest();
    return manifest.import_abis || [];
  }

  public async getGenerationDirectory(
    generationSubPath?: string
  ): Promise<string> {
    const manifest = await this.getManifest();
    return this._getGenerationDirectory(generationSubPath, manifest);
  }

  public async generateSchemaBindings(
    abi: WrapAbi,
    generationSubPath?: string,
    bindgenUri?: string
  ): Promise<BindOutput> {
    const moduleDirectory = await this.getGenerationDirectory(
      generationSubPath
    );
    // Clean the code generation
    resetDir(moduleDirectory);

    const bindLanguage = pluginManifestLanguageToBindLanguage(
      await this.getManifestLanguage()
    );

    const options: BindOptions = {
      bindLanguage,
      wrapInfo: {
        version: latestWrapManifestVersion,
        name: await this.getName(),
        type: bindLanguageToWrapInfoType(bindLanguage),
        abi,
      },
      outputDirAbs: moduleDirectory,
    };

    return bindSchema(options, bindgenUri);
  }

  private _getGenerationDirectory(
    useDefinedPath: string | undefined,
    manifest: PluginManifest,
    defaultDir = "./src/wrap"
  ): string {
    const genPath =
      // 1. Use what the user has specified
      useDefinedPath ||
      // 2. Check to see if there exists an override for this language type
      pluginManifestOverrideCodegenDir(
        manifest.project.type as PluginManifestLanguage
      ) ||
      // 3. If a module path exists, generate within a "wrap" dir next to it
      (manifest.source?.module &&
        path.join(path.dirname(manifest.source.module), "wrap")) ||
      // 4. Use the default
      defaultDir;

    if (path.isAbsolute(genPath)) {
      return genPath;
    } else {
      return path.join(this.getManifestDir(), genPath);
    }
  }
}
