package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/repositories"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

type PostService interface {
	GeneratePost(ctx context.Context, user *models.User, topic string) (*GeneratePostResponse, error)
	PublishOnLinkedIn(ctx context.Context, userID primitive.ObjectID, postLogID primitive.ObjectID, accessToken, personUrn, text string) (string, error)
	DeleteLinkedInPost(ctx context.Context, userID primitive.ObjectID, postLogID primitive.ObjectID, accessToken, externalPostID string) error
	ListPosts(ctx context.Context, userId primitive.ObjectID, limit int) ([]models.PostGenerationLog, error)
}

type postService struct {
	openAIClient      *OpenAIClient
	logRepository     repositories.PostGenerationLogRepository
	storiesRepository repositories.SocialPostStoriesRepository
}

func NewPostServiceWithDeps(openAIClient *OpenAIClient, logRepo repositories.PostGenerationLogRepository, storiesRepo repositories.SocialPostStoriesRepository) PostService {
	return &postService{openAIClient: openAIClient, logRepository: logRepo, storiesRepository: storiesRepo}
}

func NewPostService() PostService {
	// Fallback para inicialização padrão (para testes ou uso simples)
	openAIClient := NewOpenAIClient()
	logRepo, _ := repositories.NewPostGenerationLogRepository()
	return &postService{openAIClient: openAIClient, logRepository: logRepo}
}

type GeneratePostResponse struct {
	GeneratedText string                 `json:"generatedText"`
	Model         string                 `json:"model"`
	Usage         map[string]interface{} `json:"usage,omitempty"`
	CreatedAt     string                 `json:"createdAt"`
	LogId         string                 `json:"logId"`
}

