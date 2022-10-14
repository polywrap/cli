import {
  QueryHandler,
  Invoker,
  SubscriptionHandler,
  IUriRedirect,
  Uri,
  InterfaceImplementations,
  Env,
} from "./";
import { IUriResolver } from "../uri-resolution";
import { UriResolverHandler } from "./UriResolver";

import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { Result } from "@polywrap/result";

export interface ClientConfig<TUri extends Uri | string = string> {
  readonly redirects?: Readonly<IUriRedirect<TUri>[]>;
  readonly interfaces?: Readonly<InterfaceImplementations<TUri>[]>;
  readonly envs?: Readonly<Env<TUri>[]>;
  readonly resolver: Readonly<IUriResolver<unknown>>;
}

export interface GetManifestOptions {
  noValidate?: boolean;
}

export interface GetFileOptions {
  path: string;
  encoding?: "utf-8" | string;
}

export interface GetImplementationsOptions {
  applyRedirects?: boolean;
}

export interface Client
  extends Invoker,
    QueryHandler,
    SubscriptionHandler,
    UriResolverHandler<unknown> {
  getConfig(): ClientConfig<Uri>;

  getRedirects(): readonly IUriRedirect<Uri>[] | undefined;

  getInterfaces(): readonly InterfaceImplementations<Uri>[] | undefined;

  getEnvs(): readonly Env<Uri>[] | undefined;

  getEnvByUri<TUri extends Uri | string>(uri: TUri): Env<Uri> | undefined;

  getUriResolver(): IUriResolver<unknown>;

  getManifest<TUri extends Uri | string>(
    uri: TUri
  ): Promise<Result<WrapManifest, Error>>;

  getFile<TUri extends Uri | string>(
    uri: TUri,
    options: GetFileOptions
  ): Promise<Result<string | Uint8Array, Error>>;

  getImplementations<TUri extends Uri | string>(
    uri: TUri,
    options: GetImplementationsOptions
  ): Result<TUri[], Error>;
}
