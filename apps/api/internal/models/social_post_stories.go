package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SocialPostStories struct {
	ID             primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID     `bson:"userId" json:"userId"`
	Network        string                 `bson:"network" json:"network"` // ex: linkedin, twitter
	PostContent    string                 `bson:"postContent" json:"postContent"`
	Payload        map[string]interface{} `bson:"payload" json:"payload"`
	Response       map[string]interface{} `bson:"response" json:"response"`
	Status         string                 `bson:"status" json:"status"` // success, error
	Error          string                 `bson:"error,omitempty" json:"error,omitempty"`
	ExternalPostID string                 `bson:"externalPostId,omitempty" json:"externalPostId,omitempty"`
	CreatedAt      time.Time              `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time              `bson:"updatedAt" json:"updatedAt"`
}
