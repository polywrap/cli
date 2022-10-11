from __future__ import annotations
from abc import abstractmethod

from dataclasses import dataclass, field
from typing import List, Optional, Union

from .uri import Uri
from .env import Env
from .uri_resolver import IUriResolver
from .invoke import Invoker
from .uri_resolver_handler import UriResolverHandler


@dataclass(slots=True, kw_only=True)
class ClientConfig:
    envs: List[Env] = field(default_factory=list)
    resolver: IUriResolver


@dataclass(slots=True, kw_only=True)
class Contextualized:
    context_id: Optional[str] = None


@dataclass(slots=True, kw_only=True)
class GetEnvsOptions(Contextualized):
    pass


@dataclass(slots=True, kw_only=True)
class GetUriResolversOptions(Contextualized):
    pass


@dataclass(slots=True, kw_only=True)
class GetFileOptions(Contextualized):
    path: str
    encoding: Optional[str] = "utf-8"


class Client(Invoker, UriResolverHandler):
    @abstractmethod
    def get_envs(self, options: Optional[GetEnvsOptions] = None) -> List[Env]:
        pass

    @abstractmethod
    def get_env_by_uri(self, uri: Uri, options: Optional[GetEnvsOptions] = None) -> Union[Env, None]:
        pass

    @abstractmethod
    def get_uri_resolver(self, options: Optional[GetUriResolversOptions] = None) -> List[IUriResolver]:
        pass

    @abstractmethod
    async def get_file(self, uri: Uri, options: Optional[GetFileOptions] = None) -> Union[bytes, str]:
        pass
