package types

import (
	"github.com/polywrap/go-wrap/msgpack"
)

type Else struct {
	M_else string `json:"else"`
}

func ElseToBuffer(value *Else) []byte {
	return serializeElse(value)
}

func ElseFromBuffer(data []byte) *Else {
	return deserializeElse(data)
}

func ElseWrite(writer msgpack.Write, value *Else) {
	writeElse(writer, value)
}

func ElseRead(reader msgpack.Read) *Else {
	return readElse(reader)
}
