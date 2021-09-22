import {
  Read,
  Write,
  Nullable,
  BigInt,
  JSON
} from "@web3api/wasm-as";
import {
  serializeCustomType,
  deserializeCustomType,
  writeCustomType,
  readCustomType
} from "./serialization";
import * as Types from "..";

export class CustomType {
  str: string;
  optStr: string | null;
  u: u32;
  optU: Nullable<u32>;
  u8: u8;
  u16: u16;
  u32: u32;
  i: i32;
  i8: i8;
  i16: i16;
  i32: i32;
  bigint: BigInt;
  optBigint: BigInt | null;
  json: JSON.Value;
  optJson: JSON.Value | null;
  bytes: ArrayBuffer;
  optBytes: ArrayBuffer | null;
  boolean: bool;
  optBoolean: Nullable<bool>;
  uArray: Array<u32>;
  uOptArray: Array<u32> | null;
  optUOptArray: Array<Nullable<u32>> | null;
  optStrOptArray: Array<string | null> | null;
  uArrayArray: Array<Array<u32>>;
  uOptArrayOptArray: Array<Array<Nullable<u32>> | null>;
  uArrayOptArrayArray: Array<Array<Array<u32>> | null>;
  crazyArray: Array<Array<Array<Array<u32> | null>> | null> | null;
  object: Types.AnotherType;
  optObject: Types.AnotherType | null;
  objectArray: Array<Types.AnotherType>;
  optObjectArray: Array<Types.AnotherType | null> | null;
  en: Types.CustomEnum;
  optEnum: Nullable<Types.CustomEnum>;
  enumArray: Array<Types.CustomEnum>;
  optEnumArray: Array<Nullable<Types.CustomEnum>> | null;

  static toBuffer(type: CustomType): ArrayBuffer {
    return serializeCustomType(type);
  }

  static fromBuffer(buffer: ArrayBuffer): CustomType {
    return deserializeCustomType(buffer);
  }

  static write(writer: Write, type: CustomType): void {
    writeCustomType(writer, type);
  }

  static read(reader: Read): CustomType {
    return readCustomType(reader);
  }
}
