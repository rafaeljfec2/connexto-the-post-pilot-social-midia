package repositories

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

var ErrInvalidInsertedID = errors.New("failed to convert InsertedID to ObjectID")

type SocialPostStoriesRepository interface {
	Create(ctx context.Context, log *models.SocialPostStories) (primitive.ObjectID, error)
}

type socialPostStoriesRepository struct {
	collection *mongo.Collection
}

func NewSocialPostStoriesRepository() (SocialPostStoriesRepository, error) {
	database, err := db.GetDatabase()
	if err != nil {
		return nil, err
	}
	return &socialPostStoriesRepository{
		collection: database.Collection("social_post_stories"),
	}, nil
}

// NewSocialPostStoriesRepositoryWithDB creates repository with injected database (for Wire DI)
func NewSocialPostStoriesRepositoryWithDB(database *mongo.Database) SocialPostStoriesRepository {
	return &socialPostStoriesRepository{
		collection: database.Collection("social_post_stories"),
	}
}

func (r *socialPostStoriesRepository) Create(ctx context.Context, logEntry *models.SocialPostStories) (primitive.ObjectID, error) {
	res, err := r.collection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Logger.Error("Failed to create social post story", zap.Error(err))
		return primitive.NilObjectID, err
	}

	id, ok := res.InsertedID.(primitive.ObjectID)
	if !ok {
		log.Logger.Error("Failed to convert InsertedID to ObjectID")
		return primitive.NilObjectID, ErrInvalidInsertedID
	}

	log.Logger.Info("Social post story created", zap.String("id", id.Hex()))
	return id, nil
}
