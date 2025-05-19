package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PostGenerationLog struct {
	ID        primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID     `bson:"userId" json:"userId"`
	Input     string                 `bson:"input" json:"input"`
	Output    string                 `bson:"output" json:"output"`
	Model     string                 `bson:"model" json:"model"`
	Usage     map[string]interface{} `bson:"usage" json:"usage"`
	Status    string                 `bson:"status" json:"status"`
	Error     string                 `bson:"error,omitempty" json:"error,omitempty"`
	CreatedAt time.Time              `bson:"createdAt" json:"createdAt"`
}
