package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	anthropicAPIURL     = "https://api.anthropic.com/v1/messages"
	anthropicAPIVersion = "2023-06-01"
	defaultModelName    = "claude-3-7-sonnet-20250219"
)

// AnthropicClient handles communication with Anthropic API
type AnthropicClient struct {
	apiKey     string
	httpClient *http.Client
	modelName  string
}

// Message represents a message in the Anthropic conversation
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// AnthropicRequest represents the request structure for Anthropic API
type AnthropicRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	MaxTokens int       `json:"max_tokens"`
}

// AnthropicResponse represents the response from Anthropic API
type AnthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
		Type string `json:"type"`
	} `json:"content"`
	Model      string `json:"model"`
	ID         string `json:"id"`
	Type       string `json:"type"`
	StopReason string `json:"stop_reason"`
}

// NewAnthropicClient creates a new client for Anthropic API
func NewAnthropicClient(apiKey string, timeout time.Duration) *AnthropicClient {
	if timeout == 0 {
		timeout = 30 * time.Second
	}
	
	return &AnthropicClient{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		modelName: defaultModelName,
	}
}

// WithModel sets a custom model name
func (c *AnthropicClient) WithModel(modelName string) *AnthropicClient {
	c.modelName = modelName
	return c
}

// SendPrompt sends a prompt to the Anthropic API and returns the response
func (c *AnthropicClient) SendPrompt(ctx context.Context, prompt string, maxTokens int) (string, error) {
	if maxTokens <= 0 {
		maxTokens = 2000
	}

	// Prepare request
	anthropicRequest := AnthropicRequest{
		Model: c.modelName,
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens: maxTokens,
	}

	reqBody, err := json.Marshal(anthropicRequest)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", anthropicAPIURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", anthropicAPIVersion)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error sending request to Anthropic: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("non-200 response from Anthropic: %d - %s", resp.StatusCode, string(body))
	}

	var anthropicResp AnthropicResponse
	if err := json.NewDecoder(resp.Body).Decode(&anthropicResp); err != nil {
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	if len(anthropicResp.Content) == 0 || anthropicResp.Content[0].Type != "text" {
		return "", fmt.Errorf("unexpected response format from Anthropic")
	}

	return anthropicResp.Content[0].Text, nil
}

// ExtractJSON extracts JSON from a text response that might include markdown
func ExtractJSON(text string) string {
	// Try to find JSON between triple backticks
	if strings.Contains(text, "```json") {
		parts := strings.Split(text, "```json")
		if len(parts) > 1 {
			jsonPart := strings.Split(parts[1], "```")[0]
			return strings.TrimSpace(jsonPart)
		}
	}
	
	// Try to find JSON between single backticks
	if strings.Contains(text, "`{") && strings.Contains(text, "}`") {
		start := strings.Index(text, "`{")
		end := strings.LastIndex(text, "}`")
		if start != -1 && end != -1 && end > start {
			return strings.TrimSpace(text[start+1 : end+1])
		}
	}
	
	// If the content already looks like JSON, return it
	trimmed := strings.TrimSpace(text)
	if strings.HasPrefix(trimmed, "{") && strings.HasSuffix(trimmed, "}") {
		return trimmed
	}
	
	// Return original text as fallback
	return text
}