package ingestion

import (
	"encoding/json"
	"net/http"

	"github.com/tera-language/tera-trace/pkg/storage"
	"github.com/tera-language/tera-trace/pkg/translator"
	"github.com/tera-language/tera-trace/pkg/utils"
)

var memoryStore *storage.MemoryStore

func InitMemory(store *storage.MemoryStore) {
	memoryStore = store
}

func StartHTTPListener(addr string) {
	http.HandleFunc("/ingest", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.Log(utils.LevelWarn, "INGEST", "Rejected non-POST request from "+r.RemoteAddr)
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var raw map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
			utils.Log(utils.LevelError, "INGEST", "Malformed JSON payload")
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		data, _ := json.Marshal(raw)
		entry, err := translator.TranslateJSON(data, "HTTP")
		if err != nil {
			utils.Log(utils.LevelError, "INGEST", "Translation failure: "+err.Error())
			http.Error(w, "Failed to translate log", http.StatusInternalServerError)
			return
		}

		if memoryStore != nil {
			memoryStore.AddLog(entry)
		}

		broadcastLog(entry)

		utils.Log(utils.LevelInfo, "INGEST", "Handled trace for service: "+entry.Service)

		w.WriteHeader(http.StatusOK)
	})

	utils.Log(utils.LevelInfo, "INGEST", "HTTP listener initializing on "+addr)

	go func() {
		if err := http.ListenAndServe(addr, nil); err != nil {
			utils.Log(utils.LevelError, "INGEST", "Listener crashed: "+err.Error())
		}
	}()
}
