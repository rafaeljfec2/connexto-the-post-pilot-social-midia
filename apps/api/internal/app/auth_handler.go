// Package app implements the application handlers
package app

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/services"
	"go.uber.org/zap"
)

const bearerPrefix = "Bearer "

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
// @Tags User
// @Accept json
// @Produce json
// @Param input body registerRequest true "User registration info"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]interface{}
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req registerRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid register payload", zap.Error(err), zap.String("endpoint", "/auth/register"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	user, err := h.AuthService.Register(c.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		log.Logger.Warn("Register failed", zap.Error(err), zap.String("email", req.Email), zap.String("endpoint", "/auth/register"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	log.Logger.Info("User registered", zap.String("userId", user.ID.Hex()), zap.String("email", user.Email), zap.String("endpoint", "/auth/register"))
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
// @Tags User
// @Accept json
// @Produce json
// @Param input body loginRequest true "Login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} map[string]interface{}
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid login payload", zap.Error(err), zap.String("endpoint", "/auth/login"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	user, token, err := h.AuthService.Login(c.Context(), req.Email, req.Password)
	if err != nil {
		log.Logger.Warn("Login failed", zap.Error(err), zap.String("email", req.Email), zap.String("endpoint", "/auth/login"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	log.Logger.Info("User login success", zap.String("userId", user.ID.Hex()), zap.String("email", user.Email), zap.String("endpoint", "/auth/login"))
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
// @Tags User
// @Accept json
// @Produce json
// @Param input body socialLoginRequest true "Social login info"
// @Success 200 {object} loginResponse
// @Failure 400 {object} map[string]interface{}
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
// @Tags User
// @Accept json
// @Produce json
// @Param input body refreshRequest true "Refresh token info"
// @Success 200 {object} refreshResponse
// @Failure 400 {object} map[string]interface{}
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

type updateProfileRequest struct {
	OpenAiApiKey string              `json:"openAiApiKey"`
	OpenAiModel  string              `json:"openAiModel"`
	DataSources  []models.DataSource `json:"dataSources"`
}

// UpdateProfile godoc
// @Summary Update user profile/configuration
// @Description Update OpenAI and data sources for the authenticated user
// @Tags User
// @Accept json
// @Produce json
// @Param input body app.updateProfileRequest true "Profile update info" example({"openAiApiKey":"sk-...","openAiModel":"gpt-4","dataSources":[{"type":"rss","url":"https://martinfowler.com/feed.atom","tags":["architecture","ai"]},{"type":"devto","url":"https://dev.to","tags":["backend","cloud"]}]})
// @Success 200 {object} models.User "Exemplo de resposta: {\"id\":\"123\",\"name\":\"João Silva\",\"email\":\"joao@exemplo.com\",\"avatarUrl\":\"https://exemplo.com/avatar.jpg\",\"provider\":\"google\",\"providerId\":\"abc123\",\"openAiApiKey\":\"sk-...\",\"openAiModel\":\"gpt-4\",\"dataSources\":[{\"type\":\"rss\",\"url\":\"https://martinfowler.com/feed.atom\",\"tags\":[\"architecture\",\"ai\"]}],\"createdAt\":\"2024-01-01T00:00:00Z\",\"updatedAt\":\"2024-01-01T00:00:00Z\"}"
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /me [put]
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		log.Logger.Warn("Invalid user claims on update profile", zap.String("endpoint", "/me"))
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid user claims"})
	}

	var req updateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid update profile payload", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/me"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		log.Logger.Warn("User not found on update profile", zap.String("userId", userId), zap.String("endpoint", "/me"))
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	user.OpenAiApiKey = req.OpenAiApiKey
	user.OpenAiModel = req.OpenAiModel
	user.DataSources = req.DataSources

	err = h.AuthService.UpdateUser(c.Context(), user)
	if err != nil {
		log.Logger.Error("Failed to update user profile", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/me"))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	log.Logger.Info("User profile updated", zap.String("userId", userId), zap.String("endpoint", "/me"))
	return c.Status(fiber.StatusOK).JSON(user)
}

// GetProfile godoc
// @Summary Get authenticated user profile
// @Description Returns the full user object for the authenticated user
// @Tags User
// @Produce json
// @Success 200 {object} models.User "Exemplo de resposta: {\"id\":\"123\",\"name\":\"João Silva\",\"email\":\"joao@exemplo.com\",\"avatarUrl\":\"https://exemplo.com/avatar.jpg\",\"provider\":\"google\",\"providerId\":\"abc123\",\"openAiApiKey\":\"sk-...\",\"openAiModel\":\"gpt-4\",\"dataSources\":[{\"type\":\"rss\",\"url\":\"https://martinfowler.com/feed.atom\",\"tags\":[\"architecture\",\"ai\"]}],\"createdAt\":\"2024-01-01T00:00:00Z\",\"updatedAt\":\"2024-01-01T00:00:00Z\"}"
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /me [get]
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user claims"})
	}
	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}

// LinkedInAuthURL godoc
// @Summary Get LinkedIn consent URL
// @Description Returns the LinkedIn OpenID Connect consent URL for social login
// @Tags LinkedIn
// @Produce json
// @Success 200 {object} map[string]string "Exemplo: {\"url\": \"https://www.linkedin.com/oauth/v2/authorization?...\" }"
// @Failure 500 {object} map[string]interface{} "Exemplo: {\"error\": \"LinkedIn client ID or redirect URI not configured\" }"
// @Router /auth/linkedin/url [get]
func (h *AuthHandler) LinkedInAuthURL(c *fiber.Ctx) error {
	clientID := os.Getenv("LINKEDIN_CLIENT_ID")
	redirectURI := os.Getenv("LINKEDIN_REDIRECT_URI")
	if clientID == "" || redirectURI == "" {
		return c.Status(500).JSON(map[string]interface{}{"error": "LinkedIn client ID or redirect URI not configured"})
	}

	authURL := fmt.Sprintf(
		"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=%s&redirect_uri=%s&scope=openid%%20profile%%20email",
		url.QueryEscape(clientID),
		url.QueryEscape(redirectURI),
	)

	return c.JSON(map[string]string{"url": authURL})
}

type linkedinTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

type linkedinEmailResponse struct {
	Elements []struct {
		Handle     string `json:"handle~"`
		HandleData struct {
			EmailAddress string `json:"emailAddress"`
		}
	} `json:"elements"`
}

// LinkedInCallback godoc
// @Summary LinkedIn OpenID Connect callback
// @Description Handles LinkedIn OpenID Connect callback, authenticates or creates user, returns JWT and user object
// @Tags LinkedIn
// @Produce json
// @Param code query string true "Authorization code from LinkedIn"
// @Success 200 {object} map[string]interface{} "{ \"user\": { ... }, \"token\": \"...\" }"
// @Failure 400 {object} map[string]interface{} "{ \"error\": \"Missing code from LinkedIn\" }"
// @Failure 500 {object} map[string]interface{} "{ \"error\": \"Failed to get access token from LinkedIn\" }"
// @Router /auth/linkedin/callback [get]
func (h *AuthHandler) LinkedInCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "Missing code from LinkedIn"})
	}

	clientID := os.Getenv("LINKEDIN_CLIENT_ID")
	clientSecret := os.Getenv("LINKEDIN_CLIENT_SECRET")
	redirectURI := os.Getenv("LINKEDIN_REDIRECT_URI")

	// Troca o code por access_token
	token, err := exchangeLinkedInCodeForToken(code, clientID, clientSecret, redirectURI)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to get access token from LinkedIn", "details": err.Error()})
	}

	// Busca dados do usuário via OpenID Connect
	userInfo, err := fetchLinkedInUserInfo(token)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to fetch LinkedIn userinfo", "details": err.Error()})
	}

	// Autentica/cria usuário
	user, jwt, err := h.AuthService.LoginWithSocial(
		c.Context(),
		models.AuthProviderLinkedIn,
		userInfo.Sub,
		userInfo.Email,
		userInfo.Name,
		userInfo.Picture,
	)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to login or register user", "details": err.Error()})
	}

	return c.JSON(map[string]interface{}{"user": user, "token": jwt})
}

