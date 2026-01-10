package aggregator

import "github.com/tera-language/tera-trace/pkg/translator"

func DeduplicateByTraceID(entries []*translator.LogEntry) []*translator.LogEntry {
	seen := make(map[string]bool)
	result := []*translator.LogEntry{}

	for _, entry := range entries {
		if entry.TraceID == "" {
			result = append(result, entry)
			continue
		}
		if !seen[entry.TraceID] {
			seen[entry.TraceID] = true
			result = append(result, entry)
		}
	}

	return result
}

func DeduplicateByMessage(entries []*translator.LogEntry) []*translator.LogEntry {
	seen := make(map[string]bool)
	result := []*translator.LogEntry{}

	for _, entry := range entries {
		key := entry.Service + "|" + entry.Level + "|" + entry.Message
		if !seen[key] {
			seen[key] = true
			result = append(result, entry)
		}
	}

	return result
}