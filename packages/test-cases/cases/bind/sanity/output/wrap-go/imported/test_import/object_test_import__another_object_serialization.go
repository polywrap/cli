package test_import

import (
	"github.com/polywrap/go-wrap/msgpack"
)

func serializeTestImport_AnotherObject(value *TestImport_AnotherObject) []byte {
	ctx := msgpack.NewContext("Serializing (encoding) env-type: TestImport_AnotherObject")
	encoder := msgpack.NewWriteEncoder(ctx)
	writeTestImport_AnotherObject(encoder, value)
	return encoder.Buffer()
}

func writeTestImport_AnotherObject(writer msgpack.Write, value *TestImport_AnotherObject) {
	writer.WriteMapLength(1)
	writer.Context().Push("prop", "string", "writing property")
	writer.WriteString("prop")
	{
		v := value.Prop
		writer.WriteString(v)
	}
	writer.Context().Pop()
}

func deserializeTestImport_AnotherObject(data []byte) *TestImport_AnotherObject {
	ctx := msgpack.NewContext("Deserializing (decoding) env-type: TestImport_AnotherObject")
	reader := msgpack.NewReadDecoder(ctx, data)
	return readTestImport_AnotherObject(reader)
}

func readTestImport_AnotherObject(reader msgpack.Read) *TestImport_AnotherObject {
	var (
		_prop    string
		_propSet bool
	)

	for i := int32(reader.ReadMapLength()); i > 0; i-- {
		field := reader.ReadString()
		reader.Context().Push(field, "unknown", "searching for property type")
		switch field {
		case "prop":
			reader.Context().Push(field, "string", "type found, reading property")
			var ( value string )
			value = reader.ReadString()
			_prop = value
			_propSet = true
			reader.Context().Pop()
		}
		reader.Context().Pop()
	}

	if !_propSet {
		panic(reader.Context().PrintWithContext("Missing required property: 'prop: String'"))
	}

	return &TestImport_AnotherObject{
		Prop: _prop,
	}
}
