package app

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/services"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

const endpointPostsGenerate = "/posts/generate"

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
		return HandleUserContextError(c, err, endpointPostsGenerate)
	}
	userId := user.ID.Hex()

	var req GeneratePostRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid generate post payload", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", endpointPostsGenerate))
		return BadRequestError(c, err.Error())
	}

	if err := ValidateStruct(&req); err != nil {
		log.Logger.Warn("Generate post validation failed", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", endpointPostsGenerate))
		return ValidationError(c, err.Error())
	}

	resp, err := h.PostService.GeneratePost(c.Context(), user, req.Topic)
	if err != nil {
		log.Logger.Error("Failed to generate post", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", endpointPostsGenerate))
		return InternalError(c, err.Error())
	}

	log.Logger.Info("Post generation request completed",
		zap.String("userId", userId),
		zap.String("endpoint", endpointPostsGenerate),
		zap.String("logId", resp.LogId),
		zap.String("model", resp.Model),
	)
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
	const endpoint = "/linkedin/publish"
	user, err := GetUserFromContext(c, h.AuthService)
	if err != nil {
		return HandleUserContextError(c, err, endpoint)
	}
	userId := user.ID.Hex()

	var req PublishLinkedInPostRequest
	if err := c.BodyParser(&req); err != nil {
		log.Logger.Warn("Invalid LinkedIn publish payload",
			zap.Error(err),
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, err.Error())
	}

	if err := ValidateStruct(&req); err != nil {
		log.Logger.Warn("LinkedIn publish validation failed",
			zap.Error(err),
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return ValidationError(c, err.Error())
	}

	if user.LinkedinAccessToken == "" || user.LinkedinPersonUrn == "" {
		log.Logger.Warn("LinkedIn not connected for user",
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, "LinkedIn not connected for this user")
	}

	var postLogID primitive.ObjectID
	if req.PostLogID != "" {
		postLogID, _ = primitive.ObjectIDFromHex(req.PostLogID)
	}

	log.Logger.Info("Starting LinkedIn publish request",
		zap.String("userId", userId),
		zap.String("endpoint", endpoint),
		zap.Int("textLength", len(req.Text)),
		zap.String("postLogId", req.PostLogID),
	)

	linkedinPostId, err := h.PostService.PublishOnLinkedIn(c.Context(), user.ID, postLogID, user.LinkedinAccessToken, user.LinkedinPersonUrn, req.Text)
	if err != nil {
		log.Logger.Error("Failed to publish on LinkedIn",
			zap.Error(err),
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return InternalError(c, "Failed to publish on LinkedIn: "+err.Error())
	}

	log.Logger.Info("LinkedIn publish completed successfully",
		zap.String("userId", userId),
		zap.String("endpoint", endpoint),
		zap.String("linkedinPostId", linkedinPostId),
	)

	return c.JSON(fiber.Map{"status": "published", "linkedinPostId": linkedinPostId})
}

// DeleteLinkedInPost godoc
// @Summary Delete a post from LinkedIn
// @Description Deletes a post from LinkedIn for the authenticated user
// @Tags LinkedIn
// @Produce json
// @Param postLogId path string true "Post generation log ID"
// @Success 200 {object} map[string]interface{} "Exemplo: {\"status\": \"deleted\"}"
// @Failure 400 {object} map[string]interface{} "Exemplo: {\"error\": \"Invalid post ID\"}"
// @Failure 401 {object} map[string]interface{} "Exemplo: {\"error\": \"Unauthorized\"}"
// @Failure 404 {object} map[string]interface{} "Exemplo: {\"error\": \"Post not found\"}"
// @Failure 500 {object} map[string]interface{} "Exemplo: {\"error\": \"Failed to delete post\"}"
// @Security BearerAuth
// @Router /linkedin/post/{postLogId} [delete]
func (h *PostHandler) DeleteLinkedInPost(c *fiber.Ctx) error {
	const endpoint = "/linkedin/post/:postLogId"
	user, err := GetUserFromContext(c, h.AuthService)
	if err != nil {
		return HandleUserContextError(c, err, endpoint)
	}
	userId := user.ID.Hex()

	postLogIdStr := c.Params("postLogId")
	if postLogIdStr == "" {
		log.Logger.Warn("Missing post log ID",
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, "Post log ID is required")
	}

	postLogID, err := primitive.ObjectIDFromHex(postLogIdStr)
	if err != nil {
		log.Logger.Warn("Invalid post log ID format",
			zap.String("userId", userId),
			zap.String("postLogId", postLogIdStr),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, "Invalid post log ID format")
	}

	if user.LinkedinAccessToken == "" {
		log.Logger.Warn("LinkedIn not connected for user",
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, "LinkedIn not connected for this user")
	}

	// Get the post to find external ID
	posts, err := h.PostService.ListPosts(c.Context(), user.ID, 100)
	if err != nil {
		log.Logger.Error("Failed to list posts",
			zap.Error(err),
			zap.String("userId", userId),
			zap.String("endpoint", endpoint),
		)
		return InternalError(c, "Failed to find post")
	}

	var externalPostID string
	for _, post := range posts {
		if post.ID == postLogID && post.Status == "published" {
			// We need to get the external ID from SocialPostStories
			// For now, we'll handle this in the service
			break
		}
	}

	log.Logger.Info("Starting LinkedIn delete request",
		zap.String("userId", userId),
		zap.String("postLogId", postLogIdStr),
		zap.String("endpoint", endpoint),
	)

	err = h.PostService.DeleteLinkedInPost(c.Context(), user.ID, postLogID, user.LinkedinAccessToken, externalPostID)
	if err != nil {
		log.Logger.Error("Failed to delete LinkedIn post",
			zap.Error(err),
			zap.String("userId", userId),
			zap.String("postLogId", postLogIdStr),
			zap.String("endpoint", endpoint),
		)
		return InternalError(c, "Failed to delete LinkedIn post: "+err.Error())
	}

	log.Logger.Info("LinkedIn post deleted successfully",
		zap.String("userId", userId),
		zap.String("postLogId", postLogIdStr),
		zap.String("endpoint", endpoint),
	)

	return c.JSON(fiber.Map{"status": "deleted"})
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
	const endpoint = "/posts"
	userID, err := GetUserIDFromContext(c)
	if err != nil {
		return HandleUserContextError(c, err, endpoint)
	}

	userObjId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Logger.Warn("Invalid user ID format",
			zap.String("userId", userID),
			zap.String("endpoint", endpoint),
		)
		return BadRequestError(c, "Invalid user ID")
	}

	posts, err := h.PostService.ListPosts(c.Context(), userObjId, 50)
	if err != nil {
		log.Logger.Error("Failed to list posts",
			zap.Error(err),
			zap.String("userId", userID),
			zap.String("endpoint", endpoint),
		)
		return InternalError(c, err.Error())
	}

	log.Logger.Info("Posts listed successfully",
		zap.String("userId", userID),
		zap.String("endpoint", endpoint),
		zap.Int("count", len(posts)),
	)

	return c.JSON(posts)
}
