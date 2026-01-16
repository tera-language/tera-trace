package server

import (
	"net/http"

	"github.com/tera-language/tera-trace/pkg/ui"
	"github.com/tera-language/tera-trace/pkg/utils"
)

func StartServer(addr string) error {
	mux := http.NewServeMux()

	mux.Handle("/", ui.ServeUI())

	utils.Log(utils.LevelInfo, "GATEWAY", "Initializing TeraTrace UI at "+addr)

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	go func() {
		utils.Log(utils.LevelInfo, "GATEWAY", "WebSocket/UI service is now live")
	}()

	return server.ListenAndServe()
}
