package utils

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// LogLevel represents logging severity levels
type LogLevel int

const (
	DebugLevel LogLevel = iota
	InfoLevel
	WarnLevel
	ErrorLevel
	FatalLevel
)

// String returns the string representation of the log level
func (l LogLevel) String() string {
	switch l {
	case DebugLevel:
		return "DEBUG"
	case InfoLevel:
		return "INFO"
	case WarnLevel:
		return "WARN"
	case ErrorLevel:
		return "ERROR"
	case FatalLevel:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// ParseLogLevel parses a string into a LogLevel
func ParseLogLevel(level string) LogLevel {
	switch strings.ToUpper(level) {
	case "DEBUG":
		return DebugLevel
	case "INFO":
		return InfoLevel
	case "WARN", "WARNING":
		return WarnLevel
	case "ERROR":
		return ErrorLevel
	case "FATAL":
		return FatalLevel
	default:
		return InfoLevel
	}
}

// Logger provides a simple logging interface
type Logger struct {
	level  LogLevel
	logger *log.Logger
}

// NewLogger creates a new logger with default settings
func NewLogger() *Logger {
	level := InfoLevel
	if levelStr := os.Getenv("LOG_LEVEL"); levelStr != "" {
		level = ParseLogLevel(levelStr)
	}

	return &Logger{
		level:  level,
		logger: log.New(os.Stdout, "", 0),
	}
}

// SetLevel sets the logger's minimum log level
func (l *Logger) SetLevel(level LogLevel) {
	l.level = level
}

// formatMessage formats a log message with key-value pairs
func (l *Logger) formatMessage(msg string, keyvals ...interface{}) string {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	result := fmt.Sprintf("[%s] %s", timestamp, msg)

	// Handle key-value pairs
	if len(keyvals) > 0 {
		kvStrings := make([]string, 0, len(keyvals)/2)
		for i := 0; i < len(keyvals); i += 2 {
			key := fmt.Sprintf("%v", keyvals[i])
			var value interface{} = "missing"
			if i+1 < len(keyvals) {
				value = keyvals[i+1]
			}
			kvStrings = append(kvStrings, fmt.Sprintf("%s=%v", key, value))
		}
		result += " " + strings.Join(kvStrings, " ")
	}

	return result
}

// log logs a message at the specified level
func (l *Logger) log(level LogLevel, msg string, keyvals ...interface{}) {
	if level < l.level {
		return
	}

	formattedMsg := l.formatMessage(msg, keyvals...)
	l.logger.Printf("[%s] %s", level.String(), formattedMsg)
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, keyvals ...interface{}) {
	l.log(DebugLevel, msg, keyvals...)
}

// Info logs an info message
func (l *Logger) Info(msg string, keyvals ...interface{}) {
	l.log(InfoLevel, msg, keyvals...)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, keyvals ...interface{}) {
	l.log(WarnLevel, msg, keyvals...)
}

// Error logs an error message
func (l *Logger) Error(msg string, keyvals ...interface{}) {
	l.log(ErrorLevel, msg, keyvals...)
}

// Fatal logs a fatal message and exits the program
func (l *Logger) Fatal(msg string, keyvals ...interface{}) {
	l.log(FatalLevel, msg, keyvals...)
	os.Exit(1)
}