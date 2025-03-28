package main

import (
	"flag"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
	"strconv"
	"sync"

	"github.com/astrojerms/saga/internal/database"
	"github.com/astrojerms/saga/internal/smtp"
	"github.com/astrojerms/saga/internal/version"
	"github.com/joho/godotenv"

	"github.com/gorilla/sessions"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))

	err := run(logger)
	if err != nil {
		trace := string(debug.Stack())
		logger.Error(err.Error(), "trace", trace)
		os.Exit(1)
	}
}

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
type LogLine struct {
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
	CommandLine string `json:"CommandLine,omitempty"`
}

type Alert struct {
	RuleName     string   `json:"RuleName"`
	Severity     string   `json:"Severity"`
	Mitre        []string `json:"Mitre"`
	KillChainTag string   `json:"KillChainTag"`
	Context      string   `json:"Context"`
	Source       string   `json:"Source"`
	Log          LogLine  `json:"Log"`
}

type config struct {
	baseURL   string
	httpPort  int
	basicAuth struct {
		username       string
		hashedPassword string
	}
	cookie struct {
		secretKey string
	}
	db struct {
		dsn         string
		automigrate bool
	}
	session struct {
		secretKey    string
		oldSecretKey string
	}
	smtp struct {
		host     string
		port     int
		username string
		password string
		from     string
	}
	opensearch struct {
		address  string
		username string
		password string
	}
	devData struct {
		rules  []Rule
		logs   []LogLine
		alerts []Alert
	}
}

type application struct {
	config       *config
	db           *database.DB
	logger       *slog.Logger
	mailer       *smtp.Mailer
	sessionStore *sessions.CookieStore
	wg           sync.WaitGroup
}

func run(logger *slog.Logger) error {
	cfg := loadConfig(".env")

	showVersion := flag.Bool("version", false, "display version and exit")

	flag.Parse()

	if *showVersion {
		fmt.Printf("version: %s\n", version.Get())
		return nil
	}

	db, err := database.New(cfg.db.dsn, cfg.db.automigrate)
	if err != nil {
		return err
	}
	defer db.Close()

	mailer, err := smtp.NewMailer(cfg.smtp.host, cfg.smtp.port, cfg.smtp.username, cfg.smtp.password, cfg.smtp.from)
	if err != nil {
		return err
	}

	keyPairs := [][]byte{[]byte(cfg.session.secretKey), nil}
	if cfg.session.oldSecretKey != "" {
		keyPairs = append(keyPairs, []byte(cfg.session.oldSecretKey), nil)
	}

	sessionStore := sessions.NewCookieStore(keyPairs...)
	sessionStore.Options = &sessions.Options{
		HttpOnly: true,
		MaxAge:   86400 * 7,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Secure:   true,
	}

	app := &application{
		config:       cfg,
		db:           db,
		logger:       logger,
		mailer:       mailer,
		sessionStore: sessionStore,
	}

	return app.serveHTTP()
}

// Helper function to get environment variables with a fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return fallback
}

func loadConfig(envFile string) *config {
	// Load .env file if it exists
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("No %s file found, using system environment variables\n", envFile)
	}

	// Note: default values are set here, but they should be overridden by environment variables or the .env file
	cfg := &config{
		baseURL:  getEnv("BASE_URL", "http://localhost:4444"),
		httpPort: getEnvInt("HTTP_PORT", 4444),
	}

	cfg.basicAuth.username = getEnv("BASIC_AUTH_USERNAME", "admin")
	cfg.basicAuth.hashedPassword = getEnv("BASIC_AUTH_HASHED_PASSWORD", "$2a$10$jRb2qniNcoCyQM23T59RfeEQUbgdAXfR6S0scynmKfJa5Gj3arGJa")

	cfg.cookie.secretKey = getEnv("COOKIE_SECRET_KEY", "EXAMPLE_COOKIE_SECRET_KEY")

	cfg.db.dsn = getEnv("DB_DSN", "myuser:mypassword@localhost:5432/mydb")
	cfg.db.automigrate = getEnvBool("DB_AUTOMIGRATE", true)

	cfg.session.secretKey = getEnv("SESSION_SECRET_KEY", "EXAMPLE_SECRET_KEY")
	cfg.session.oldSecretKey = getEnv("SESSION_OLD_SECRET_KEY", "")

	cfg.smtp.host = getEnv("SMTP_HOST", "example.smtp.host")
	cfg.smtp.port = getEnvInt("SMTP_PORT", 25)
	cfg.smtp.username = getEnv("SMTP_USERNAME", "example_username")
	cfg.smtp.password = getEnv("SMTP_PASSWORD", "smtp_password")
	cfg.smtp.from = getEnv("SMTP_FROM", "Example Name <no_reply@example.org>")

	cfg.opensearch.address = getEnv("OPENSEARCH_ADDRESS", "http://localhost:9200")
	cfg.opensearch.username = getEnv("OPENSEARCH_USERNAME", "example_user")
	cfg.opensearch.password = getEnv("OPENSEARCH_PASSWORD", "example_password")

	return cfg
}
