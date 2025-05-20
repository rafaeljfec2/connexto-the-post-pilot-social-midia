package models

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuthProvider represents the authentication provider type
type AuthProvider string

const (
	AuthProviderLocal    AuthProvider = "local"
	AuthProviderGoogle   AuthProvider = "google"
	AuthProviderLinkedIn AuthProvider = "linkedin"
)

type DataSourceType string

const (
	DataSourceRSS        DataSourceType = "rss"
	DataSourceDevTo      DataSourceType = "devto"
	DataSourceHackerNews DataSourceType = "hackernews"
)

type DataSource struct {
	Type DataSourceType `bson:"type" json:"type"`
	Url  string         `bson:"url" json:"url"`
	Tags []string       `bson:"tags,omitempty" json:"tags,omitempty"`
}

// User represents a user in the system
type User struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Email                string             `bson:"email" json:"email" example:"john@example.com"`
	PasswordHash         string             `bson:"passwordHash,omitempty" json:"-"`
	Name                 string             `bson:"name" json:"name" example:"John Doe"`
	AvatarUrl            string             `bson:"avatarUrl,omitempty" json:"avatarUrl,omitempty" example:"https://example.com/avatar.jpg"`
	Provider             AuthProvider       `bson:"provider" json:"provider" example:"local"`
	ProviderId           string             `bson:"providerId,omitempty" json:"providerId,omitempty" example:"123456789"`
	OpenAiApiKey         string             `bson:"openAiApiKey,omitempty" json:"openAiApiKey,omitempty"`
	OpenAiModel          string             `bson:"openAiModel,omitempty" json:"openAiModel,omitempty"`
	LinkedinAccessToken  string             `bson:"linkedinAccessToken,omitempty" json:"linkedinAccessToken,omitempty"`
	LinkedinRefreshToken string             `bson:"linkedinRefreshToken,omitempty" json:"linkedinRefreshToken,omitempty"`
	DataSources          []DataSource       `bson:"dataSources,omitempty" json:"dataSources,omitempty"`
	CreatedAt            time.Time          `bson:"createdAt" json:"createdAt" example:"2024-01-01T00:00:00Z"`
	UpdatedAt            time.Time          `bson:"updatedAt" json:"updatedAt" example:"2024-01-01T00:00:00Z"`
	LastLogin            *time.Time         `bson:"lastLogin,omitempty" json:"lastLogin,omitempty" example:"2024-01-01T00:00:00Z"`
}

// MarshalJSON implementa a interface json.Marshaler para User
func (u *User) MarshalJSON() ([]byte, error) {
	type Alias User
	return json.Marshal(&struct {
		ID string `json:"id"`
		*Alias
	}{
		ID:    u.ID.Hex(),
		Alias: (*Alias)(u),
	})
}

// UnmarshalJSON implementa a interface json.Unmarshaler para User
func (u *User) UnmarshalJSON(data []byte) error {
	type Alias User
	aux := &struct {
		ID string `json:"id"`
		*Alias
	}{
		Alias: (*Alias)(u),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	if aux.ID != "" {
		id, err := primitive.ObjectIDFromHex(aux.ID)
		if err != nil {
			return err
		}
		u.ID = id
	}
	return nil
}
