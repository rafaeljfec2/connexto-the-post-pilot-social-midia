package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	appPkg "github.com/postpilot/api/internal/app"
	"github.com/postpilot/api/internal/middleware"
	"github.com/postpilot/api/internal/repositories"
	"github.com/postpilot/api/internal/services"
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
	_ = godotenv.Load() // Carrega variáveis do .env
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	app := fiber.New(fiber.Config{
		AppName: "Post Pilot API",
	})

	// Middlewares globais
	app.Use(logger.New())
	app.Use(cors.New())
	app.Use(middleware.RateLimit())

	// Inicialização dos repositórios e serviços
	repo, err := repositories.NewUserRepository()
	if err != nil {
		log.Fatalf("Failed to initialize user repository: %v", err)
	}
	authService := services.NewAuthService(repo)
	authHandler := appPkg.NewAuthHandler(authService)

	articleService := services.NewArticleService()
	articleHandler := appPkg.NewArticleHandler(articleService, authService)

	// Centralize as rotas
	appPkg.RegisterRoutes(app, authHandler, articleHandler)

	log.Printf("Starting Fiber server on port %s...", port)
	log.Fatal(app.Listen(":" + port))
}
