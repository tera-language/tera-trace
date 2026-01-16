package translator

import (
	"encoding/json"
	"fmt"
	"time"
)

func TranslateJSON(raw []byte, defaultService string) (*LogEntry, error) {
	var generic map[string]interface{}
	if err := json.Unmarshal(raw, &generic); err != nil {
		return nil, fmt.Errorf("failed to unmarshal raw log: %w", err)
	}

	entry := &LogEntry{
		Service:  defaultService,
		Metadata: make(map[string]interface{}),
	}

	if t, ok := generic["Timestamp"].(string); ok {
		ts, err := time.Parse(time.RFC3339, t)
		if err != nil {
			entry.Timestamp = time.Now()
		} else {
			entry.Timestamp = ts
		}
	} else {
		entry.Timestamp = time.Now()
	}

	if lvl, ok := generic["Level"].(string); ok {
		entry.Level = lvl
	} else {
		entry.Level = "INFO"
	}

	if msg, ok := generic["Message"].(string); ok {
		entry.Message = msg
	} else {
		entry.Message = fmt.Sprintf("%v", generic["Message"])
	}

	if svc, ok := generic["Service"].(string); ok {
		entry.Service = svc
	}
	if trace, ok := generic["TraceID"].(string); ok {
		entry.TraceID = trace
	}
	if sess, ok := generic["SessionID"].(string); ok {
		entry.SessionID = sess
	}

	for k, v := range generic {
		switch k {
		case "Timestamp", "Level", "Message", "Service", "TraceID", "SessionID":
			continue
		default:
			entry.Metadata[k] = v
		}
	}

	return entry, nil
}
