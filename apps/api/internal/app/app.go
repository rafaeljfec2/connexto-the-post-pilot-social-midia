package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// New creates a new Fiber application
func New() *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "Post Pilot API",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	return app
}
