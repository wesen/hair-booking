package web

import (
	"embed"
	"io/fs"
)

//go:embed public/*
var embeddedFS embed.FS

var PublicFS = mustSub(embeddedFS, "public")

func mustSub(filesystem fs.FS, dir string) fs.FS {
	sub, err := fs.Sub(filesystem, dir)
	if err != nil {
		panic(err)
	}
	return sub
}
