package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	appPkg "github.com/postpilot/api/internal/app"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/middleware"
	"github.com/postpilot/api/internal/repositories"
	"github.com/postpilot/api/internal/services"
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

	app := fiber.New(fiber.Config{
		AppName: "Post Pilot API",
	})

	// Middlewares globais
	app.Use(cors.New())
	app.Use(middleware.RateLimit())
	app.Use(log.StructuredLogger())

	repo, err := repositories.NewUserRepository()
	if err != nil {
		log.Logger.Fatal("Failed to initialize user repository", zap.Error(err))
	}
	authService := services.NewAuthService(repo)
	authHandler := appPkg.NewAuthHandler(authService)

	articleService := services.NewArticleService()
	articleHandler := appPkg.NewArticleHandler(articleService, authService)

	postService := services.NewPostService()
	postHandler := appPkg.NewPostHandler(postService, authService)

	appPkg.RegisterRoutes(app, authHandler, articleHandler, postHandler)

	log.Logger.Info("Starting Fiber server", zap.String("port", port))
	if err := app.Listen(":" + port); err != nil {
		log.Logger.Fatal("Fiber server failed", zap.Error(err))
	}
}