type linkedinUserInfo struct {
	Sub     string `json:"sub"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

func fetchLinkedInUserInfo(token string) (*linkedinUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://api.linkedin.com/v2/userinfo", nil)
	req.Header.Set("Authorization", bearerPrefix+token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var userInfo linkedinUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}
	return &userInfo, nil
}

func exchangeLinkedInCodeForToken(code, clientID, clientSecret, redirectURI string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)

	resp, err := http.PostForm("https://www.linkedin.com/oauth/v2/accessToken", data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var tokenResp linkedinTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", err
	}
	return tokenResp.AccessToken, nil
}

// GoogleAuthURL godoc
// @Summary Get Google consent URL
// @Description Returns the Google OpenID Connect consent URL for social login
// @Tags Google
// @Produce json
// @Success 200 {object} map[string]string "{ \"url\": \"https://accounts.google.com/o/oauth2/v2/auth?...\" }"
// @Failure 500 {object} map[string]interface{} "{ \"error\": \"Google client ID or redirect URI not configured\" }"
// @Router /auth/google/url [get]
func (h *AuthHandler) GoogleAuthURL(c *fiber.Ctx) error {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	redirectURI := os.Getenv("GOOGLE_REDIRECT_URI")
	if clientID == "" || redirectURI == "" {
		return c.Status(500).JSON(map[string]interface{}{"error": "Google client ID or redirect URI not configured"})
	}

	authURL := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=%s&redirect_uri=%s&scope=openid%%20email%%20profile&access_type=offline",
		url.QueryEscape(clientID),
		url.QueryEscape(redirectURI),
	)

	return c.JSON(map[string]string{"url": authURL})
}

// GoogleCallback godoc
// @Summary Google OpenID Connect callback
// @Description Handles Google OpenID Connect callback, authenticates or creates user, returns JWT and user object
// @Tags Google
// @Produce json
// @Param code query string true "Authorization code from Google"
// @Success 200 {object} map[string]interface{} "{ \"user\": { ... }, \"token\": \"...\" }"
// @Failure 400 {object} map[string]interface{} "{ \"error\": \"Missing code from Google\" }"
// @Failure 500 {object} map[string]interface{} "{ \"error\": \"Failed to get access token from Google\" }"
// @Router /auth/google/callback [get]
func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "Missing code from Google"})
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURI := os.Getenv("GOOGLE_REDIRECT_URI")

	// Troca o code por access_token
	token, err := exchangeGoogleCodeForToken(code, clientID, clientSecret, redirectURI)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to get access token from Google", "details": err.Error()})
	}

	// Busca dados do usuário via OpenID Connect
	userInfo, err := fetchGoogleUserInfo(token)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to fetch Google userinfo", "details": err.Error()})
	}

	// Autentica/cria usuário
	user, jwt, err := h.AuthService.LoginWithSocial(
		c.Context(),
		models.AuthProviderGoogle,
		userInfo.Sub,
		userInfo.Email,
		userInfo.Name,
		userInfo.Picture,
	)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to login or register user", "details": err.Error()})
	}

	return c.JSON(map[string]interface{}{"user": user, "token": jwt})
}

type googleUserInfo struct {
	Sub     string `json:"sub"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

func exchangeGoogleCodeForToken(code, clientID, clientSecret, redirectURI string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)

	resp, err := http.PostForm("https://oauth2.googleapis.com/token", data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", err
	}
	return tokenResp.AccessToken, nil
}

