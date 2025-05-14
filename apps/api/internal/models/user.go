package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthProvider string

const (
	AuthProviderLocal    AuthProvider = "local"
	AuthProviderGoogle   AuthProvider = "google"
	AuthProviderLinkedIn AuthProvider = "linkedin"
)

type SocialAccount struct {
	Provider   AuthProvider `bson:"provider" json:"provider"`
	ProviderId string       `bson:"providerId" json:"providerId"`
	Email      string       `bson:"email" json:"email"`
	Name       string       `bson:"name,omitempty" json:"name,omitempty"`
	AvatarUrl  string       `bson:"avatarUrl,omitempty" json:"avatarUrl,omitempty"`
}

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email          string             `bson:"email" json:"email"`
	PasswordHash   string             `bson:"passwordHash,omitempty" json:"-"`
	Name           string             `bson:"name" json:"name"`
	AvatarUrl      string             `bson:"avatarUrl,omitempty" json:"avatarUrl,omitempty"`
	SocialAccounts []SocialAccount    `bson:"socialAccounts,omitempty" json:"socialAccounts,omitempty"`
	EmailVerified  bool               `bson:"emailVerified" json:"emailVerified"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
	LastLogin      *time.Time         `bson:"lastLogin,omitempty" json:"lastLogin,omitempty"`
}
