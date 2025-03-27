package models

import (
	"time"
)

// SecurityAlert represents a basic security alert
type SecurityAlert struct {
	ID          string    `json:"id"`
	Timestamp   time.Time `json:"timestamp"`
	Source      string    `json:"source"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"`
	RawData     string    `json:"raw_data"`
}

// MitreTechnique represents a MITRE ATT&CK technique
type MitreTechnique struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Confidence  float64 `json:"confidence"`
}

// EnhancedAlert contains the original alert plus LLM-enhanced information
type EnhancedAlert struct {
	OriginalAlert      SecurityAlert   `json:"original_alert"`
	EnhancedContext    string          `json:"enhanced_context"`
	PossibleTechniques []MitreTechnique `json:"possible_techniques"`
	RecommendedActions []string        `json:"recommended_actions"`
	ProcessedAt        time.Time       `json:"processed_at"`
}

// ValidationError represents an error when validating an alert
type ValidationError struct {
	Field   string
	Message string
}

// Validate checks if the security alert is valid
func (a *SecurityAlert) Validate() []ValidationError {
	var errors []ValidationError

	if a.ID == "" {
		errors = append(errors, ValidationError{Field: "ID", Message: "ID cannot be empty"})
	}

	if a.Timestamp.IsZero() {
		errors = append(errors, ValidationError{Field: "Timestamp", Message: "Timestamp cannot be empty"})
	}

	if a.Source == "" {
		errors = append(errors, ValidationError{Field: "Source", Message: "Source cannot be empty"})
	}

	if a.Description == "" {
		errors = append(errors, ValidationError{Field: "Description", Message: "Description cannot be empty"})
	}

	if a.Severity == "" {
		errors = append(errors, ValidationError{Field: "Severity", Message: "Severity cannot be empty"})
	}

	return errors
}