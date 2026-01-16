package translator

import "time"

type LogEntry struct {
	Timestamp time.Time              `json:"Timestamp"`
	Level     string                 `json:"Level"`
	Message   string                 `json:"Message"`
	Service   string                 `json:"Service"`
	TraceID   string                 `json:"TraceID,omitempty"`
	SessionID string                 `json:"SessionID,omitempty"`
	Metadata  map[string]interface{} `json:"Metadata,omitempty"`
}
