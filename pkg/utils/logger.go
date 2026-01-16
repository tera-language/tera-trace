package utils

import (
	"fmt"
	"time"
)

const (
	ColorPurple = "\033[38;5;99m"
	ColorGray   = "\033[90m"
	ColorReset  = "\033[0m"

	ColorRed    = "\033[38;5;197m"
	ColorYellow = "\033[38;5;214m"
	ColorBlue   = "\033[38;5;75m"
	ColorGreen  = "\033[38;5;120m"
)

const (
	LevelInfo  = "INFO"
	LevelWarn  = "WARN"
	LevelError = "ERROR"
	LevelDebug = "DEBUG"
)

func Log(level string, component string, msg string) {
	timestamp := time.Now().Format("15:04:05.000")

	var levelColor string
	switch level {
	case LevelError:
		levelColor = ColorRed
	case LevelWarn:
		levelColor = ColorYellow
	case LevelDebug:
		levelColor = ColorBlue
	default:
		levelColor = ColorPurple
	}

	fmt.Printf("%s[%s]%s %s%-5s%s %s[%-10s]%s %s\n",
		ColorGray, timestamp, ColorReset,
		levelColor, level, ColorReset,
		ColorGray, component, ColorReset,
		msg,
	)
}
