package terminal

import (
	"fmt"
	"runtime"
	"time"
	"os"
	"os/exec"
)

const (
	ColorPurple = "\033[38;5;99m"
	ColorCyan   = "\033[36m"
	ColorGray   = "\033[90m"
	ColorReset  = "\033[0m"
	Bold        = "\033[1m"
	Clear       = "\033[H\033[2J"
)

func Start() {
	fmt.Print(Clear)

	setTitle("TeraTrace Local")

	fmt.Printf("%s%s============================================%s\n", Bold, ColorPurple, ColorReset)
	fmt.Printf("%s   TERATRACE %s| %sLocal%s\n", Bold, ColorGray, ColorPurple, ColorReset)
	fmt.Printf("%s%s============================================%s\n", Bold, ColorPurple, ColorReset)

	fmt.Printf("%s[SYS]%s Kernel: %s | Arch: %s\n", ColorGray, ColorReset, runtime.GOOS, runtime.GOARCH)
	fmt.Printf("%s[CLK]%s Startup: %s\n", ColorGray, ColorReset, time.Now().Format("15:04:05.000"))

	fmt.Println()

	fmt.Printf("%s%s[●]%s %sTerminal initialized. Listening on WebSocket gateway...%s\n",
		Bold, ColorPurple, ColorReset, ColorCyan, ColorReset)

	fmt.Printf("%s--------------------------------------------%s\n", ColorGray, ColorReset)
}

func setTitle(title string) {
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command("cmd", "/C", "title", title)
		cmd.Stdout = os.Stdout
		cmd.Run()
	case "linux", "darwin":
		fmt.Printf("\033]0;%s\007", title)
	}
}