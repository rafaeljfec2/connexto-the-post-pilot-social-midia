package app

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	validate.RegisterValidation("datasourcetype", validateDataSourceType)
}

func validateDataSourceType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	validTypes := []string{"rss", "devto", "hackernews"}
	for _, t := range validTypes {
		if value == t {
			return true
		}
	}
	return false
}

// ValidateStruct validates a struct and returns a formatted error message
func ValidateStruct(s interface{}) error {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		return err
	}

	var errMsgs []string
	for _, e := range validationErrors {
		errMsgs = append(errMsgs, formatValidationError(e))
	}

	return fmt.Errorf("validation failed: %s", strings.Join(errMsgs, "; "))
}

func formatValidationError(e validator.FieldError) string {
	field := strings.ToLower(e.Field())

	switch e.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, e.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters", field, e.Param())
	case "url":
		return fmt.Sprintf("%s must be a valid URL", field)
	case "datasourcetype":
		return fmt.Sprintf("%s must be one of: rss, devto, hackernews", field)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, e.Param())
	default:
		return fmt.Sprintf("%s failed on %s validation", field, e.Tag())
	}
}

// Request validation structs with tags

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=100"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type SocialLoginRequest struct {
	Provider   string `json:"provider" validate:"required,oneof=google linkedin"`
	ProviderId string `json:"providerId" validate:"required"`
	Email      string `json:"email" validate:"required,email"`
	Name       string `json:"name" validate:"required"`
	AvatarUrl  string `json:"avatarUrl" validate:"omitempty,url"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type DataSourceRequest struct {
	Type string   `json:"type" validate:"required,datasourcetype"`
	Url  string   `json:"url" validate:"required,url"`
	Tags []string `json:"tags" validate:"omitempty,dive,min=1,max=50"`
}

type UpdateProfileRequest struct {
	OpenAiApiKey string              `json:"openAiApiKey" validate:"omitempty"`
	OpenAiModel  string              `json:"openAiModel" validate:"omitempty,oneof=gpt-3.5-turbo gpt-4 gpt-4-turbo gpt-4o"`
	DataSources  []DataSourceRequest `json:"dataSources" validate:"omitempty,dive"`
}

type GeneratePostRequest struct {
	Topic string `json:"topic" validate:"required,min=3,max=2000"`
}

type PublishLinkedInPostRequest struct {
	Text string `json:"text" validate:"required,min=1,max=3000"`
}
