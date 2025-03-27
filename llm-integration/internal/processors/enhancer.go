package processors

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/emeganat31/security-alert-enhancer/internal/api"
	"github.com/emeganat31/security-alert-enhancer/internal/models"
	"github.com/emeganat31/security-alert-enhancer/internal/storage"
	"github.com/emeganat31/security-alert-enhancer/utils"
)

// AlertEnhancer processes security alerts and enhances them with LLM context
type AlertEnhancer struct {
	client  *api.AnthropicClient
	storage storage.Storage
	logger  *utils.Logger
}

// NewAlertEnhancer creates a new alert enhancer
func NewAlertEnhancer(client *api.AnthropicClient, storage storage.Storage, logger *utils.Logger) *AlertEnhancer {
	return &AlertEnhancer{
		client:  client,
		storage: storage,
		logger:  logger,
	}
}

// EnhanceAlert sends a security alert to the LLM and returns enhanced context
func (e *AlertEnhancer) EnhanceAlert(ctx context.Context, alert models.SecurityAlert) (*models.EnhancedAlert, error) {
	// Validate the alert
	validationErrors := alert.Validate()
	if len(validationErrors) > 0 {
		return nil, fmt.Errorf("invalid alert: %v", validationErrors)
	}

	// Construct prompt for the LLM
	prompt := constructPrompt(alert)

	// Send to LLM
	e.logger.Debug("Sending alert to LLM", "alert_id", alert.ID)
	response, err := e.client.SendPrompt(ctx, prompt, 2000)
	if err != nil {
		return nil, fmt.Errorf("error getting LLM response: %w", err)
	}

	// Extract and parse JSON
	jsonContent := api.ExtractJSON(response)
	var llmResponse struct {
		EnhancedContext    string                 `json:"enhanced_context"`
		PossibleTechniques []models.MitreTechnique `json:"possible_techniques"`
		RecommendedActions []string               `json:"recommended_actions"`
	}

	if err := json.Unmarshal([]byte(jsonContent), &llmResponse); err != nil {
		e.logger.Error("Error parsing LLM response", "error", err, "response", jsonContent)
		return nil, fmt.Errorf("error parsing LLM response: %w", err)
	}

	// Create enhanced alert
	enhancedAlert := &models.EnhancedAlert{
		OriginalAlert:      alert,
		EnhancedContext:    llmResponse.EnhancedContext,
		PossibleTechniques: llmResponse.PossibleTechniques,
		RecommendedActions: llmResponse.RecommendedActions,
		ProcessedAt:        time.Now(),
	}

	// Save enhanced alert
	if err := e.storage.SaveAlert(enhancedAlert); err != nil {
		e.logger.Error("Error saving enhanced alert", "error", err, "alert_id", alert.ID)
		return nil, fmt.Errorf("error saving enhanced alert: %w", err)
	}

	e.logger.Info("Alert successfully enhanced", 
		"alert_id", alert.ID, 
		"techniques", len(enhancedAlert.PossibleTechniques),
		"actions", len(enhancedAlert.RecommendedActions))

	return enhancedAlert, nil
}

// constructPrompt creates the prompt for the LLM
func constructPrompt(alert models.SecurityAlert) string {
	return fmt.Sprintf(`You are a security analyst. Analyze the following security alert and provide:
1. Enhanced context about what might be happening
2. Possible MITRE ATT&CK techniques that match this alert (include ID, name, and confidence level)
3. Recommended actions for security team

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "enhanced_context": "detailed explanation of the alert",
  "possible_techniques": [
    {
      "id": "TXXXX",
      "name": "Technique Name",
      "description": "Brief description of technique",
      "confidence": 0.XX
    }
  ],
  "recommended_actions": [
    "action 1",
    "action 2"
  ]
}

Security Alert:
ID: %s
Timestamp: %s
Source: %s
Description: %s
Severity: %s
Raw Data: %s
`, alert.ID, alert.Timestamp.Format(time.RFC3339), alert.Source, alert.Description, alert.Severity, alert.RawData)
}