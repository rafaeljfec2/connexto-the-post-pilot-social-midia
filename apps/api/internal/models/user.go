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
	LinkedinPersonUrn    string             `bson:"linkedinPersonUrn,omitempty" json:"linkedinPersonUrn,omitempty"`
	DataSources          []DataSource       `bson:"dataSources,omitempty" json:"dataSources,omitempty"`
	CreatedAt            time.Time          `bson:"createdAt" json:"createdAt" example:"2024-01-01T00:00:00Z"`
	UpdatedAt            time.Time          `bson:"updatedAt" json:"updatedAt" example:"2024-01-01T00:00:00Z"`
	LastLogin            *time.Time         `bson:"lastLogin,omitempty" json:"lastLogin,omitempty" example:"2024-01-01T00:00:00Z"`
}

// MarshalJSON implementa a interface json.Marshaler para User
// Oculta campos sensíveis como API keys e tokens
func (u *User) MarshalJSON() ([]byte, error) {
	return json.Marshal(&struct {
		ID                 string       `json:"id"`
		Email              string       `json:"email"`
		Name               string       `json:"name"`
		AvatarUrl          string       `json:"avatarUrl,omitempty"`
		Provider           AuthProvider `json:"provider"`
		ProviderId         string       `json:"providerId,omitempty"`
		OpenAiApiKeyMasked string       `json:"openAiApiKey,omitempty"`
		OpenAiModel        string       `json:"openAiModel,omitempty"`
		HasLinkedinToken   bool         `json:"hasLinkedinToken"`
		LinkedinPersonUrn  string       `json:"linkedinPersonUrn,omitempty"`
		DataSources        []DataSource `json:"dataSources,omitempty"`
		CreatedAt          string       `json:"createdAt"`
		UpdatedAt          string       `json:"updatedAt"`
		LastLogin          *string      `json:"lastLogin,omitempty"`
	}{
		ID:                 u.ID.Hex(),
		Email:              u.Email,
		Name:               u.Name,
		AvatarUrl:          u.AvatarUrl,
		Provider:           u.Provider,
		ProviderId:         u.ProviderId,
		OpenAiApiKeyMasked: maskApiKey(u.OpenAiApiKey),
		OpenAiModel:        u.OpenAiModel,
		HasLinkedinToken:   u.LinkedinAccessToken != "",
		LinkedinPersonUrn:  u.LinkedinPersonUrn,
		DataSources:        u.DataSources,
		CreatedAt:          u.CreatedAt.Format("2006-01-01T15:04:05Z07:00"),
		UpdatedAt:          u.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		LastLogin:          formatTimePtr(u.LastLogin),
	})
}

// maskApiKey retorna uma versão mascarada da API key para exibição segura
func maskApiKey(key string) string {
	if key == "" {
		return ""
	}
	if len(key) <= 8 {
		return "sk-****"
	}
	return key[:7] + "****" + key[len(key)-4:]
}

// formatTimePtr formata um ponteiro de time para string
func formatTimePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.Format("2006-01-02T15:04:05Z07:00")
	return &s
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
