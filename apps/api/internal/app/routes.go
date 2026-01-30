package app

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	_ "github.com/postpilot/api/docs" // swagger docs (gerado pelo swag)
	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/middleware"
)

func RegisterRoutes(app *fiber.App, authHandler *AuthHandler, articleHandler *ArticleHandler, postHandler *PostHandler) {
	// Root health check (for load balancers, k8s probes, etc.)
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "post-pilot-api"})
	})

	// Swagger docs
	app.Get("/the-post-pilot/swagger/*", swagger.New())

	// Health check with DB status
	app.Get("/the-post-pilot/v1/health", func(c *fiber.Ctx) error {
		dbStatus := "ok"
		if err := db.HealthCheck(c.Context()); err != nil {
			dbStatus = "error"
		}
		return c.JSON(fiber.Map{
			"status":   "ok",
			"database": dbStatus,
		})
	})

	// Auth routes (públicas)
	auth := app.Group("/the-post-pilot/v1/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/social", authHandler.SocialLogin)
	auth.Post("/refresh", authHandler.RefreshToken)
	auth.Get("/linkedin/url", authHandler.LinkedInAuthURL)
	auth.Get("/linkedin/callback", authHandler.LinkedInCallback)
	auth.Get("/linkedin/publish-callback", authHandler.LinkedInPublishCallback)
	auth.Get("/google/url", authHandler.GoogleAuthURL)
	auth.Get("/google/callback", authHandler.GoogleCallback)

	// Rotas protegidas
	protected := app.Group("/the-post-pilot/v1", middleware.JWTAuth(os.Getenv("JWT_SECRET")))
	protected.Get("/me", authHandler.GetProfile)
	protected.Put("/me", authHandler.UpdateProfile)
	protected.Get("/articles/suggestions", articleHandler.GetSuggestions)
	protected.Get("/articles/suggestions/by/duckduckgo", articleHandler.DuckDuckGoSuggestionsHandler)
	protected.Post("/posts/generate", postHandler.Generate)
	protected.Get("/posts", postHandler.ListPosts)
	protected.Get("/auth/linkedin/publish-url", authHandler.LinkedInPublishURL)
	protected.Delete("/auth/linkedin/disconnect", authHandler.DisconnectLinkedIn)
	protected.Post("/linkedin/publish", postHandler.PublishLinkedInPost)
	protected.Delete("/linkedin/post/:postLogId", postHandler.DeleteLinkedInPost)
}
