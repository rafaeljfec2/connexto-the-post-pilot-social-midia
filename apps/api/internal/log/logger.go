package log

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/postpilot/api/internal/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	RequestIDKey = "requestId"
)

var Logger *zap.Logger

// InitLogger initializes the logger based on environment
func InitLogger() error {
	cfg := config.Get()
	var err error

	if cfg.IsDevelopment() {
		Logger, err = createDevelopmentLogger()
	} else {
		Logger, err = createProductionLogger()
	}

	if err != nil {
		return err
	}
	return nil
}

func createDevelopmentLogger() (*zap.Logger, error) {
	config := zap.NewDevelopmentConfig()
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	return config.Build()
}

func createProductionLogger() (*zap.Logger, error) {
	config := zap.NewProductionConfig()
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	config.Level = getLogLevel()
	return config.Build()
}

func getLogLevel() zap.AtomicLevel {
	level := os.Getenv("LOG_LEVEL")
	switch level {
	case "debug":
		return zap.NewAtomicLevelAt(zapcore.DebugLevel)
	case "info":
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	case "warn":
		return zap.NewAtomicLevelAt(zapcore.WarnLevel)
	case "error":
		return zap.NewAtomicLevelAt(zapcore.ErrorLevel)
	default:
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	}
}

// StructuredLogger is a Fiber middleware for structured HTTP request logging
func StructuredLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		duration := time.Since(start)
		status := c.Response().StatusCode()

		fields := []zap.Field{
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", status),
			zap.Duration("duration", duration),
			zap.String("ip", c.IP()),
			zap.String("userAgent", c.Get("User-Agent")),
		}

		if requestID, ok := c.Locals(RequestIDKey).(string); ok && requestID != "" {
			fields = append(fields, zap.String("requestId", requestID))
		}

		if userID, ok := c.Locals("userId").(string); ok && userID != "" {
			fields = append(fields, zap.String("userId", userID))
		}

		if status >= 500 {
			Logger.Error("http_request", fields...)
		} else if status >= 400 {
			Logger.Warn("http_request", fields...)
		} else {
			Logger.Info("http_request", fields...)
		}

		return err
	}
}

// WithRequestID returns a logger with request ID field
func WithRequestID(requestID string) *zap.Logger {
	return Logger.With(zap.String("requestId", requestID))
}