func fetchGoogleUserInfo(token string) (*googleUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://openidconnect.googleapis.com/v1/userinfo", nil)
	req.Header.Set("Authorization", bearerPrefix+token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var userInfo googleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}
	return &userInfo, nil
}

// Gera URL de consentimento para publicação no LinkedIn
// @Summary Get LinkedIn publish consent URL
// @Description Returns the LinkedIn OAuth URL for publishing posts (w_member_social)
// @Tags LinkedIn
// @Produce json
// @Success 200 {object} map[string]string "Exemplo: {\"url\": \"https://www.linkedin.com/oauth/v2/authorization?...\" }"
// @Failure 500 {object} map[string]interface{} "Exemplo: {\"error\": \"LinkedIn client ID or redirect URI not configured\" }"
// @Security BearerAuth
// @Router /auth/linkedin/publish-url [get]
func (h *AuthHandler) LinkedInPublishURL(c *fiber.Ctx) error {
	clientID := os.Getenv("LINKEDIN_CLIENT_ID")
	redirectURI := os.Getenv("LINKEDIN_PUBLISH_REDIRECT_URI")
	if clientID == "" || redirectURI == "" {
		return c.Status(500).JSON(map[string]interface{}{"error": "LinkedIn client ID or redirect URI not configured"})
	}
	scopes := "openid profile email w_member_social"

	authURL := fmt.Sprintf(
		"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&state=%s",
		url.QueryEscape(clientID),
		url.QueryEscape(redirectURI),
		scopes,
		"publish", // pode ser randomizado para produção
	)
	return c.JSON(map[string]string{"url": authURL})
}

