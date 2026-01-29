package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/repositories"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PostService interface {
	GeneratePost(ctx context.Context, user *models.User, topic string) (*GeneratePostResponse, error)
	PublishOnLinkedIn(ctx context.Context, accessToken, personUrn, text string) (string, error)
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
	logEntry := &models.PostGenerationLog{
		UserID:    user.ID,
		Input:     topic,
		CreatedAt: createdAt,
		Status:    "started",
	}
	// Salva log inicial (status started)
	logId, _ := s.logRepository.Create(ctx, logEntry)

	// Monta prompt
	prompt := "Gere uma sugestão de post para redes sociais a partir do seguinte tema/artigo: " + topic
	apiKey := user.OpenAiApiKey
	model := user.OpenAiModel
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	output, usedModel, usage, err := s.openAIClient.GenerateText(ctx, apiKey, model, prompt)

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
	}
	// Atualiza log com resultado final
	_ = s.logRepository.UpdateByID(ctx, logId, update)

	return &GeneratePostResponse{
		GeneratedText: output,
		Model:         usedModel,
		Usage:         usage,
		CreatedAt:     createdAt.Format(time.RFC3339),
		LogId:         logId.Hex(),
	}, err
}

func (s *postService) PublishOnLinkedIn(ctx context.Context, accessToken, personUrn, text string) (string, error) {
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
		UserID:      primitive.NilObjectID, // Preencher se possível
		Network:     "linkedin",
		PostContent: text,
		Payload:     payload,
		CreatedAt:   createdAt,
		UpdatedAt:   createdAt,
		Status:      "started",
	}
	// logId, _ := s.storiesRepository.Create(ctx, logEntry)

	body, err := json.Marshal(payload)
	if err != nil {
		logEntry.Status = "error"
		logEntry.Error = err.Error()
		logEntry.UpdatedAt = time.Now().UTC()
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.linkedin.com/v2/ugcPosts", bytes.NewBuffer(body))
	if err != nil {
		logEntry.Status = "error"
		logEntry.Error = err.Error()
		logEntry.UpdatedAt = time.Now().UTC()
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Restli-Protocol-Version", "2.0.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
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

	if resp.StatusCode == 401 || resp.StatusCode == 403 {
		logEntry.Status = "error"
		logEntry.Error = "LinkedIn token expired or invalid. Please reconnect your LinkedIn account."
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return "", fmt.Errorf(logEntry.Error)
	}
	if resp.StatusCode != 201 && resp.StatusCode != 200 {
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
		logEntry.Status = "success"
		logEntry.ExternalPostID = result.ID
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return result.ID, nil
	}
	if postId := resp.Header.Get("x-restli-id"); postId != "" {
		logEntry.Status = "success"
		logEntry.ExternalPostID = postId
		_, _ = s.storiesRepository.Create(ctx, logEntry)
		return postId, nil
	}
	logEntry.Status = "error"
	logEntry.Error = "Unknown error: no post ID returned"
	_, _ = s.storiesRepository.Create(ctx, logEntry)
	return "", fmt.Errorf(logEntry.Error)
}

func (s *postService) ListPosts(ctx context.Context, userId primitive.ObjectID, limit int) ([]models.PostGenerationLog, error) {
	return s.logRepository.ListByUser(ctx, userId, limit)
}
