package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	appPkg "github.com/postpilot/api/internal/app"
	"github.com/postpilot/api/internal/di"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/middleware"
	"go.uber.org/zap"
)

// @title The Post Pilot API
// @version 1.0
// @description API for The Post Pilot Social Media Management
// @host localhost:8081
// @BasePath /the-post-pilot/v1
// @schemes http https
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	_ = godotenv.Load()
	if err := log.InitLogger(); err != nil {
		panic("Failed to initialize structured logger: " + err.Error())
	}
	defer log.Logger.Sync()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Initialize dependencies using Wire DI
	application, err := di.InitializeApp()
	if err != nil {
		log.Logger.Fatal("Failed to initialize application dependencies", zap.Error(err))
	}

	fiberApp := fiber.New(fiber.Config{
		AppName: "Post Pilot API",
	})

	// Global middlewares
	fiberApp.Use(cors.New())
	fiberApp.Use(middleware.RateLimit())
	fiberApp.Use(log.StructuredLogger())

	// Register routes with injected handlers
	appPkg.RegisterRoutes(
		fiberApp,
		application.AuthHandler,
		application.ArticleHandler,
		application.PostHandler,
	)

	log.Logger.Info("Starting Fiber server", zap.String("port", port))
	if err := fiberApp.Listen(":" + port); err != nil {
		log.Logger.Fatal("Fiber server failed", zap.Error(err))
	}
}
