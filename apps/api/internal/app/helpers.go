package app

import (
	"errors"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/services"
	"go.uber.org/zap"
)

var (
	ErrInvalidClaims = errors.New("invalid or missing JWT claims")
	ErrMissingUserID = errors.New("missing user ID in JWT claims")
	ErrUserNotFound  = errors.New("user not found")
)

// GetUserIDFromContext safely extracts user ID from JWT claims in fiber context
func GetUserIDFromContext(c *fiber.Ctx) (string, error) {
	claimsRaw := c.Locals("user")
	if claimsRaw == nil {
		return "", ErrInvalidClaims
	}

	claims, ok := claimsRaw.(jwt.MapClaims)
	if !ok {
		return "", ErrInvalidClaims
	}

	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		return "", ErrMissingUserID
	}

	return userID, nil
}

// GetUserFromContext extracts user ID and fetches user from database
func GetUserFromContext(c *fiber.Ctx, authService services.AuthService) (*models.User, error) {
	userID, err := GetUserIDFromContext(c)
	if err != nil {
		return nil, err
	}

	user, err := authService.GetUserByID(c.Context(), userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}

// ErrorCode represents standardized error codes
type ErrorCode string

const (
	ErrCodeUnauthorized     ErrorCode = "UNAUTHORIZED"
	ErrCodeBadRequest       ErrorCode = "BAD_REQUEST"
	ErrCodeNotFound         ErrorCode = "NOT_FOUND"
	ErrCodeInternalError    ErrorCode = "INTERNAL_ERROR"
	ErrCodeValidationFailed ErrorCode = "VALIDATION_FAILED"
	ErrCodeForbidden        ErrorCode = "FORBIDDEN"
)

// ErrorResponse sends a standardized error response
func ErrorResponse(c *fiber.Ctx, status int, code ErrorCode, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"error": fiber.Map{
			"code":    string(code),
			"message": message,
		},
	})
}

// UnauthorizedError returns a standardized 401 error
func UnauthorizedError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusUnauthorized, ErrCodeUnauthorized, message)
}

// BadRequestError returns a standardized 400 error
func BadRequestError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusBadRequest, ErrCodeBadRequest, message)
}

// NotFoundError returns a standardized 404 error
func NotFoundError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusNotFound, ErrCodeNotFound, message)
}

// InternalError returns a standardized 500 error
func InternalError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusInternalServerError, ErrCodeInternalError, message)
}

// ValidationError returns a standardized 422 error for validation failures
func ValidationError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusUnprocessableEntity, ErrCodeValidationFailed, message)
}

// ForbiddenError returns a standardized 403 error
func ForbiddenError(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, http.StatusForbidden, ErrCodeForbidden, message)
}

// HandleUserContextError handles errors from GetUserIDFromContext with proper logging
func HandleUserContextError(c *fiber.Ctx, err error, endpoint string) error {
	log.Logger.Warn("Failed to get user from context",
		zap.Error(err),
		zap.String("endpoint", endpoint),
	)

	if errors.Is(err, ErrUserNotFound) {
		return NotFoundError(c, "User not found")
	}
	return UnauthorizedError(c, "Invalid user credentials")
}

// convertDataSources converts DataSourceRequest slice to models.DataSource slice
func convertDataSources(sources []DataSourceRequest) []models.DataSource {
	result := make([]models.DataSource, len(sources))
	for i, s := range sources {
		result[i] = models.DataSource{
			Type: models.DataSourceType(s.Type),
			Url:  s.Url,
			Tags: s.Tags,
		}
	}
	return result
}
