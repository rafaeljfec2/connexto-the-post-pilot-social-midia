package repositories

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/postpilot/api/internal/db"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

type PostGenerationLogRepository interface {
	Create(ctx context.Context, log *models.PostGenerationLog) (primitive.ObjectID, error)
	UpdateByID(ctx context.Context, id primitive.ObjectID, update bson.M) error
	ListByUser(ctx context.Context, userId primitive.ObjectID, limit int) ([]models.PostGenerationLog, error)
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

func (r *postGenerationLogRepository) ListByUser(ctx context.Context, userId primitive.ObjectID, limit int) ([]models.PostGenerationLog, error) {
	filter := bson.M{"userId": userId}
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var results []models.PostGenerationLog
	for cursor.Next(ctx) {
		var log models.PostGenerationLog
		if err := cursor.Decode(&log); err == nil {
			results = append(results, log)
		}
	}
	return results, nil
}
