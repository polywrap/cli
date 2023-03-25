import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import copyfiles from "copyfiles";
import { writeFileSync } from "@polywrap/os-js";
import fse from "fs-extra";

export const globalCacheRoot: string =
  process.platform == "darwin"
    ? process.env.HOME + "/Library/Preferences/polywrap/cache"
    : process.env.HOME + "/.local/share/polywrap/cache";

export interface CacheDirectoryConfig {
  rootDir: string;
  subDir: string;
}

export class CacheDirectory {
  constructor(
    protected _config: CacheDirectoryConfig,
    protected _cacheDirName: string = ".polywrap"
  ) {}

  public getCacheDir(): string {
    return path.join(
      this._config.rootDir,
      this._cacheDirName,
      this._config.subDir
    );
  }

  public initCache(): this {
    const cacheDir = this.getCacheDir();
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    return this;
  }

  public resetCache(): void {
    rimraf.sync(this.getCacheDir());
  }

  public removeCacheDir(dir: string): void {
    const folderPath = path.join(this.getCacheDir(), dir);
    rimraf.sync(folderPath);
  }

  public getCachePath(subpath: string): string {
    return path.join(this.getCacheDir(), subpath);
  }

  public readCacheFile(file: string): string | undefined {
    const filePath = this.getCachePath(file);

    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    return fs.readFileSync(filePath, "utf-8");
  }

  public writeCacheFile(
    subPath: string,
    data: string | NodeJS.ArrayBufferView,
    options?: fs.WriteFileOptions
  ): void {
    const filePath = this.getCachePath(subPath);
    const folderPath = path.dirname(filePath);

    // Create folders if they don't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    writeFileSync(filePath, data, options);
  }

  public appendToCacheFile(
    subPath: string,
    data: string | Buffer,
    options?: fs.WriteFileOptions
  ): void {
    const filePath = this.getCachePath(subPath);
    const folderPath = path.dirname(filePath);

    // Create folders if they don't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.appendFileSync(filePath, data, options);
  }

  public async copyIntoCache(
    destSubDir: string,
    sourceDir: string,
    options: copyfiles.Options = {}
  ): Promise<void> {
    const dest = this.getCachePath(destSubDir);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    await new Promise<void>((resolve, reject) => {
      copyfiles([sourceDir, dest], options, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  public async copyFromCache(
    sourceSubDir: string,
    destDir: string
  ): Promise<void> {
    const source = this.getCachePath(sourceSubDir);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    await fse.copy(source, destDir, {
      overwrite: true,
    });
  }
}
