package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/astrojerms/saga/internal/response"
	"github.com/opensearch-project/opensearch-go"
)

// AlertResponse represents the OpenSearch alerting API response
type AlertResponse struct {
	Alerts []struct {
		ID           string `json:"id"`
		MonitorID    string `json:"monitor_id"`
		Monitor_Name string `json:"monitor_name"`
		State        string `json:"state"`
	} `json:"alerts"`
}

// SearchRequest represents the OpenSearch query request body
type SearchRequest struct {
	Query Query `json:"query"`
}

// Query defines the structure of a match query
type Query struct {
	Match Match `json:"match"`
}

// Match specifies the field and query text
type Match struct {
	Field string `json:"message"`
}

// SearchResponse represents the OpenSearch query response
type SearchResponse struct {
	Hits Hits `json:"hits"`
}

// Hits contains the list of matched documents
type Hits struct {
	Total struct {
		Value int `json:"value"`
	} `json:"total"`
	Hits []Hit `json:"hits"`
}

// Hit represents an individual document from the search results
type Hit struct {
	Source LogEntry `json:"_source"`
}

// LogEntry defines the structure of log entries
type LogEntry struct {
	Timestamp string `json:"@timestamp"`
	Message   string `json:"message"`
	Level     string `json:"level,omitempty"`
	Host      string `json:"host,omitempty"`
}

func (app *application) home(w http.ResponseWriter, r *http.Request) {
	data := app.newTemplateData(r)

	err := response.Page(w, http.StatusOK, data, "pages/home.tmpl")
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) search(w http.ResponseWriter, r *http.Request) {
	// OpenSearch configuration
	cfg := opensearch.Config{
		Addresses: []string{"https://your-opensearch-host:9200"}, // Update with your OpenSearch instance
		Username:  "admin",                                       // Update username
		Password:  "admin",                                       // Update password
	}

	client, err := opensearch.NewClient(cfg)
	if err != nil {
		app.logger.Error("Error creating OpenSearch client: %v", err)
	}

	// Define search query
	query := SearchRequest{
		Query: Query{
			Match: Match{
				Field: "error", // Search logs for the term "error"
			},
		},
	}

	// Convert query to JSON
	queryBody, err := json.Marshal(query)
	if err != nil {
		app.logger.Error("Error marshalling query: %v", err)
	}

	// Send request to OpenSearch
	index := "logs-*"
	resp, err := client.Search(
		client.Search.WithContext(context.Background()),
		client.Search.WithIndex(index),
		client.Search.WithBody(bytes.NewReader(queryBody)),
		client.Search.WithPretty(),
	)
	if err != nil {
		app.logger.Error("Error querying OpenSearch: %v", err)
	}
	defer resp.Body.Close()

	// Check HTTP response status
	if resp.StatusCode != http.StatusOK {
		app.logger.Error("Query failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var searchResponse SearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResponse); err != nil {
		app.logger.Error("Error decoding response: %v", err)
	}

	// Display results
	fmt.Printf("Found %d logs:\n", searchResponse.Hits.Total.Value)
	for _, hit := range searchResponse.Hits.Hits {
		app.logger.Error("[%s] %s - %s\n", hit.Source.Timestamp, hit.Source.Level, hit.Source.Message)
	}

}

func (app *application) alerts(w http.ResponseWriter, r *http.Request) {
	// Initialize OpenSearch client
	client, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{app.config.opensearch.address},
		Username:  app.config.opensearch.username,
		Password:  app.config.opensearch.password,
	})
	if err != nil {
		app.logger.Error("Error creating OpenSearch client: %v", err)
	}

	// Define the OpenSearch alerting API endpoint
	alertsEndpoint := app.config.opensearch.address + "/_plugins/_alerting/monitors/alerts"

	// Create HTTP request
	req, err := http.NewRequestWithContext(context.Background(), "GET", alertsEndpoint, nil)
	if err != nil {
		app.logger.Error("Error creating request: %v", err)
	}

	// Set authentication
	req.SetBasicAuth(app.config.opensearch.username, app.config.opensearch.password)
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := client.Transport.Perform(req)
	if err != nil {
		app.logger.Error("Error executing OpenSearch request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		app.logger.Error("Error reading response body: %v", err)
	}

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		app.logger.Error("OpenSearch API error: %s\nResponse: %s", resp.Status, string(body))
	}

	// Parse JSON response
	var alerts AlertResponse
	if err := json.Unmarshal(body, &alerts); err != nil {
		app.logger.Error("Error parsing JSON response: %v", err)
	}

	err = response.JSON(w, http.StatusOK, alerts)
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) protected(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("This is a protected handler"))
}
