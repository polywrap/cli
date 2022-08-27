import { ClientConfig, Uri } from ".";
import { ResolveUriResult } from "..";

/** Options required for an URI resolution. */
export interface ResolveUriOptions<
  TClientConfig extends ClientConfig = ClientConfig
> {
  /**
   * If set to true, the resolveUri function will not use the cache to resolve the uri.
   */
  noCacheRead?: boolean;

  /**
   * If set to true, the resolveUri function will not cache the results
   */
  noCacheWrite?: boolean;

  /**
   * Id used to track context data set internally.
   */
  contextId?: string;
}

export interface UriResolverHandler {
  resolveUri<TUri extends Uri | string>(
    uri: TUri,
    options?: ResolveUriOptions<ClientConfig>
  ): Promise<ResolveUriResult>;

  loadUriResolvers(): Promise<{
    success: boolean;
    failedUriResolvers: string[];
  }>;
}
