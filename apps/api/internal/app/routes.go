package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	_ "github.com/postpilot/api/docs" // swagger docs (gerado pelo swag)
)

func RegisterRoutes(app *fiber.App, authHandler *AuthHandler) {
	// Swagger docs
	app.Get("/the-post-pilot/swagger/*", swagger.New())

	// Health check
	app.Get("/the-post-pilot/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth routes
	auth := app.Group("/the-post-pilot/v1/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/social", authHandler.SocialLogin)
	auth.Post("/refresh", authHandler.RefreshToken)
}
