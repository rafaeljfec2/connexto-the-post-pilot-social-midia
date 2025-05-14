package app

import (
	"net/http"

	"apps/api/internal/models"
	"apps/api/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

// Register godoc
// @Summary Register a new user
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body registerRequest true "User registration info"
// @Success 201 {object} models.User
// @Failure 400 {object} gin.H
// @Router /api/v1/auth/register [post]
type registerRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := h.AuthService.Register(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, user)
}

// Login godoc
// @Summary Login with email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body loginRequest true "Login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} gin.H
// @Router /api/v1/auth/login [post]
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
type loginResponse struct {
	User  *models.User `json:"user"`
	Token string       `json:"token"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, token, err := h.AuthService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, loginResponse{User: user, Token: token})
}

// SocialLogin godoc
// @Summary Login or register with social provider
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body socialLoginRequest true "Social login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} gin.H
// @Router /api/v1/auth/social [post]
type socialLoginRequest struct {
	Provider   models.AuthProvider `json:"provider" binding:"required"`
	ProviderId string              `json:"providerId" binding:"required"`
	Email      string              `json:"email" binding:"required,email"`
	Name       string              `json:"name"`
	AvatarUrl  string              `json:"avatarUrl"`
}

func (h *AuthHandler) SocialLogin(c *gin.Context) {
	var req socialLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, token, err := h.AuthService.LoginWithSocial(c.Request.Context(), req.Provider, req.ProviderId, req.Email, req.Name, req.AvatarUrl)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, loginResponse{User: user, Token: token})
}

// RefreshToken godoc
// @Summary Refresh JWT using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body refreshRequest true "Refresh token info"
// @Success 200 {object} refreshResponse
// @Failure 400 {object} gin.H
// @Router /api/v1/auth/refresh [post]
type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}
type refreshResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req refreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	token, err := h.AuthService.RefreshJWT(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, refreshResponse{Token: token})
}
