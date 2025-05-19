package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/postpilot/api/internal/log"
	"go.uber.org/zap"
)

// JWTAuth é um middleware que valida o token JWT
func JWTAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Obtém o token do header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			log.Logger.Warn("Missing Authorization header", zap.String("endpoint", c.Path()))
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header is required",
			})
		}

		// Verifica se o header começa com "Bearer "
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Logger.Warn("Invalid Authorization header format", zap.String("endpoint", c.Path()))
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		// Extrai o token
		tokenStr := parts[1]

		// Valida o token
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			// Verifica o método de assinatura
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			log.Logger.Warn("Invalid JWT token", zap.Error(err), zap.String("endpoint", c.Path()))
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Extrai as claims do token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Logger.Warn("Invalid JWT claims", zap.String("endpoint", c.Path()))
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token claims",
			})
		}

		// Adiciona as claims ao contexto para uso posterior
		c.Locals("user", claims)
		log.Logger.Info("JWT authentication success", zap.String("endpoint", c.Path()))
		return c.Next()
	}
}
