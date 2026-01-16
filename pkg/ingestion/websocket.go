package ingestion

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/tera-language/tera-trace/pkg/storage"
	"github.com/tera-language/tera-trace/pkg/translator"
)

var wsUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var wsClients = make(map[*websocket.Conn]bool)

func InitMemoryStore(store *storage.MemoryStore) {
	memoryStore = store
}

func StartWebSocketListener(addr string) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := wsUpgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		wsClients[conn] = true

		if memoryStore != nil {
			for _, logs := range memoryStore.GetAllLogs() {
				for _, entry := range logs {
					conn.WriteJSON(entry)
				}
			}
		}

		for {
			var msg map[string]interface{}
			if err := conn.ReadJSON(&msg); err != nil {
				delete(wsClients, conn)
				conn.Close()
				break
			}

			data, _ := json.Marshal(msg)
			entry, err := translator.TranslateJSON(data, "WS")
			if err != nil {
				continue
			}

			if memoryStore != nil {
				memoryStore.AddLog(entry)
			}

			broadcastLog(entry)
		}
	})

	go http.ListenAndServe(addr, nil)
}

func broadcastLog(entry *translator.LogEntry) {
	for client := range wsClients {
		client.WriteJSON(entry)
	}
}
