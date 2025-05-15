// Package app implements the application handlers
package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/services"
)

// AuthHandler handles authentication related requests
type AuthHandler struct {
	AuthService services.AuthService
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

type registerRequest struct {
	Name     string `json:"name" example:"John Doe"`
	Email    string `json:"email" example:"john@example.com"`
	Password string `json:"password" example:"123456"`
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with name, email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body registerRequest true "User registration info"
// @Success 201 {object} models.User
// @Failure 400 {object} fiber.Map
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req registerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	user, err := h.AuthService.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(user)
}

type loginRequest struct {
	Email    string `json:"email" example:"john@example.com"`
	Password string `json:"password" example:"123456"`
}
type loginResponse struct {
	User  *models.User `json:"user"`
	Token string       `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// Login godoc
// @Summary Login with email and password
// @Description Authenticate user with email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body loginRequest true "Login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} fiber.Map
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	user, token, err := h.AuthService.Login(c.Context(), req.Email, req.Password)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(loginResponse{User: user, Token: token})
}

type socialLoginRequest struct {
	Provider   models.AuthProvider `json:"provider" example:"google" enums:"google,linkedin"`
	ProviderId string              `json:"providerId" example:"123456789"`
	Email      string              `json:"email" example:"john@example.com"`
	Name       string              `json:"name" example:"John Doe"`
	AvatarUrl  string              `json:"avatarUrl" example:"https://example.com/avatar.jpg"`
}

// SocialLogin godoc
// @Summary Login or register with social provider
// @Description Authenticate or register user with social provider (Google, LinkedIn)
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body socialLoginRequest true "Social login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} fiber.Map
// @Router /auth/social [post]
func (h *AuthHandler) SocialLogin(c *fiber.Ctx) error {
	var req socialLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	user, token, err := h.AuthService.LoginWithSocial(c.Context(), req.Provider, req.ProviderId, req.Email, req.Name, req.AvatarUrl)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(loginResponse{User: user, Token: token})
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}
type refreshResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// RefreshToken godoc
// @Summary Refresh JWT using refresh token
// @Description Get a new JWT token using a valid refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body refreshRequest true "Refresh token info"
// @Success 200 {object} refreshResponse
// @Failure 400 {object} fiber.Map
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req refreshRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	token, err := h.AuthService.RefreshJWT(req.RefreshToken)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(refreshResponse{Token: token})
}
