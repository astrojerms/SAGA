package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/emeganat31/security-alert-enhancer/internal/models"
)

// Storage defines the interface for storing enhanced alerts
type Storage interface {
	SaveAlert(alert *models.EnhancedAlert) error
	GetAlert(id string) (*models.EnhancedAlert, error)
	ListAlerts() ([]*models.EnhancedAlert, error)
}

// FileStorage implements Storage using the filesystem
type FileStorage struct {
	baseDir string
}

// NewFileStorage creates a new file-based storage
func NewFileStorage(baseDir string) *FileStorage {
	if baseDir == "" {
		baseDir = "data"
	}

	// Create directory if it doesn't exist
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		os.MkdirAll(baseDir, 0755)
	}

	return &FileStorage{
		baseDir: baseDir,
	}
}

// SaveAlert saves an enhanced alert to the filesystem
func (s *FileStorage) SaveAlert(alert *models.EnhancedAlert) error {
	data, err := json.MarshalIndent(alert, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling alert: %w", err)
	}

	// Create filename with alert ID and timestamp
	timestamp := time.Now().Format("20060102-150405")
	filename := filepath.Join(s.baseDir, fmt.Sprintf("%s-%s.json", alert.OriginalAlert.ID, timestamp))

	if err := os.WriteFile(filename, data, 0644); err != nil {
		return fmt.Errorf("error writing file: %w", err)
	}

	return nil
}

// GetAlert retrieves an alert by ID (most recent version)
func (s *FileStorage) GetAlert(id string) (*models.EnhancedAlert, error) {
	pattern := filepath.Join(s.baseDir, fmt.Sprintf("%s-*.json", id))
	matches, err := filepath.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("error finding alert files: %w", err)
	}

	if len(matches) == 0 {
		return nil, fmt.Errorf("alert with ID %s not found", id)
	}

	// Get the most recent file (last in sorted list)
	latestFile := matches[len(matches)-1]
	data, err := os.ReadFile(latestFile)
	if err != nil {
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	var alert models.EnhancedAlert
	if err := json.Unmarshal(data, &alert); err != nil {
		return nil, fmt.Errorf("error unmarshaling alert: %w", err)
	}

	return &alert, nil
}

// ListAlerts returns all alerts (most recent versions)
func (s *FileStorage) ListAlerts() ([]*models.EnhancedAlert, error) {
	files, err := os.ReadDir(s.baseDir)
	if err != nil {
		return nil, fmt.Errorf("error reading directory: %w", err)
	}

	// Map to store the latest file for each alert ID
	latestFiles := make(map[string]string)
	for _, file := range files {
		if file.IsDir() || filepath.Ext(file.Name()) != ".json" {
			continue
		}

		// Extract alert ID from filename (format: ID-TIMESTAMP.json)
		filename := file.Name()
		parts := strings.SplitN(filename, "-", 2)
		if len(parts) < 2 {
			continue
		}

		id := parts[0]
		if currentFile, exists := latestFiles[id]; !exists || filename > currentFile {
			latestFiles[id] = filepath.Join(s.baseDir, filename)
		}
	}

	// Read all latest alerts
	var alerts []*models.EnhancedAlert
	for _, filePath := range latestFiles {
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var alert models.EnhancedAlert
		if err := json.Unmarshal(data, &alert); err != nil {
			continue
		}

		alerts = append(alerts, &alert)
	}

	return alerts, nil
}