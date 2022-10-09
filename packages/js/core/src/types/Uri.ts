import { Tracer } from "@polywrap/tracing-js";
import { Result, ResultErr, ResultOk } from "@polywrap/result";

/** URI configuration */
export interface UriConfig {
  authority: string;
  path: string;
  uri: string;
}

/**
 * A Polywrap URI. Some examples of valid URIs are:
 * wrap://ipfs/QmHASH
 * wrap://ens/sub.dimain.eth
 * wrap://fs/directory/file.txt
 * wrap://uns/domain.crypto
 *
 * Breaking down the various parts of the URI, as it applies
 * to [the URI standard](https://tools.ietf.org/html/rfc3986#section-3):
 * **wrap://** - URI Scheme: differentiates Polywrap URIs.
 * **ipfs/** - URI Authority: allows the Polywrap URI resolution algorithm to determine an authoritative URI resolver.
 * **sub.domain.eth** - URI Path: tells the Authority where the Wrapper resides.
 */
export class Uri {
  private _config: UriConfig;

  public get authority(): string {
    return this._config.authority;
  }

  public get path(): string {
    return this._config.path;
  }

  public get uri(): string {
    return this._config.uri;
  }

  constructor(uri: string) {
    const result = Uri.parseUri(uri);
    if (!result.ok) {
      throw result.error;
    }
    this._config = result.value;
  }

  public static equals(a: Uri, b: Uri): boolean {
    return a.uri === b.uri;
  }

  public static isUri(value: unknown): value is Uri {
    return typeof value === "object" && (value as Uri).uri !== undefined;
  }

  public static isValidUri(uri: string, parsed?: UriConfig): boolean {
    const result = Uri.parseUri(uri);

    if (parsed && result.ok) {
      Object.assign(parsed, result.value);
    }

    return result.ok;
  }

  public toString(): string {
    return this._config.uri;
  }

  public toJSON(): string {
    return this._config.uri;
  }

  @Tracer.traceMethod("Uri: parseUri")
  public static parseUri(uri: string): Result<UriConfig, Error> {
    if (!uri) {
      return ResultErr(Error("The provided URI is empty"));
    }

    let processed = uri;

    // Trim preceding '/' characters
    while (processed[0] === "/") {
      processed = processed.substring(1);
    }

    // Check for the wrap:// scheme, add if it isn't there
    const wrapSchemeIdx = processed.indexOf("wrap://");

    // If it's missing the wrap:// scheme, add it
    if (wrapSchemeIdx === -1) {
      processed = "wrap://" + processed;
    }

    // If the wrap:// is not in the beginning, return an error
    if (wrapSchemeIdx > -1 && wrapSchemeIdx !== 0) {
      return ResultErr(
        Error("The wrap:// scheme must be at the beginning of the URI string")
      );
    }

    // Extract the authoriy & path
    let result = processed.match(/wrap:\/\/([a-z][a-z0-9-_]+)\/(.*)/);

    // Remove all empty strings
    if (result) {
      result = result.filter((str) => !!str);
    }

    if (!result || result.length !== 3) {
      return ResultErr(
        Error(
          `URI is malformed, here are some examples of valid URIs:\n` +
            `wrap://ipfs/QmHASH\n` +
            `wrap://ens/domain.eth\n` +
            `ens/domain.eth\n\n` +
            `Invalid URI Received: ${uri}`
        )
      );
    }

    return ResultOk({
      uri: processed,
      authority: result[1],
      path: result[2],
    });
  }

  @Tracer.traceMethod("Uri: from")
  public static from(uri: Uri | string): Uri {
    if (typeof uri === "string") {
      return new Uri(uri);
    } else if (Uri.isUri(uri)) {
      return uri;
    } else {
      throw Error(`Unknown uri type, cannot convert. ${JSON.stringify(uri)}`);
    }
  }
}
