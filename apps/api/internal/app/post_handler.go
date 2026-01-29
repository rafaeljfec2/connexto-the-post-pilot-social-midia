package app

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
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
	user, err := GetUserFromContext(c, h.AuthService)
	if err != nil {
		return HandleUserContextError(c, err, "/posts/generate")
	}
	userId := user.ID.Hex()

	var req GeneratePostRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid generate post payload", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return BadRequestError(c, err.Error())
	}

	if err := ValidateStruct(&req); err != nil {
		log.Logger.Warn("Generate post validation failed", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return ValidationError(c, err.Error())
	}

	resp, err := h.PostService.GeneratePost(c.Context(), user, req.Topic)
	if err != nil {
		log.Logger.Error("Failed to generate post", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
		return InternalError(c, err.Error())
	}

	log.Logger.Info("Post generated", zap.String("userId", userId), zap.String("endpoint", "/posts/generate"))
	return c.Status(http.StatusOK).JSON(resp)
}

type generatePostResponse struct {
	GeneratedText string                 `json:"generatedText"`
	Model         string                 `json:"model"`
	Usage         map[string]interface{} `json:"usage,omitempty"`
	CreatedAt     string                 `json:"createdAt"`
	LogId         string                 `json:"logId"`
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
	user, err := GetUserFromContext(c, h.AuthService)
	if err != nil {
		return HandleUserContextError(c, err, "/linkedin/publish")
	}

	var req PublishLinkedInPostRequest
	if err := c.BodyParser(&req); err != nil {
		return BadRequestError(c, err.Error())
	}

	if err := ValidateStruct(&req); err != nil {
		return ValidationError(c, err.Error())
	}

	if user.LinkedinAccessToken == "" || user.LinkedinPersonUrn == "" {
		return BadRequestError(c, "LinkedIn not connected for this user")
	}

	linkedinPostId, err := h.PostService.PublishOnLinkedIn(c.Context(), user.LinkedinAccessToken, user.LinkedinPersonUrn, req.Text)
	if err != nil {
		return InternalError(c, "Failed to publish on LinkedIn: "+err.Error())
	}

	return c.JSON(fiber.Map{"status": "published", "linkedinPostId": linkedinPostId})
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
	userID, err := GetUserIDFromContext(c)
	if err != nil {
		return HandleUserContextError(c, err, "/posts")
	}

	userObjId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return BadRequestError(c, "Invalid user ID")
	}

	posts, err := h.PostService.ListPosts(c.Context(), userObjId, 50)
	if err != nil {
		return InternalError(c, err.Error())
	}

	return c.JSON(posts)
}
