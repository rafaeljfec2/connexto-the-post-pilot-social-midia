package di

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/wire"
	"go.mongodb.org/mongo-driver/mongo"

	appPkg "github.com/postpilot/api/internal/app"
	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/httpclient"
	"github.com/postpilot/api/internal/repositories"
	"github.com/postpilot/api/internal/services"
)

// DatabaseSet provides MongoDB database
var DatabaseSet = wire.NewSet(ProvideDatabase)

// HTTPClientSet provides HTTP client
var HTTPClientSet = wire.NewSet(ProvideHTTPClient)

// RepositorySet provides all repositories
var RepositorySet = wire.NewSet(
	repositories.NewUserRepositoryWithDB,
	repositories.NewPostGenerationLogRepositoryWithDB,
	repositories.NewSocialPostStoriesRepositoryWithDB,
)

// ServiceSet provides all services
var ServiceSet = wire.NewSet(
	ProvideAuthService,
	services.NewArticleService,
	ProvideOpenAIClient,
	ProvidePostService,
)

// HandlerSet provides all HTTP handlers
var HandlerSet = wire.NewSet(
	appPkg.NewAuthHandler,
	appPkg.NewArticleHandler,
	appPkg.NewPostHandler,
)

// AppSet combines all providers needed to build the application
var AppSet = wire.NewSet(
	DatabaseSet,
	HTTPClientSet,
	RepositorySet,
	ServiceSet,
	HandlerSet,
)

// ProvideDatabase creates the MongoDB database connection
func ProvideDatabase() (*mongo.Database, error) {
	return db.GetDatabase()
}

// ProvideHTTPClient creates a configured HTTP client
func ProvideHTTPClient() *httpclient.HTTPClient {
	return httpclient.New(httpclient.DefaultConfig())
}

// ProvideAuthService creates AuthService with dependencies
func ProvideAuthService(repo repositories.UserRepository) services.AuthService {
	return services.NewAuthService(repo)
}

// ProvideOpenAIClient creates OpenAI client
func ProvideOpenAIClient() *services.OpenAIClient {
	return services.NewOpenAIClient()
}

// ProvidePostService creates PostService with all dependencies
func ProvidePostService(
	openAIClient *services.OpenAIClient,
	logRepo repositories.PostGenerationLogRepository,
	storiesRepo repositories.SocialPostStoriesRepository,
) services.PostService {
	return services.NewPostServiceWithDeps(openAIClient, logRepo, storiesRepo)
}

// App holds all application dependencies
type App struct {
	FiberApp       *fiber.App
	AuthHandler    *appPkg.AuthHandler
	ArticleHandler *appPkg.ArticleHandler
	PostHandler    *appPkg.PostHandler
}

// ProvideApp creates the main application struct
func ProvideApp(
	authHandler *appPkg.AuthHandler,
	articleHandler *appPkg.ArticleHandler,
	postHandler *appPkg.PostHandler,
) *App {
	return &App{
		AuthHandler:    authHandler,
		ArticleHandler: articleHandler,
		PostHandler:    postHandler,
	}
}
