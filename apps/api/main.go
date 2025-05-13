package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/postpilot/api/internal/app"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Create new Fiber app
	app := app.New()

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
	log.Fatal(app.Listen(":" + port))
} 