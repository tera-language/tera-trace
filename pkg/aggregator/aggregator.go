package aggregator

import (
	"sync"

	"github.com/tera-language/tera-trace/pkg/translator"
)

type Aggregator struct {
	mu sync.RWMutex

	logs map[string][]*translator.LogEntry

	seenTraceID map[string]bool
	seenMessage map[string]bool
}

func NewAggregator() *Aggregator {
	return &Aggregator{
		logs:        make(map[string][]*translator.LogEntry),
		seenTraceID: make(map[string]bool),
		seenMessage: make(map[string]bool),
	}
}

func (a *Aggregator) AddLog(entry *translator.LogEntry) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if entry.Service == "" {
		entry.Service = "UNKNOWN"
	}

	// Deduplicate by TraceID
	if entry.TraceID != "" {
		if a.seenTraceID[entry.TraceID] {
			return
		}
		a.seenTraceID[entry.TraceID] = true
	} else {
		key := entry.Service + "|" + entry.Level + "|" + entry.Message
		if a.seenMessage[key] {
			return
		}
		a.seenMessage[key] = true
	}

	a.logs[entry.Service] = append(a.logs[entry.Service], entry)
}

func (a *Aggregator) GetLogs(service string) []*translator.LogEntry {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.logs[service]
}

func (a *Aggregator) GetAllServices() []string {
	a.mu.RLock()
	defer a.mu.RUnlock()
	services := make([]string, 0, len(a.logs))
	for svc := range a.logs {
		services = append(services, svc)
	}
	return services
}

func (a *Aggregator) ClearServiceLogs(service string) {
	a.mu.Lock()
	defer a.mu.Unlock()

	delete(a.logs, service)
	for key := range a.seenMessage {
		if key[:len(service)] == service {
			delete(a.seenMessage, key)
		}
	}
}

func (a *Aggregator) ClearAll() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.logs = make(map[string][]*translator.LogEntry)
	a.seenTraceID = make(map[string]bool)
	a.seenMessage = make(map[string]bool)
}