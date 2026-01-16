package storage

import (
	"sync"

	"github.com/tera-language/tera-trace/pkg/translator"
)

type MemoryStore struct {
	mu        sync.RWMutex
	logs      map[string][]*translator.LogEntry
	maxPerSvc int
}

func NewMemoryStore(maxLogsPerService int) *MemoryStore {
	return &MemoryStore{
		logs:      make(map[string][]*translator.LogEntry),
		maxPerSvc: maxLogsPerService,
	}
}

func (m *MemoryStore) AddLog(entry *translator.LogEntry) {
	m.mu.Lock()
	defer m.mu.Unlock()

	serviceLogs := m.logs[entry.Service]
	serviceLogs = append(serviceLogs, entry)

	if len(serviceLogs) > m.maxPerSvc {
		serviceLogs = serviceLogs[len(serviceLogs)-m.maxPerSvc:]
	}

	m.logs[entry.Service] = serviceLogs
}

func (m *MemoryStore) GetAllLogs() map[string][]*translator.LogEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()

	copyLogs := make(map[string][]*translator.LogEntry)
	for svc, logs := range m.logs {
		copyLogs[svc] = append([]*translator.LogEntry{}, logs...)
	}
	return copyLogs
}

func (m *MemoryStore) GetServiceLogs(service string) []*translator.LogEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()
	logs, ok := m.logs[service]
	if !ok {
		return []*translator.LogEntry{}
	}
	return append([]*translator.LogEntry{}, logs...)
}

func (m *MemoryStore) ClearServiceLogs(service string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.logs[service] = []*translator.LogEntry{}
}
