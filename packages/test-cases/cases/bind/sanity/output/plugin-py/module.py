# NOTE: This is an auto-generated file. All modifications will be overwritten.
# type: ignore
from __future__ import annotations

from abc import abstractmethod
from typing import TypeVar, Generic, TypedDict, Optional

from .types import *

from polywrap_core import InvokerClient, UriPackageOrWrapper
from polywrap_plugin import PluginModule
from polywrap_msgpack import GenericMap

TConfig = TypeVar("TConfig")


ArgsModuleMethod = TypedDict("ArgsModuleMethod", {
    "str": str,
    "optStr": Optional[str],
    "en": "CustomEnum",
    "optEnum": Optional["CustomEnum"],
    "enumArray": list["CustomEnum"],
    "optEnumArray": Optional[list[Optional["CustomEnum"]]],
    "map": GenericMap[str, int],
    "mapOfArr": GenericMap[str, list[int]],
    "mapOfMap": GenericMap[str, GenericMap[str, int]],
    "mapOfObj": GenericMap[str, "AnotherType"],
    "mapOfArrOfObj": GenericMap[str, list["AnotherType"]]
})

ArgsObjectMethod = TypedDict("ArgsObjectMethod", {
    "object": "AnotherType",
    "optObject": Optional["AnotherType"],
    "objectArray": list["AnotherType"],
    "optObjectArray": Optional[list[Optional["AnotherType"]]]
})

ArgsOptionalEnvMethod = TypedDict("ArgsOptionalEnvMethod", {
    "object": "AnotherType",
    "optObject": Optional["AnotherType"],
    "objectArray": list["AnotherType"],
    "optObjectArray": Optional[list[Optional["AnotherType"]]]
})

ArgsIf = TypedDict("ArgsIf", {
    "if": "Else"
})


class Module(Generic[TConfig], PluginModule[TConfig]):
    def __new__(cls, *args, **kwargs):
        # NOTE: This is used to dynamically add WRAP ABI compatible methods to the class
        instance = super().__new__(cls)
        setattr(instance, "moduleMethod", instance.module_method)
        setattr(instance, "objectMethod", instance.object_method)
        setattr(instance, "optionalEnvMethod", instance.optional_env_method)
        setattr(instance, "if", instance.r_if)
        return instance

    @abstractmethod
    async def module_method(
        self,
        args: ArgsModuleMethod,
        client: InvokerClient[UriPackageOrWrapper],
        env: None
    ) -> int:
        pass

    @abstractmethod
    async def object_method(
        self,
        args: ArgsObjectMethod,
        client: InvokerClient[UriPackageOrWrapper],
        env: Env
    ) -> Optional["AnotherType"]:
        pass

    @abstractmethod
    async def optional_env_method(
        self,
        args: ArgsOptionalEnvMethod,
        client: InvokerClient[UriPackageOrWrapper],
        env: Optional[Env] = None
    ) -> Optional["AnotherType"]:
        pass

    @abstractmethod
    async def r_if(
        self,
        args: ArgsIf,
        client: InvokerClient[UriPackageOrWrapper],
        env: None
    ) -> "Else":
        pass

