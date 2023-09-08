package types

import (
	"github.com/polywrap/go-wrap/msgpack"
)

func serializeAnotherType(value *AnotherType) []byte {
	ctx := msgpack.NewContext("Serializing (encoding) env-type: AnotherType")
	encoder := msgpack.NewWriteEncoder(ctx)
	writeAnotherType(encoder, value)
	return encoder.Buffer()
}

func writeAnotherType(writer msgpack.Write, value *AnotherType) {
	writer.WriteMapLength(3)
	writer.Context().Push("prop", "*string", "writing property")
	writer.WriteString("prop")
	{
		v := value.Prop
		if v == nil {
			writer.WriteNil()
		} else {
			writer.WriteString(*v)
		}
	}
	writer.Context().Pop()
	writer.Context().Push("circular", "*CustomType", "writing property")
	writer.WriteString("circular")
	{
		v := value.Circular
		CustomTypeWrite(writer, v)
	}
	writer.Context().Pop()
	writer.Context().Push("const", "*string", "writing property")
	writer.WriteString("const")
	{
		v := value.M_const
		if v == nil {
			writer.WriteNil()
		} else {
			writer.WriteString(*v)
		}
	}
	writer.Context().Pop()
}

func deserializeAnotherType(data []byte) *AnotherType {
	ctx := msgpack.NewContext("Deserializing (decoding) env-type: AnotherType")
	reader := msgpack.NewReadDecoder(ctx, data)
	return readAnotherType(reader)
}

func readAnotherType(reader msgpack.Read) *AnotherType {
	var (
		_prop     *string
		_circular *CustomType
		_const    *string
	)

	for i := int32(reader.ReadMapLength()); i > 0; i-- {
		field := reader.ReadString()
		reader.Context().Push(field, "unknown", "searching for property type")
		switch field {
		case "prop":
			reader.Context().Push(field, "*string", "type found, reading property")
			var ( value *string )
			value = nil
			if !reader.IsNil() {
				v := reader.ReadString()
				value = &v
			}
			_prop = value
			reader.Context().Pop()
		case "circular":
			reader.Context().Push(field, "*CustomType", "type found, reading property")
			var ( value *CustomType )
			value = nil
			if v := CustomTypeRead(reader); v != nil {
				value = v
			}
			_circular = value
			reader.Context().Pop()
		case "const":
			reader.Context().Push(field, "*string", "type found, reading property")
			var ( value *string )
			value = nil
			if !reader.IsNil() {
				v := reader.ReadString()
				value = &v
			}
			_const = value
			reader.Context().Pop()
		}
		reader.Context().Pop()
	}

	return &AnotherType{
		Prop:     _prop,
		Circular: _circular,
		M_const:  _const,
	}
}
