package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type Log struct {
	LogID       string `json:"logId"`
	NormType    int    `json:"NormType"`
	EventType   int    `json:"EventType"`
	EventTime   string `json:"EventTime"`
	EventId     int    `json:"EventId"`
	Port        int    `json:"port"`
	SourceImage string `json:"SourceImage"`
	TargetImage string `json:"TargetImage"`
	Image       string `json:"Image"`
	AccountName string `json:"AccountName"`
	SourceIp    string `json:"SourceIp"`
	TargetIp    string `json:"TargetIp"`
	Message     string `json:"Message"`
	ProcessId   string `json:"ProcessId"`
	CommandLine string `json:"CommandLine"`
	Host        string `json:"host"`
	UserID      string `json:"UserID"`
}

type Alert struct {
	RuleName     string      `json:"RuleName"`
	Severity     string      `json:"Severity"`
	Mitre        []string    `json:"Mitre"`
	KillChainTag string      `json:"KillChainTag"`
	MitreTag     interface{} `json:"MitreTag"`
	Context      string      `json:"Context"`
}

type Entry struct {
	Log   *Log   `json:"Log,omitempty"`
	Logs  *Log   `json:"Logs,omitempty"`
	Alert *Alert `json:"Alert,omitempty"`
}

type Event struct {
	ID          int              `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Entries     map[string]Entry `json:"entries"`
}

type EventResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

var events []Event
var eventResponse []EventResponse

func loadJSON(filePath string) {
	f, err := os.Open(filePath)
	if err != nil {
		log.Fatalf("Failed to open JSON file: %v", err)
	}
	defer f.Close()
	if err := json.NewDecoder(f).Decode(&events); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}
}

func getEvents(w http.ResponseWriter, _ *http.Request) {
	respondJSON(w, eventResponse)
}

func getEvent(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/events/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}
	for _, e := range events {
		if e.ID == id {
			respondJSON(w, e)
			return
		}
	}
	http.Error(w, "Event not found", http.StatusNotFound)
}

func getEntry(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	fmt.Println("Parts length:", len(parts), "Parts:", parts[0])
	if len(parts) != 5 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	eventID, _ := strconv.Atoi(parts[2])
	entryID := parts[4]
	for _, e := range events {
		if e.ID == eventID {
			entry, ok := e.Entries[entryID]
			if !ok {
				http.Error(w, "Entry not found", http.StatusNotFound)
				return
			}
			respondJSON(w, entry)
			return
		}
	}
	http.Error(w, "Event not found", http.StatusNotFound)
}

func respondJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func getEventResponse(events []Event) []EventResponse {
	var responses []EventResponse
	for _, e := range events {
		responses = append(responses, EventResponse{
			ID:          e.ID,
			Name:        e.Name,
			Description: e.Description,
		})
	}
	return responses
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/events/")
	parts := strings.Split(path, "/")

	if len(parts) == 1 {
		getEvent(w, r)
		return
	}
	if len(parts) == 3 && parts[1] == "entry" {
		getEntry(w, r)
		return
	}

	http.Error(w, "Invalid request", http.StatusBadRequest)
}

func main() {
	loadJSON("events.json")
	http.HandleFunc("/events/", handleEvents)
	http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet && r.URL.Path == "/events" {
			eventResponse = getEventResponse(events)
			getEvents(w, r)
			return
		}
		http.Error(w, "Not found", http.StatusNotFound)
	})

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
