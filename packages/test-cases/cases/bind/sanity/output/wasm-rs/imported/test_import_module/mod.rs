use serde::{Serialize, Deserialize};
use polywrap_wasm_rs::{
    BigInt,
    BigNumber,
    Map,
    Read,
    Write,
    JSON,
    subinvoke,
};
pub mod serialization;
pub use serialization::{
    deserialize_imported_method_result,
    serialize_imported_method_args,
    ArgsImportedMethod,
    deserialize_another_method_result,
    serialize_another_method_args,
    ArgsAnotherMethod,
    deserialize_returns_array_of_enums_result,
    serialize_returns_array_of_enums_args,
    ArgsReturnsArrayOfEnums
};

use crate::TestImportObject;
use crate::TestImportEnum;
use crate::TestImportEnumReturn;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TestImportModule {
    uri: String
}

impl TestImportModule {
    pub const INTERFACE_URI: &'static str = "testimport.uri.eth";

    pub fn new(uri: String) -> TestImportModule {
        TestImportModule { uri }
    }

    pub fn imported_method(&self, args: &ArgsImportedMethod) -> Result<Option<TestImportObject>, String> {
        let ref uri = self.uri;
        let args = serialize_imported_method_args(args).map_err(|e| e.to_string())?;
        let result = subinvoke::wrap_subinvoke(
            uri.as_str(),
            "importedMethod",
            args,
        )?;
        deserialize_imported_method_result(result.as_slice()).map_err(|e| e.to_string())
    }

    pub fn another_method(&self, args: &ArgsAnotherMethod) -> Result<i32, String> {
        let ref uri = self.uri;
        let args = serialize_another_method_args(args).map_err(|e| e.to_string())?;
        let result = subinvoke::wrap_subinvoke(
            uri.as_str(),
            "anotherMethod",
            args,
        )?;
        deserialize_another_method_result(result.as_slice()).map_err(|e| e.to_string())
    }

    pub fn returns_array_of_enums(&self, args: &ArgsReturnsArrayOfEnums) -> Result<Vec<Option<TestImportEnumReturn>>, String> {
        let ref uri = self.uri;
        let args = serialize_returns_array_of_enums_args(args).map_err(|e| e.to_string())?;
        let result = subinvoke::wrap_subinvoke(
            uri.as_str(),
            "returnsArrayOfEnums",
            args,
        )?;
        deserialize_returns_array_of_enums_result(result.as_slice()).map_err(|e| e.to_string())
    }
}
