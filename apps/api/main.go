package main

import (
	"log"
	"os"

	_ "apps/api/docs" // swagger docs

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"apps/api/internal/repositories"
	"apps/api/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	app := gin.Default()

	// Swagger docs
	app.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Inicialização dos repositórios e serviços
	repo, err := repositories.NewUserRepository()
	if err != nil {
		log.Fatalf("Failed to initialize user repository: %v", err)
	}
	authService := services.NewAuthService(repo)
	authHandler := app.NewAuthHandler(authService)
	app.RegisterAuthRoutes(app, authHandler)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s...", port)

	log.Fatal(app.Run(":" + port))
}

// @title The Post Pilot API
// @version 1.0
// @description API for The Post Pilot Social Media Management
// @host localhost:8080
// @BasePath /api/v1
