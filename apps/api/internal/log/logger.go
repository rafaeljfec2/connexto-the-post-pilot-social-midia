package log

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

var Logger *zap.Logger

func InitLogger() error {
	var err error
	Logger, err = zap.NewProduction()
	if err != nil {
		return err
	}
	return nil
}

// StructuredLogger é um middleware Fiber para logs estruturados de requisições HTTP
func StructuredLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)
		Logger.Info("http_request",
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", c.Response().StatusCode()),
			zap.Duration("duration", duration),
		)
		return err
	}
}
