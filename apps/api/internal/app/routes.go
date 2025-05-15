package app

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, authHandler *AuthHandler) {
	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth routes
	auth := app.Group("/the-post-pilot/v1/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/social", authHandler.SocialLogin)
	auth.Post("/refresh", authHandler.RefreshToken)
}
