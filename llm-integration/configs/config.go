package configs

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// Config holds the application configuration
type Config struct {
	Anthropic struct {
		Model   string        `json:"model"`
		Timeout time.Duration `json:"timeout"`
	} `json:"anthropic"`
	Storage struct {
		Directory string `json:"directory"`
	} `json:"storage"`
	Logging struct {
		Level  string `json:"level"`
		Format string `json:"format"`
	} `json:"logging"`
}

// DefaultConfig returns a configuration with default values
func DefaultConfig() *Config {
	config := &Config{}
	config.Anthropic.Model = "claude-3-7-sonnet-20250219"
	config.Anthropic.Timeout = 30 * time.Second
	config.Storage.Directory = "data"
	config.Logging.Level = "info"
	config.Logging.Format = "json"
	return config
}

// LoadConfig loads the configuration from a file
func LoadConfig() (*Config, error) {
	config := DefaultConfig()

	// Check if config file exists
	configFile := "config.json"
	if os.Getenv("CONFIG_FILE") != "" {
		configFile = os.Getenv("CONFIG_FILE")
	}

	if _, err := os.Stat(configFile); err == nil {
		file, err := os.ReadFile(configFile)
		if err != nil {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}

		if err := json.Unmarshal(file, config); err != nil {
			return nil, fmt.Errorf("error parsing config file: %w", err)
		}
	}

	// Override with environment variables if present
	if os.Getenv("ANTHROPIC_MODEL") != "" {
		config.Anthropic.Model = os.Getenv("ANTHROPIC_MODEL")
	}

	if os.Getenv("ANTHROPIC_TIMEOUT") != "" {
		timeout, err := time.ParseDuration(os.Getenv("ANTHROPIC_TIMEOUT"))
		if err == nil {
			config.Anthropic.Timeout = timeout
		}
	}

	if os.Getenv("STORAGE_DIRECTORY") != "" {
		config.Storage.Directory = os.Getenv("STORAGE_DIRECTORY")
	}

	if os.Getenv("LOG_LEVEL") != "" {
		config.Logging.Level = os.Getenv("LOG_LEVEL")
	}

	if os.Getenv("LOG_FORMAT") != "" {
		config.Logging.Format = os.Getenv("LOG_FORMAT")
	}

	return config, nil
}

// SaveConfig saves the configuration to a file
func SaveConfig(config *Config, filename string) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling config: %w", err)
	}

	if err := os.WriteFile(filename, data, 0644); err != nil {
		return fmt.Errorf("error writing config file: %w", err)
	}

	return nil
}