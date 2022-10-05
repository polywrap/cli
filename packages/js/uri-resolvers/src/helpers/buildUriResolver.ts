import { UriResolverAggregator } from "../aggregator";
import { PackageResolver } from "../packages";
import { WrapperResolver } from "../wrappers";
import { UriResolverLike } from "../helpers";
import { RedirectResolver } from "../redirects";

import { Result } from "@polywrap/result";
import {
  IUriResolver,
  Uri,
  Client,
  IUriRedirect,
  IUriPackage,
  IUriWrapper,
} from "@polywrap/core-js";

export const buildUriResolver = <TError = undefined>(
  resolverLike: UriResolverLike,
  resolverName?: string
): IUriResolver<TError> => {
  if (Array.isArray(resolverLike)) {
    return new UriResolverAggregator(
      (resolverLike as UriResolverLike[]).map((x) =>
        buildUriResolver(x, resolverName)
      ),
      resolverName
    ) as IUriResolver<TError>;
  } else if (typeof resolverLike === "function") {
    return new UriResolverAggregator(
      resolverLike as (
        uri: Uri,
        client: Client
      ) => Promise<Result<IUriResolver[], unknown>>,
      resolverName
    ) as IUriResolver<TError>;
  } else if ((resolverLike as IUriResolver).tryResolveUri !== undefined) {
    return resolverLike as IUriResolver<TError>;
  } else if (
    (resolverLike as IUriRedirect<Uri | string>).from !== undefined &&
    (resolverLike as IUriRedirect<Uri | string>).to !== undefined
  ) {
    const uriRedirect = resolverLike as IUriRedirect<Uri | string>;
    return (new RedirectResolver(
      uriRedirect.from,
      uriRedirect.to
    ) as unknown) as IUriResolver<TError>;
  } else if (
    (resolverLike as IUriPackage<Uri | string>).uri !== undefined &&
    (resolverLike as IUriPackage<Uri | string>).package !== undefined
  ) {
    const uriPackage = resolverLike as IUriPackage<Uri | string>;
    return (new PackageResolver(
      Uri.from(uriPackage.uri),
      uriPackage.package
    ) as unknown) as IUriResolver<TError>;
  } else if (
    (resolverLike as IUriWrapper<Uri | string>).uri !== undefined &&
    (resolverLike as IUriWrapper<Uri | string>).wrapper !== undefined
  ) {
    const uriWrapper = resolverLike as IUriWrapper<Uri | string>;
    return (new WrapperResolver(
      Uri.from(uriWrapper.uri),
      uriWrapper.wrapper
    ) as unknown) as IUriResolver<TError>;
  } else {
    throw new Error("Unknown resolver-like type");
  }
};