package app

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/services"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

type PostHandler struct {
	PostService services.PostService
	AuthService services.AuthService
}

func NewPostHandler(postService services.PostService, authService services.AuthService) *PostHandler {
	return &PostHandler{PostService: postService, AuthService: authService}
}

// Generate godoc
// @Summary Generate post suggestion using OpenAI
// @Description Gera sugestão de post a partir de um tema/artigo usando OpenAI
// @Tags Posts
// @Accept json
// @Produce json
// @Param input body generatePostRequest true "Dados para geração do post"
// @Success 200 {object} generatePostResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /posts/generate [post]
func (h *PostHandler) Generate(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		log.Logger.Warn("Invalid user claims on post generate", zap.String("endpoint", "/posts/generate"))
		return c.Status(http.StatusUnauthorized).JSON(map[string]interface{}{"error": "Invalid user claims"})
	}

	var req generatePostRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid generate post payload", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		log.Logger.Warn("User not found on post generate", zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return c.Status(http.StatusUnauthorized).JSON(map[string]interface{}{"error": "User not found"})
	}

	resp, err := h.PostService.GeneratePost(c.Context(), user, req.Topic)
	if err != nil {
		log.Logger.Error("Failed to generate post", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return c.Status(http.StatusInternalServerError).JSON(map[string]interface{}{"error": err.Error()})
	}

	log.Logger.Info("Post generated", zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
	return c.Status(http.StatusOK).JSON(resp)
}

type generatePostRequest struct {
	Topic string `json:"topic"`
}

type generatePostResponse struct {
	GeneratedText string                 `json:"generatedText"`
	Model         string                 `json:"model"`
	Usage         map[string]interface{} `json:"usage,omitempty"`
	CreatedAt     string                 `json:"createdAt"`
	LogId         string                 `json:"logId"`
}

type publishLinkedInPostRequest struct {
	Text string `json:"text"`
}

// PublishLinkedInPost godoc
// @Summary Publish a post on LinkedIn
// @Description Publishes a post on LinkedIn for the authenticated user
// @Tags LinkedIn
// @Accept json
// @Produce json
// @Param input body publishLinkedInPostRequest true "Post content"
// @Success 200 {object} map[string]interface{} "Exemplo: {\"status\": \"published\", \"linkedinPostId\": \"urn:li:share:...\" }"
// @Failure 400 {object} map[string]interface{} "Exemplo: {\"error\": \"Missing text\" }"
// @Failure 401 {object} map[string]interface{} "Exemplo: {\"error\": \"Unauthorized\" }"
// @Failure 500 {object} map[string]interface{} "Exemplo: {\"error\": \"Failed to publish on LinkedIn\" }"
// @Security BearerAuth
// @Router /linkedin/publish [post]
func (h *PostHandler) PublishLinkedInPost(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		return c.Status(401).JSON(map[string]interface{}{"error": "Invalid user claims"})
	}
	var req publishLinkedInPostRequest
	if err := c.BodyParser(&req); err != nil || req.Text == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "Missing text"})
	}
	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		return c.Status(404).JSON(map[string]interface{}{"error": "User not found"})
	}
	if user.LinkedinAccessToken == "" || user.LinkedinPersonUrn == "" {
		return c.Status(400).JSON(map[string]interface{}{"error": "LinkedIn not connected for this user"})
	}
	// Chamar serviço de publicação (a ser implementado)
	linkedinPostId, err := h.PostService.PublishOnLinkedIn(c.Context(), user.LinkedinAccessToken, user.LinkedinPersonUrn, req.Text)
	if err != nil {
		return c.Status(500).JSON(map[string]interface{}{"error": "Failed to publish on LinkedIn", "details": err.Error()})
	}
	return c.JSON(map[string]interface{}{"status": "published", "linkedinPostId": linkedinPostId})
}

// @Summary List user posts
// @Description Retorna os posts gerados pelo usuário
// @Tags Posts
// @Accept json
// @Produce json
// @Success 200 {array} models.PostGenerationLog
// @Failure 401 {object} map[string]interface{}
// @Router /posts [get]
// @Security BearerAuth
func (h *PostHandler) ListPosts(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid user claims"})
	}
	userObjId, _ := primitive.ObjectIDFromHex(userId)
	posts, err := h.PostService.ListPosts(c.Context(), userObjId, 50)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(posts)
}
