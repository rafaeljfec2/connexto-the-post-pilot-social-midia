package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	Server    ServerConfig
	MongoDB   MongoDBConfig
	JWT       JWTConfig
	RateLimit RateLimitConfig
	LinkedIn  LinkedInConfig
	Google    GoogleConfig
	Frontend  FrontendConfig
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port            string
	Env             string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
}

// MongoDBConfig holds MongoDB configuration
type MongoDBConfig struct {
	URL             string
	Database        string
	ConnectTimeout  time.Duration
	MaxPoolSize     uint64
	MinPoolSize     uint64
	MaxConnIdleTime time.Duration
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret            string
	Expiration        time.Duration
	RefreshExpiration time.Duration
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Max        int
	Expiration time.Duration
}

// LinkedInConfig holds LinkedIn OAuth configuration
type LinkedInConfig struct {
	ClientID           string
	ClientSecret       string
	RedirectURI        string
	PublishRedirectURI string
}

// GoogleConfig holds Google OAuth configuration
type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

// FrontendConfig holds frontend configuration
type FrontendConfig struct {
	URL string
}

var cfg *Config

// Load loads configuration from environment variables
func Load() *Config {
	if cfg != nil {
		return cfg
	}

	cfg = &Config{
		Server: ServerConfig{
			Port:            getEnv("PORT", "8081"),
			Env:             getEnv("ENV", "development"),
			ReadTimeout:     getDurationEnv("SERVER_READ_TIMEOUT", 30*time.Second),
			WriteTimeout:    getDurationEnv("SERVER_WRITE_TIMEOUT", 30*time.Second),
			ShutdownTimeout: getDurationEnv("SERVER_SHUTDOWN_TIMEOUT", 10*time.Second),
		},
		MongoDB: MongoDBConfig{
			URL:             getEnv("MONGO_URL", "mongodb://localhost:27017"),
			Database:        getEnv("MONGO_DB", "thepostpilot"),
			ConnectTimeout:  getDurationEnv("MONGO_CONNECT_TIMEOUT", 10*time.Second),
			MaxPoolSize:     getUint64Env("MONGO_MAX_POOL_SIZE", 100),
			MinPoolSize:     getUint64Env("MONGO_MIN_POOL_SIZE", 10),
			MaxConnIdleTime: getDurationEnv("MONGO_MAX_CONN_IDLE_TIME", 30*time.Second),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", ""),
			Expiration:        getDurationEnv("JWT_EXPIRATION", 24*time.Hour),
			RefreshExpiration: getDurationEnv("JWT_REFRESH_EXPIRATION", 7*24*time.Hour),
		},
		RateLimit: RateLimitConfig{
			Max:        getIntEnv("RATE_LIMIT_MAX", 100),
			Expiration: getDurationEnv("RATE_LIMIT_EXPIRATION", 1*time.Minute),
		},
		LinkedIn: LinkedInConfig{
			ClientID:           getEnv("LINKEDIN_CLIENT_ID", ""),
			ClientSecret:       getEnv("LINKEDIN_CLIENT_SECRET", ""),
			RedirectURI:        getEnv("LINKEDIN_REDIRECT_URI", ""),
			PublishRedirectURI: getEnv("LINKEDIN_PUBLISH_REDIRECT_URI", ""),
		},
		Google: GoogleConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURI:  getEnv("GOOGLE_REDIRECT_URI", ""),
		},
		Frontend: FrontendConfig{
			URL: getEnv("FRONT_END_URL", "http://localhost:3000"),
		},
	}

	return cfg
}

// Get returns the loaded configuration (must call Load first)
func Get() *Config {
	if cfg == nil {
		return Load()
	}
	return cfg
}

// IsProduction returns true if running in production environment
func (c *Config) IsProduction() bool {
	return c.Server.Env == "production"
}

// IsStaging returns true if running in staging environment
func (c *Config) IsStaging() bool {
	return c.Server.Env == "staging"
}

// IsDevelopment returns true if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.Server.Env == "development"
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// getDurationEnv gets a duration from an environment variable or returns a default value
func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// getIntEnv gets an integer from an environment variable or returns a default value
func getIntEnv(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

// getUint64Env gets a uint64 from an environment variable or returns a default value
func getUint64Env(key string, defaultValue uint64) uint64 {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.ParseUint(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}
