package repositories

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

type PostGenerationLogRepository interface {
	Create(ctx context.Context, log *models.PostGenerationLog) (primitive.ObjectID, error)
	UpdateByID(ctx context.Context, id primitive.ObjectID, update bson.M) error
}

type postGenerationLogRepository struct {
	collection *mongo.Collection
}

func NewPostGenerationLogRepository() (PostGenerationLogRepository, error) {
	database, err := db.GetDatabase()
	if err != nil {
		return nil, err
	}
	return &postGenerationLogRepository{
		collection: database.Collection("post_generation_logs"),
	}, nil
}

func (r *postGenerationLogRepository) Create(ctx context.Context, logEntry *models.PostGenerationLog) (primitive.ObjectID, error) {
	res, err := r.collection.InsertOne(ctx, logEntry)
	if err != nil {
		log.Logger.Error("Failed to create post generation log", zap.Error(err))
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	log.Logger.Info("Post generation log created", zap.String("logId", id.Hex()))
	return id, nil
}

func (r *postGenerationLogRepository) UpdateByID(ctx context.Context, id primitive.ObjectID, update bson.M) error {
	_, err := r.collection.UpdateByID(ctx, id, update)
	if err != nil {
		log.Logger.Error("Failed to update post generation log", zap.Error(err))
		return err
	}
	log.Logger.Info("Post generation log updated", zap.String("logId", id.Hex()))
	return nil
}
