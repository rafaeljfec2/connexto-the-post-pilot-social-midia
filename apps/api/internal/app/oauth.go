package app

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/postpilot/api/internal/models"
)

const errFailedToReadResponse = "failed to read response: %w"

// OAuthUserInfo represents user information returned from OAuth providers
type OAuthUserInfo struct {
	Sub     string
	Name    string
	Email   string
	Picture string
}

// OAuthProvider defines the interface for OAuth providers
type OAuthProvider interface {
	GetName() string
	GetAuthURL() (string, error)
	ExchangeCodeForToken(code string) (string, error)
	FetchUserInfo(token string) (*OAuthUserInfo, error)
	GetProviderType() models.AuthProvider
}

// LinkedInOAuthProvider implements OAuthProvider for LinkedIn
type LinkedInOAuthProvider struct {
	clientID     string
	clientSecret string
	redirectURI  string
}

// NewLinkedInOAuthProvider creates a new LinkedIn OAuth provider
func NewLinkedInOAuthProvider() *LinkedInOAuthProvider {
	return &LinkedInOAuthProvider{
		clientID:     os.Getenv("LINKEDIN_CLIENT_ID"),
		clientSecret: os.Getenv("LINKEDIN_CLIENT_SECRET"),
		redirectURI:  os.Getenv("LINKEDIN_REDIRECT_URI"),
	}
}

func (p *LinkedInOAuthProvider) GetName() string {
	return "linkedin"
}

func (p *LinkedInOAuthProvider) GetProviderType() models.AuthProvider {
	return models.AuthProviderLinkedIn
}

func (p *LinkedInOAuthProvider) GetAuthURL() (string, error) {
	if p.clientID == "" || p.redirectURI == "" {
		return "", fmt.Errorf("LinkedIn client ID or redirect URI not configured")
	}

	authURL := fmt.Sprintf(
		"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=%s&redirect_uri=%s&scope=openid%%20profile%%20email",
		url.QueryEscape(p.clientID),
		url.QueryEscape(p.redirectURI),
	)

	return authURL, nil
}

func (p *LinkedInOAuthProvider) ExchangeCodeForToken(code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", p.redirectURI)
	data.Set("client_id", p.clientID)
	data.Set("client_secret", p.clientSecret)

	resp, err := http.PostForm("https://www.linkedin.com/oauth/v2/accessToken", data)
	if err != nil {
		return "", fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf(errFailedToReadResponse, err)
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	return tokenResp.AccessToken, nil
}

func (p *LinkedInOAuthProvider) FetchUserInfo(token string) (*OAuthUserInfo, error) {
	req, err := http.NewRequest("GET", "https://api.linkedin.com/v2/userinfo", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf(errFailedToReadResponse, err)
	}

	var userInfo struct {
		Sub     string `json:"sub"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	return &OAuthUserInfo{
		Sub:     userInfo.Sub,
		Name:    userInfo.Name,
		Email:   userInfo.Email,
		Picture: userInfo.Picture,
	}, nil
}

// GoogleOAuthProvider implements OAuthProvider for Google
type GoogleOAuthProvider struct {
	clientID     string
	clientSecret string
	redirectURI  string
}

// NewGoogleOAuthProvider creates a new Google OAuth provider
func NewGoogleOAuthProvider() *GoogleOAuthProvider {
	return &GoogleOAuthProvider{
		clientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		clientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		redirectURI:  os.Getenv("GOOGLE_REDIRECT_URI"),
	}
}

func (p *GoogleOAuthProvider) GetName() string {
	return "google"
}

func (p *GoogleOAuthProvider) GetProviderType() models.AuthProvider {
	return models.AuthProviderGoogle
}

func (p *GoogleOAuthProvider) GetAuthURL() (string, error) {
	if p.clientID == "" || p.redirectURI == "" {
		return "", fmt.Errorf("Google client ID or redirect URI not configured")
	}

	authURL := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=%s&redirect_uri=%s&scope=openid%%20email%%20profile&access_type=offline",
		url.QueryEscape(p.clientID),
		url.QueryEscape(p.redirectURI),
	)

	return authURL, nil
}

func (p *GoogleOAuthProvider) ExchangeCodeForToken(code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", p.redirectURI)
	data.Set("client_id", p.clientID)
	data.Set("client_secret", p.clientSecret)

	resp, err := http.PostForm("https://oauth2.googleapis.com/token", data)
	if err != nil {
		return "", fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf(errFailedToReadResponse, err)
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	return tokenResp.AccessToken, nil
}

func (p *GoogleOAuthProvider) FetchUserInfo(token string) (*OAuthUserInfo, error) {
	req, err := http.NewRequest("GET", "https://openidconnect.googleapis.com/v1/userinfo", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf(errFailedToReadResponse, err)
	}

	var userInfo struct {
		Sub     string `json:"sub"`
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	return &OAuthUserInfo{
		Sub:     userInfo.Sub,
		Name:    userInfo.Name,
		Email:   userInfo.Email,
		Picture: userInfo.Picture,
	}, nil
}

// handleOAuthCallback is a generic handler for OAuth callbacks
func (h *AuthHandler) handleOAuthCallback(c *fiber.Ctx, provider OAuthProvider) error {
	code := c.Query("code")
	if code == "" {
		return BadRequestError(c, fmt.Sprintf("Missing code from %s", provider.GetName()))
	}

	token, err := provider.ExchangeCodeForToken(code)
	if err != nil {
		return InternalError(c, fmt.Sprintf("Failed to get access token from %s: %s", provider.GetName(), err.Error()))
	}

	userInfo, err := provider.FetchUserInfo(token)
	if err != nil {
		return InternalError(c, fmt.Sprintf("Failed to fetch %s userinfo: %s", provider.GetName(), err.Error()))
	}

	_, jwt, err := h.AuthService.LoginWithSocial(
		c.Context(),
		provider.GetProviderType(),
		userInfo.Sub,
		userInfo.Email,
		userInfo.Name,
		userInfo.Picture,
	)
	if err != nil {
		return InternalError(c, fmt.Sprintf("Failed to login or register user: %s", err.Error()))
	}

	frontendURL := os.Getenv("FRONT_END_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000/login"
	}

	redirectURL := fmt.Sprintf("%s?token=%s&provider=%s", frontendURL, jwt, provider.GetName())
	return c.Redirect(redirectURL, http.StatusTemporaryRedirect)
}
