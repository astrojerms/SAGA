package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/opensearch-project/opensearch-go"
)

// AlertResponse represents the OpenSearch alerting API response
type AlertResponse struct {
	Alerts []struct {
		ID           string `json:"id"`
		Monitor_Name string `json:"monitor_name"`
		State        string `json:"state"`
	} `json:"alerts"`
}

func main() {
	// OpenSearch connection details
	opensearchURL := "https://search-security-logs-kz5ihkp2ni2yz2dtscluphu35e.us-west-1.es.amazonaws.com:443" // e.g., "https://your-opensearch-endpoint:9200"
	username := "Turbulent8895"
	password := "m95$t$!Z7%45ky"

	// Validate that required environment variables are set
	if opensearchURL == "" || username == "" || password == "" {
		log.Fatalf("Missing OPENSEARCH_URL, OPENSEARCH_USER, or OPENSEARCH_PASS environment variables")
	}

	// Initialize OpenSearch client
	client, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{opensearchURL},
		Username:  username,
		Password:  password,
	})
	if err != nil {
		log.Fatalf("Error creating OpenSearch client: %v", err)
	}

	// Define the OpenSearch alerting API endpoint
	alertsEndpoint := opensearchURL + "/_plugins/_alerting/monitors/alerts"

	// Create HTTP request
	req, err := http.NewRequestWithContext(context.Background(), "GET", alertsEndpoint, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	// Set authentication
	req.SetBasicAuth(username, password)
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := client.Transport.Perform(req)
	if err != nil {
		log.Fatalf("Error executing OpenSearch request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error reading response body: %v", err)
	}

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		log.Fatalf("OpenSearch API error: %s\nResponse: %s", resp.Status, string(body))
	}

	// Parse JSON response
	var alerts AlertResponse
	if err := json.Unmarshal(body, &alerts); err != nil {
		log.Fatalf("Error parsing JSON response: %v", err)
	}

	// Print alert details
	fmt.Println("Open Alerts:")
	for _, alert := range alerts.Alerts {
		fmt.Printf("ID: %s | Monitor: %s | State: %s\n", alert.ID, alert.Monitor_Name, alert.State)
	}
}
