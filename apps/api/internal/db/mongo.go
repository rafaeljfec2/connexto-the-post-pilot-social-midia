package db

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/postpilot/api/internal/config"
	"github.com/postpilot/api/internal/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

var (
	clientInstance    *mongo.Client
	databaseInstance  *mongo.Database
	clientInstanceErr error
	mongoOnce         sync.Once
)

// GetMongoClient returns a singleton MongoDB client
func GetMongoClient() (*mongo.Client, error) {
	mongoOnce.Do(func() {
		cfg := config.Get()

		ctx, cancel := context.WithTimeout(context.Background(), cfg.MongoDB.ConnectTimeout)
		defer cancel()

		clientOpts := options.Client().
			ApplyURI(cfg.MongoDB.URL).
			SetMaxPoolSize(cfg.MongoDB.MaxPoolSize).
			SetMinPoolSize(cfg.MongoDB.MinPoolSize).
			SetMaxConnIdleTime(cfg.MongoDB.MaxConnIdleTime)

		client, err := mongo.Connect(ctx, clientOpts)
		if err != nil {
			log.Logger.Error("Failed to connect to MongoDB", zap.Error(err))
			clientInstanceErr = err
			return
		}

		if err := client.Ping(ctx, nil); err != nil {
			log.Logger.Error("Failed to ping MongoDB", zap.Error(err))
			clientInstanceErr = err
			return
		}

		log.Logger.Info("Connected to MongoDB successfully",
			zap.String("database", cfg.MongoDB.Database),
		)
		clientInstance = client
		clientInstanceErr = nil
	})
	return clientInstance, clientInstanceErr
}

// GetDatabase returns the main application database
func GetDatabase() (*mongo.Database, error) {
	if databaseInstance != nil {
		return databaseInstance, nil
	}

	client, err := GetMongoClient()
	if err != nil {
		return nil, err
	}

	cfg := config.Get()
	if cfg.MongoDB.Database == "" {
		return nil, fmt.Errorf("MONGO_DB environment variable is required but not set")
	}

	databaseInstance = client.Database(cfg.MongoDB.Database)
	return databaseInstance, nil
}

// Disconnect closes the MongoDB connection
func Disconnect(ctx context.Context) error {
	if clientInstance != nil {
		log.Logger.Info("Disconnecting from MongoDB")
		return clientInstance.Disconnect(ctx)
	}
	return nil
}

// EnsureIndexes creates all required indexes for the application
func EnsureIndexes(ctx context.Context) error {
	db, err := GetDatabase()
	if err != nil {
		return fmt.Errorf("failed to get database: %w", err)
	}

	log.Logger.Info("Creating MongoDB indexes")

	if err := createUsersIndexes(ctx, db); err != nil {
		return err
	}

	if err := createPostGenerationLogsIndexes(ctx, db); err != nil {
		return err
	}

	if err := createSocialPostStoriesIndexes(ctx, db); err != nil {
		return err
	}

	log.Logger.Info("MongoDB indexes created successfully")
	return nil
}

func createUsersIndexes(ctx context.Context, db *mongo.Database) error {
	collection := db.Collection("users")

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("idx_users_email_unique"),
		},
		{
			Keys:    bson.D{{Key: "provider", Value: 1}, {Key: "providerId", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true).SetName("idx_users_provider_providerId_unique"),
		},
	}

	for _, index := range indexes {
		_, err := collection.Indexes().CreateOne(ctx, index)
		if err != nil {
			if isDuplicateKeyError(err) {
				indexName := ""
				if index.Options != nil && index.Options.Name != nil {
					indexName = *index.Options.Name
				}
				log.Logger.Warn("Index creation skipped due to duplicate data",
					zap.String("index", indexName),
					zap.String("collection", "users"),
				)
				continue
			}
			log.Logger.Error("Failed to create users index", zap.Error(err))
			return fmt.Errorf("failed to create users indexes: %w", err)
		}
	}

	log.Logger.Debug("Users indexes created")
	return nil
}

func createPostGenerationLogsIndexes(ctx context.Context, db *mongo.Database) error {
	collection := db.Collection("post_generation_logs")

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}},
			Options: options.Index().SetName("idx_post_generation_logs_userId_createdAt"),
		},
		{
			Keys:    bson.D{{Key: "status", Value: 1}},
			Options: options.Index().SetName("idx_post_generation_logs_status"),
		},
		{
			Keys:    bson.D{{Key: "createdAt", Value: -1}},
			Options: options.Index().SetName("idx_post_generation_logs_createdAt"),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		log.Logger.Error("Failed to create post_generation_logs indexes", zap.Error(err))
		return fmt.Errorf("failed to create post_generation_logs indexes: %w", err)
	}

	log.Logger.Debug("Post generation logs indexes created")
	return nil
}

func createSocialPostStoriesIndexes(ctx context.Context, db *mongo.Database) error {
	collection := db.Collection("social_post_stories")

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}},
			Options: options.Index().SetName("idx_social_post_stories_userId_createdAt"),
		},
		{
			Keys:    bson.D{{Key: "status", Value: 1}},
			Options: options.Index().SetName("idx_social_post_stories_status"),
		},
		{
			Keys:    bson.D{{Key: "network", Value: 1}},
			Options: options.Index().SetName("idx_social_post_stories_network"),
		},
		{
			Keys:    bson.D{{Key: "externalPostId", Value: 1}},
			Options: options.Index().SetSparse(true).SetName("idx_social_post_stories_externalPostId"),
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		log.Logger.Error("Failed to create social_post_stories indexes", zap.Error(err))
		return fmt.Errorf("failed to create social_post_stories indexes: %w", err)
	}

	log.Logger.Debug("Social post stories indexes created")
	return nil
}

// HealthCheck performs a health check on the MongoDB connection
func HealthCheck(ctx context.Context) error {
	client, err := GetMongoClient()
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return client.Ping(ctx, nil)
}

// isDuplicateKeyError checks if the error is a MongoDB duplicate key error
func isDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "DuplicateKey") ||
		strings.Contains(err.Error(), "E11000")
}
