package ui

import (
	"embed"
	"io/fs"
	"net/http"
)

var embeddedAssets embed.FS

func ServeUI() http.Handler {
	contentFS, _ := fs.Sub(embeddedAssets, "assets")
	return http.FileServer(http.FS(contentFS))
}