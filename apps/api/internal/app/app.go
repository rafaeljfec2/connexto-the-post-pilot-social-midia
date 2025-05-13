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

	// Routes
	setupRoutes(app)

	return app
}

// setupRoutes configures all the routes for the application
func setupRoutes(app *fiber.App) {
	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// API routes
	api := app.Group("/api")
	
	// Version 1
	v1 := api.Group("/v1")
	
	// Add your routes here
	v1.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Post Pilot API v1",
		})
	})
} 