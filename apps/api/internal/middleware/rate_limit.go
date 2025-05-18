package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimit configura o rate limiting para a API
func RateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        20,              // Número máximo de requisições
		Expiration: 1 * time.Minute, // Período de expiração
		KeyGenerator: func(c *fiber.Ctx) string {
			// Usa o IP do cliente como chave para o rate limiting
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded. Please try again later.",
			})
		},
	})
}
