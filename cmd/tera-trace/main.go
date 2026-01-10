package main

import (
	"runtime"
	"time"
	"os"
	"os/exec"

	"github.com/tera-language/tera-trace/pkg/ingestion"
	"github.com/tera-language/tera-trace/pkg/server"
	"github.com/tera-language/tera-trace/pkg/storage"
	"github.com/tera-language/tera-trace/pkg/terminal"
	"github.com/tera-language/tera-trace/pkg/utils"
)

func main() {
	terminal.Start()

	utils.Log(utils.LevelInfo, "STORAGE", "Initializing memory buffer (limit: 1000 items)")
	memStore := storage.NewMemoryStore(1000)

	ingestion.InitMemory(memStore)
	ingestion.InitMemoryStore(memStore)

	utils.Log(utils.LevelInfo, "CORE", "Launching ingestion services...")
	go ingestion.StartHTTPListener(":8090")
	go ingestion.StartWebSocketListener(":8081")

	go func() {
		utils.Log(utils.LevelInfo, "WEB", "Starting dashboard server on http://localhost:8080")
		if err := server.StartServer(":8080"); err != nil {
			utils.Log(utils.LevelError, "WEB", "Critical failure: "+err.Error())
			os.Exit(1)
		}
	}()

	time.Sleep(800 * time.Millisecond)

	openBrowser("http://localhost:8080")

	utils.Log(utils.LevelDebug, "CORE", "TeraTrace process active. Press Ctrl+C to terminate.")
	select {}
}

func openBrowser(url string) {
	var err error
	utils.Log(utils.LevelInfo, "SYSTEM", "Requesting default browser launch...")

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		utils.Log(utils.LevelWarn, "SYSTEM", "Unsupported OS for auto-launch. Manual URL: "+url)
		return
	}

	if err != nil {
		utils.Log(utils.LevelError, "SYSTEM", "Browser launch failed: "+err.Error())
	}
}