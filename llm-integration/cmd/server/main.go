package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/emeganat31/security-alert-enhancer/configs"
	"github.com/emeganat31/security-alert-enhancer/internal/api"
	"github.com/emeganat31/security-alert-enhancer/internal/models"
	"github.com/emeganat31/security-alert-enhancer/internal/processors"
	"github.com/emeganat31/security-alert-enhancer/internal/storage"
	"github.com/emeganat31/security-alert-enhancer/utils"
)

func main() {
	// Initialize logger
	logger := utils.NewLogger()
	logger.Info("Starting security alert enhancer")

	// Load configuration
	config, err := configs.LoadConfig()
	if err != nil {
		logger.Fatal("Failed to load configuration", "error", err)
	}

	// Check for API key in environment
	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	if apiKey == "" {
		logger.Fatal("ANTHROPIC_API_KEY environment variable not set")
	}

	// Initialize Anthropic client
	client := api.NewAnthropicClient(apiKey, config.Anthropic.Timeout)

	// Initialize storage
	store := storage.NewFileStorage(config.Storage.Directory)

	// Initialize enhancer
	enhancer := processors.NewAlertEnhancer(client, store, logger)

	// Process example alert
	alert := models.SecurityAlert{
		ID:          "SEC-2025-03129",
		Timestamp:   time.Now(),
		Source:      "Endpoint Detection System",
		Description: "Multiple failed authentication attempts detected from unusual IP address",
		Severity:    "High",
		RawData:     "User: admin, IP: 203.0.113.100, Failed attempts: 25, Time window: 180 seconds, Source country: Ukraine",
	}

	ctx := context.Background()
	enhancedAlert, err := enhancer.EnhanceAlert(ctx, alert)
	if err != nil {
		logger.Error("Error enhancing alert", "error", err, "alert_id", alert.ID)
		os.Exit(1)
	}

	// Display results
	fmt.Println("Alert enhancement successful!")
	fmt.Printf("Enhanced context: %s\n\n", enhancedAlert.EnhancedContext)
	fmt.Println("MITRE ATT&CK techniques identified:")
	for _, technique := range enhancedAlert.PossibleTechniques {
		fmt.Printf("- %s (%s): Confidence %.2f\n", technique.Name, technique.ID, technique.Confidence)
	}
	fmt.Println("\nRecommended actions:")
	for i, action := range enhancedAlert.RecommendedActions {
		fmt.Printf("%d. %s\n", i+1, action)
	}

	logger.Info("Alert enhancement completed", "alert_id", alert.ID, "techniques_found", len(enhancedAlert.PossibleTechniques))
}