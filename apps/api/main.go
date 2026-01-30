package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	appPkg "github.com/postpilot/api/internal/app"
	"github.com/postpilot/api/internal/config"
	"github.com/postpilot/api/internal/db"
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

	cfg := config.Load()

	if err := log.InitLogger(); err != nil {
		panic("Failed to initialize structured logger: " + err.Error())
	}
	defer func() {
		_ = log.Logger.Sync()
	}()

	log.Logger.Info("Starting application",
		zap.String("env", cfg.Server.Env),
		zap.String("port", cfg.Server.Port),
	)

	application, err := di.InitializeApp()
	if err != nil {
		log.Logger.Fatal("Failed to initialize application dependencies", zap.Error(err))
	}

	ctx := context.Background()
	if err := db.EnsureIndexes(ctx); err != nil {
		log.Logger.Warn("Failed to ensure MongoDB indexes", zap.Error(err))
	}

	fiberApp := fiber.New(fiber.Config{
		AppName:      "Post Pilot API",
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		ErrorHandler: customErrorHandler,
	})

	fiberApp.Use(recover.New(recover.Config{
		EnableStackTrace: cfg.IsDevelopment(),
	}))
	fiberApp.Use(middleware.RequestID())
	fiberApp.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Request-ID",
		ExposeHeaders:    "X-Request-ID",
		AllowCredentials: false,
	}))
	fiberApp.Use(middleware.RateLimit())
	fiberApp.Use(log.StructuredLogger())

	fiberApp.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name":    "Post Pilot API",
			"version": "1.0",
			"status":  "running",
			"docs":    "/the-post-pilot/v1/swagger/",
		})
	})

	appPkg.RegisterRoutes(
		fiberApp,
		application.AuthHandler,
		application.ArticleHandler,
		application.PostHandler,
	)

	go func() {
		log.Logger.Info("Starting Fiber server", zap.String("port", cfg.Server.Port))
		if err := fiberApp.Listen(":" + cfg.Server.Port); err != nil {
			log.Logger.Error("Fiber server error", zap.Error(err))
		}
	}()

	gracefulShutdown(fiberApp, cfg)
}

func gracefulShutdown(app *fiber.App, cfg *config.Config) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Logger.Error("Error during server shutdown", zap.Error(err))
	}

	if err := db.Disconnect(ctx); err != nil {
		log.Logger.Error("Error disconnecting from MongoDB", zap.Error(err))
	}

	log.Logger.Info("Server shutdown complete")
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	log.Logger.Error("Request error",
		zap.Error(err),
		zap.String("path", c.Path()),
		zap.String("method", c.Method()),
	)

	return c.Status(code).JSON(fiber.Map{
		"error": fiber.Map{
			"code":    "INTERNAL_ERROR",
			"message": err.Error(),
		},
	})
}