func (s *postService) GeneratePost(ctx context.Context, user *models.User, topic string) (*GeneratePostResponse, error) {
	createdAt := time.Now().UTC()
	userId := user.ID.Hex()

	log.Logger.Info("Starting post generation",
		zap.String("userId", userId),
		zap.String("topic", topic),
		zap.Time("startedAt", createdAt),
	)

	logEntry := &models.PostGenerationLog{
		UserID:    user.ID,
		Input:     topic,
		CreatedAt: createdAt,
		Status:    "started",
	}
	logId, _ := s.logRepository.Create(ctx, logEntry)

	log.Logger.Debug("Post generation log created",
		zap.String("userId", userId),
		zap.String("logId", logId.Hex()),
	)

	prompt := "Gere uma sugestão de post para redes sociais a partir do seguinte tema/artigo: " + topic
	apiKey := user.OpenAiApiKey
	model := user.OpenAiModel
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	log.Logger.Info("Calling OpenAI API",
		zap.String("userId", userId),
		zap.String("model", model),
		zap.Int("promptLength", len(prompt)),
	)

	startTime := time.Now()
	output, usedModel, usage, err := s.openAIClient.GenerateText(ctx, apiKey, model, prompt)
	duration := time.Since(startTime)

	update := bson.M{
		"$set": bson.M{
			"model":  usedModel,
			"usage":  usage,
			"output": output,
			"status": "success",
		},
	}

	if err != nil {
		update["$set"].(bson.M)["status"] = "error"
		update["$set"].(bson.M)["error"] = err.Error()

		log.Logger.Error("Post generation failed",
			zap.String("userId", userId),
			zap.String("logId", logId.Hex()),
			zap.String("model", usedModel),
			zap.Duration("duration", duration),
			zap.Error(err),
		)
	} else {
		promptTokens := 0
		completionTokens := 0
		totalTokens := 0
		if usage != nil {
			if v, ok := usage["prompt_tokens"].(float64); ok {
				promptTokens = int(v)
			}
			if v, ok := usage["completion_tokens"].(float64); ok {
				completionTokens = int(v)
			}
			if v, ok := usage["total_tokens"].(float64); ok {
				totalTokens = int(v)
			}
		}

		log.Logger.Info("Post generation completed successfully",
			zap.String("userId", userId),
			zap.String("logId", logId.Hex()),
			zap.String("model", usedModel),
			zap.Duration("duration", duration),
			zap.Int("outputLength", len(output)),
			zap.Int("promptTokens", promptTokens),
			zap.Int("completionTokens", completionTokens),
			zap.Int("totalTokens", totalTokens),
		)

		log.Logger.Debug("Generated post content preview",
			zap.String("userId", userId),
			zap.String("logId", logId.Hex()),
			zap.String("outputPreview", truncateString(output, 200)),
		)
	}

	_ = s.logRepository.UpdateByID(ctx, logId, update)

	return &GeneratePostResponse{
		GeneratedText: output,
		Model:         usedModel,
		Usage:         usage,
		CreatedAt:     createdAt.Format(time.RFC3339),
		LogId:         logId.Hex(),
	}, err
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func (s *postService) PublishOnLinkedIn(ctx context.Context, userID primitive.ObjectID, postLogID primitive.ObjectID, accessToken, personUrn, text string) (string, error) {
	log.Logger.Info("Starting LinkedIn publish",
		zap.String("userId", userID.Hex()),
		zap.String("postLogId", postLogID.Hex()),
		zap.String("personUrn", personUrn),
		zap.Int("textLength", len(text)),
	)

	payload := map[string]interface{}{
		"author":         personUrn,
		"lifecycleState": "PUBLISHED",
		"specificContent": map[string]interface{}{
			"com.linkedin.ugc.ShareContent": map[string]interface{}{
				"shareCommentary": map[string]interface{}{
					"text": text,
				},
				"shareMediaCategory": "NONE",
			},
		},
		"visibility": map[string]interface{}{
			"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
		},
	}
	createdAt := time.Now().UTC()
	logEntry := &models.SocialPostStories{
		UserID:              userID,
		PostGenerationLogID: postLogID,
		Network:             "linkedin",
		PostContent:         text,
		Payload:             payload,
		CreatedAt:           createdAt,
		UpdatedAt:           createdAt,
		Status:              "started",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Logger.Error("Failed to marshal LinkedIn payload",
			zap.Error(err),
		)
		logEntry.Status = "error"
		logEntry.Error = err.Error()
		logEntry.UpdatedAt = time.Now().UTC()
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.linkedin.com/v2/ugcPosts", bytes.NewBuffer(body))
	if err != nil {
		log.Logger.Error("Failed to create LinkedIn request",
			zap.Error(err),
		)
		logEntry.Status = "error"
		logEntry.Error = err.Error()
		logEntry.UpdatedAt = time.Now().UTC()
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Restli-Protocol-Version", "2.0.0")

	log.Logger.Debug("Sending request to LinkedIn API",
		zap.String("url", "https://api.linkedin.com/v2/ugcPosts"),
	)

	startTime := time.Now()
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	duration := time.Since(startTime)

	if err != nil {
		log.Logger.Error("LinkedIn API request failed",
			zap.Error(err),
			zap.Duration("duration", duration),
		)
		logEntry.Status = "error"
		logEntry.Error = err.Error()
		logEntry.UpdatedAt = time.Now().UTC()
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	var respMap map[string]interface{}
	_ = json.Unmarshal(respBody, &respMap)
	logEntry.Response = respMap
	logEntry.UpdatedAt = time.Now().UTC()

	log.Logger.Info("LinkedIn API response received",
		zap.Int("statusCode", resp.StatusCode),
		zap.Duration("duration", duration),
	)

	if resp.StatusCode == 401 || resp.StatusCode == 403 {
		log.Logger.Warn("LinkedIn token expired or invalid",
			zap.Int("statusCode", resp.StatusCode),
			zap.String("response", string(respBody)),
		)
		logEntry.Status = "error"
		logEntry.Error = "LinkedIn token expired or invalid. Please reconnect your LinkedIn account."
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", fmt.Errorf(logEntry.Error)
	}
	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		log.Logger.Error("LinkedIn API error",
			zap.Int("statusCode", resp.StatusCode),
			zap.String("response", string(respBody)),
		)
		logEntry.Status = "error"
		logEntry.Error = fmt.Sprintf("linkedin api error: %s", string(respBody))
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", fmt.Errorf(logEntry.Error)
	}
	var result struct {
		ID string `json:"id"`
	}
	_ = json.Unmarshal(respBody, &result)
	if result.ID != "" {
		log.Logger.Info("LinkedIn post published successfully",
			zap.String("linkedinPostId", result.ID),
			zap.Duration("totalDuration", duration),
		)
		logEntry.Status = "success"
		logEntry.ExternalPostID = result.ID
		_, _ = s.storiesRepository.Create(ctx, logEntry)

		// Update PostGenerationLog status to "published"
		if postLogID != primitive.NilObjectID {
			_ = s.logRepository.UpdateByID(ctx, postLogID, bson.M{
				"$set": bson.M{
					"status":      "published",
					"publishedAt": time.Now().UTC(),
				},
			})
		}
		return result.ID, nil
	}
	if postId := resp.Header.Get("x-restli-id"); postId != "" {
		log.Logger.Info("LinkedIn post published successfully (from header)",
			zap.String("linkedinPostId", postId),
			zap.Duration("totalDuration", duration),
		)
		logEntry.Status = "success"
		logEntry.ExternalPostID = postId
		_, _ = s.storiesRepository.Create(ctx, logEntry)

		// Update PostGenerationLog status to "published"
		if postLogID != primitive.NilObjectID {
			_ = s.logRepository.UpdateByID(ctx, postLogID, bson.M{
				"$set": bson.M{
					"status":      "published",
					"publishedAt": time.Now().UTC(),
				},
			})
		}
		return postId, nil
	}
	log.Logger.Error("LinkedIn publish failed - no post ID returned",
		zap.String("response", string(respBody)),
	)
	logEntry.Status = "error"
	logEntry.Error = "Unknown error: no post ID returned"
	_, _ = s.storiesRepository.Create(ctx, logEntry)
	return "", fmt.Errorf(logEntry.Error)
}

func (s *postService) ListPosts(ctx context.Context, userId primitive.ObjectID, limit int) ([]models.PostGenerationLog, error) {
	return s.logRepository.ListByUser(ctx, userId, limit)
}

func (s *postService) DeleteLinkedInPost(ctx context.Context, userID primitive.ObjectID, postLogID primitive.ObjectID, accessToken, externalPostID string) error {
	log.Logger.Info("Starting LinkedIn post deletion",
		zap.String("userId", userID.Hex()),
		zap.String("postLogId", postLogID.Hex()),
		zap.String("externalPostId", externalPostID),
	)

	resolvedPostID, err := s.resolveExternalPostID(ctx, postLogID, externalPostID)
	if err != nil {
		return err
	}

	if err := s.callLinkedInDeleteAPI(accessToken, resolvedPostID); err != nil {
		return err
	}

	log.Logger.Info("LinkedIn post deleted successfully", zap.String("externalPostId", resolvedPostID))

	s.markPostAsDeleted(ctx, postLogID)
	return nil
}

func (s *postService) resolveExternalPostID(ctx context.Context, postLogID primitive.ObjectID, externalPostID string) (string, error) {
	if externalPostID != "" {
		return externalPostID, nil
	}

	if s.storiesRepository == nil || postLogID == primitive.NilObjectID {
		return "", fmt.Errorf("no LinkedIn post ID found")
	}

	story, err := s.storiesRepository.GetByPostLogID(ctx, postLogID)
	if err != nil {
		log.Logger.Error("Failed to get social post story", zap.Error(err))
		return "", fmt.Errorf("failed to find post: %w", err)
	}

	if story == nil {
		log.Logger.Warn("No social post story found for post log ID", zap.String("postLogId", postLogID.Hex()))
		return "", fmt.Errorf("post not found or not published to LinkedIn")
	}

	return story.ExternalPostID, nil
}

func (s *postService) callLinkedInDeleteAPI(accessToken, externalPostID string) error {
	url := fmt.Sprintf("https://api.linkedin.com/v2/ugcPosts/%s", externalPostID)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		log.Logger.Error("Failed to create LinkedIn delete request", zap.Error(err))
		return err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("X-Restli-Protocol-Version", "2.0.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Logger.Error("LinkedIn delete request failed", zap.Error(err))
		return err
	}
	defer resp.Body.Close()

	return s.handleLinkedInDeleteResponse(resp)
}

func (s *postService) handleLinkedInDeleteResponse(resp *http.Response) error {
	if resp.StatusCode == 401 || resp.StatusCode == 403 {
		log.Logger.Warn("LinkedIn token expired or invalid for deletion", zap.Int("statusCode", resp.StatusCode))
		return fmt.Errorf("LinkedIn token expired or invalid. Please reconnect your LinkedIn account")
	}

	if resp.StatusCode != 204 && resp.StatusCode != 200 {
		respBody, _ := io.ReadAll(resp.Body)
		log.Logger.Error("LinkedIn delete API error", zap.Int("statusCode", resp.StatusCode), zap.String("response", string(respBody)))
		return fmt.Errorf("LinkedIn API error: %s", string(respBody))
	}

	return nil
}

func (s *postService) markPostAsDeleted(ctx context.Context, postLogID primitive.ObjectID) {
	if postLogID != primitive.NilObjectID {
		_ = s.logRepository.UpdateByID(ctx, postLogID, bson.M{
			"$set": bson.M{"status": "deleted"},
		})
	}

	if s.storiesRepository != nil {
		story, _ := s.storiesRepository.GetByPostLogID(ctx, postLogID)
		if story != nil {
			_ = s.storiesRepository.UpdateStatus(ctx, story.ID, "deleted")
		}
	}
}
