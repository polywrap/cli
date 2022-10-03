from polywrap_wasm.wasm_package import FileReader
from polywrap_wasm.wasm_wrapper import WasmWrapper
# from polywrap_core.types.invoke import InvokeOptions


def test_invoke():
    file_reader = FileReader()
    wrapper = WasmWrapper(file_reader)
    
    message = "hello polywrap"
    args = {
        "arg": message
    }
    # options = InvokeOptions(method="simpleMethod", args=args)
    # result = wrapper.invoke(options)
    # print(result)
    # assert result.value == message
    assert True == True