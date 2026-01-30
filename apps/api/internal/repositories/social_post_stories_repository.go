package repositories

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

var ErrInvalidInsertedID = errors.New("failed to convert InsertedID to ObjectID")

type SocialPostStoriesRepository interface {
	Create(ctx context.Context, log *models.SocialPostStories) (primitive.ObjectID, error)
	ListByUser(ctx context.Context, userID primitive.ObjectID, limit int) ([]models.SocialPostStories, error)
	GetByExternalID(ctx context.Context, externalPostID string) (*models.SocialPostStories, error)
	GetByPostLogID(ctx context.Context, postLogID primitive.ObjectID) (*models.SocialPostStories, error)
	UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error
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

func (r *socialPostStoriesRepository) ListByUser(ctx context.Context, userID primitive.ObjectID, limit int) ([]models.SocialPostStories, error) {
	filter := bson.M{"userId": userID}
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		log.Logger.Error("Failed to list social post stories", zap.Error(err))
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []models.SocialPostStories
	if err := cursor.All(ctx, &results); err != nil {
		log.Logger.Error("Failed to decode social post stories", zap.Error(err))
		return nil, err
	}

	return results, nil
}

func (r *socialPostStoriesRepository) GetByExternalID(ctx context.Context, externalPostID string) (*models.SocialPostStories, error) {
	filter := bson.M{"externalPostId": externalPostID}

	var result models.SocialPostStories
	err := r.collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Logger.Error("Failed to get social post story by external ID", zap.Error(err))
		return nil, err
	}

	return &result, nil
}

func (r *socialPostStoriesRepository) GetByPostLogID(ctx context.Context, postLogID primitive.ObjectID) (*models.SocialPostStories, error) {
	filter := bson.M{"postGenerationLogId": postLogID}

	var result models.SocialPostStories
	err := r.collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Logger.Error("Failed to get social post story by post log ID", zap.Error(err))
		return nil, err
	}

	return &result, nil
}

func (r *socialPostStoriesRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"status":    status,
			"updatedAt": time.Now().UTC(),
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Logger.Error("Failed to update social post story status", zap.Error(err))
		return err
	}

	log.Logger.Info("Social post story status updated", zap.String("id", id.Hex()), zap.String("status", status))
	return nil
}
