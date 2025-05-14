package main

import (
	"log"
	"os"

	_ "apps/api/docs" // swagger docs

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Create new Fiber app
	app := gin.Default()

	// Swagger docs
	app.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Log startup information
	log.Printf("Starting server on port %s...", port)
	log.Println("Available routes:")
	for _, route := range app.GetRoutes() {
		log.Printf("%s %s", route.Method, route.Path)
	}

	// Start server
	log.Fatal(app.Run(":" + port))
}

// @title The Post Pilot API
// @version 1.0
// @description API for The Post Pilot Social Media Management
// @host localhost:8080
// @BasePath /api/v1
