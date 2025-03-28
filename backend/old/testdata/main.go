package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

// Rule represents a detection rule.
type Rule struct {
	RuleName  string `json:"RuleName"`
	Detection struct {
		Contains map[string][]string `json:"Contains"`
	} `json:"Detection"`
	Severity     string      `json:"Severity"`
	Mitre        []string    `json:"Mitre"`
	KillChainTag string      `json:"KillChainTag"`
	MitreTag     interface{} `json:"MitreTag"`
	Context      string      `json:"Context"`
	Source       string      `json:"Source"`
}

// LogEntry represents a single log entry.
type LogEntry struct {
	LogId       string `json:"logId"`
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
	ProcessID   string `json:"ProcessId"`
	CommandLine string `json:"CommandLine,omitempty"` // Some logs may contain command lines
}

type Alert struct {
	RuleName     string   `json:"RuleName"`
	Severity     string   `json:"Severity"`
	Mitre        []string `json:"Mitre"`
	KillChainTag string   `json:"KillChainTag"`
	Context      string   `json:"Context"`
	Source       string   `json:"Source"`
	Log          LogEntry `json:"Log"`
}

// Load JSON rules from a file.
// func loadJSONLFile[T any](filename string) ([]T, error) {
// 	file, err := os.Open(filename)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer file.Close()

// 	var items []T
// 	scanner := bufio.NewScanner(file)

// 	for scanner.Scan() {
// 		var item T
// 		err := json.Unmarshal(scanner.Bytes(), &item)
// 		if err != nil {
// 			fmt.Println("Error parsing JSON:", err)
// 			continue
// 		}
// 		items = append(items, item)
// 	}

// 	if err := scanner.Err(); err != nil {
// 		return nil, err
// 	}

// 	return items, nil
// }

func loadJSONFile[T any](filename string) ([]T, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var items []T
	err = json.Unmarshal(data, &items)
	if err != nil {
		return nil, err
	}
	return items, nil
}

// Check if a log entry matches a rule's detection criteria.
func matchesRule(log LogEntry, rule Rule) bool {
	for field, values := range rule.Detection.Contains {
		var logValue string

		// Determine which log field to check.
		switch field {
		case "CommandLine":
			logValue = log.CommandLine
		case "SourceImage":
			logValue = log.SourceImage
		case "TargetImage":
			logValue = log.TargetImage
		default:
			continue
		}

		// If the log field is empty, skip it.
		if logValue == "" {
			return false
		}

		// Check if any of the rule values are contained within the log field.
		for _, val := range values {
			if strings.Contains(strings.ToLower(logValue), strings.ToLower(val)) {
				break
			}
		}
		return false
	}
	return true
}

// Process logs in JSONL format line by line.
func processLogs(rules []Rule, logFilename string) {
	file, err := os.Open(logFilename)
	if err != nil {
		fmt.Println("Error opening log file:", err)
		os.Exit(1)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	output, err := os.OpenFile("alerts.json", os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer output.Close()
	alerts := []Alert{}
	for scanner.Scan() {
		var log LogEntry
		// count lines and print line number of error
		lineNumber := 0
		lineNumber++
		err := json.Unmarshal(scanner.Bytes(), &log)
		if err != nil {
			fmt.Println("Line: ", lineNumber, "Error parsing log JSON:", err)
			continue
		}

		for _, rule := range rules {

			if matchesRule(log, rule) {
				alerts = append(alerts, Alert{
					RuleName:     rule.RuleName,
					Severity:     rule.Severity,
					Mitre:        rule.Mitre,
					KillChainTag: rule.KillChainTag,
					Context:      rule.Context,
					Source:       rule.Source,
					Log:          log,
				})
			}
		}
	}
	encoder := json.NewEncoder(output)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(alerts); err != nil {
		fmt.Println("Error encoding JSON:", err)
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading log file:", err)
	}
}

func main() {
	// Load rules from JSON lines file.
	rules, err := loadJSONFile[Rule]("rules.json")
	if err != nil {
		fmt.Println("Error loading rules:", err)
		os.Exit(1)
	}

	// Process logs from JSON lines file.
	processLogs(rules, "logs.jsonl")
}