// Callback para salvar o access token de publicação
// @Summary LinkedIn publish OAuth callback
// @Description Handles LinkedIn OAuth callback for publishing, saves access token to user
// @Tags LinkedIn
// @Produce json
// @Param code query string true "Authorization code from LinkedIn"
// @Success 200 {object} map[string]string "Exemplo: {\"access_token\": \"...\" }"
// @Failure 400 {object} map[string]interface{} "Exemplo: {\"error\": \"Missing code from LinkedIn\" }"
// @Failure 500 {object} map[string]interface{} "Exemplo: {\"error\": \"Failed to get access token from LinkedIn\" }"
// @Security BearerAuth
// @Router /auth/linkedin/publish-callback [get]
func (h *AuthHandler) LinkedInPublishCallback(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		return c.Status(401).JSON(map[string]interface{}{"error": "Invalid user claims"})
	}

	code := c.Query("code")
	if code == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "Missing code from LinkedIn"})
	}

	clientID := os.Getenv("LINKEDIN_CLIENT_ID")
	clientSecret := os.Getenv("LINKEDIN_CLIENT_SECRET")
	redirectURI := os.Getenv("LINKEDIN_PUBLISH_REDIRECT_URI")

	token, err := exchangeLinkedInCodeForToken(code, clientID, clientSecret, redirectURI)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to get access token from LinkedIn", "details": err.Error()})
	}
	if token == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "Invalid access token from LinkedIn. Token is empty."})
	}

	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		return c.Status(404).JSON(map[string]interface{}{"error": "User not found"})
	}

	// Buscar URN do usuário no LinkedIn
	personUrn, err := fetchLinkedInPersonURN(token)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to fetch LinkedIn person URN", "details": err.Error()})
	}
	user.LinkedinAccessToken = token
	user.LinkedinPersonUrn = personUrn
	err = h.AuthService.UpdateUser(c.Context(), user)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to save LinkedIn token", "details": err.Error()})
	}

	return c.JSON(map[string]string{"status": "ok"})
}

func fetchLinkedInPersonURN(accessToken string) (string, error) {
	req, _ := http.NewRequest("GET", "https://api.linkedin.com/v2/userinfo", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("LinkedIn /v2/userinfo response:", string(body)) // Log para depuração
	var data struct {
		Sub string `json:"sub"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return "", err
	}

	if data.Sub == "" {
		return "", errors.New("invalid LinkedIn userinfo response. Sub is empty.")
	}

	return "urn:li:person:" + data.Sub, nil
}
