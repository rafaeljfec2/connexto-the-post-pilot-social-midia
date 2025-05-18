package app

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	_ "github.com/postpilot/api/docs" // swagger docs (gerado pelo swag)
	"github.com/postpilot/api/internal/middleware"
)

func RegisterRoutes(app *fiber.App, authHandler *AuthHandler) {
	// Swagger docs
	app.Get("/the-post-pilot/swagger/*", swagger.New())

	// Health check
	app.Get("/the-post-pilot/v1/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth routes (públicas)
	auth := app.Group("/the-post-pilot/v1/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/social", authHandler.SocialLogin)
	auth.Post("/refresh", authHandler.RefreshToken)

	// Rotas protegidas
	protected := app.Group("/the-post-pilot/v1", middleware.JWTAuth(os.Getenv("JWT_SECRET")))

	// Exemplo de rota protegida
	protected.Get("/me", func(c *fiber.Ctx) error {
		user := c.Locals("user")
		return c.JSON(fiber.Map{
			"user": user,
		})
	})
}
