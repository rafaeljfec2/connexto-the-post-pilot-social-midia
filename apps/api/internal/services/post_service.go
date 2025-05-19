package services

import (
	"context"
	"time"

	"github.com/postpilot/api/internal/models"
	"github.com/postpilot/api/internal/repositories"
)

type PostService interface {
	GeneratePost(ctx context.Context, user *models.User, topic string) (*GeneratePostResponse, error)
}

type postService struct {
	openAIClient  *OpenAIClient
	logRepository repositories.PostGenerationLogRepository
}

func NewPostServiceWithDeps(openAIClient *OpenAIClient, logRepo repositories.PostGenerationLogRepository) PostService {
	return &postService{openAIClient: openAIClient, logRepository: logRepo}
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
	logEntry.Model = usedModel
	logEntry.Usage = usage
	logEntry.Output = output
	logEntry.Status = "success"
	if err != nil {
		logEntry.Status = "error"
		logEntry.Error = err.Error()
	}
	// Atualiza log com resultado final
	_, _ = s.logRepository.Create(ctx, logEntry)

	return &GeneratePostResponse{
		GeneratedText: output,
		Model:         usedModel,
		Usage:         usage,
		CreatedAt:     createdAt.Format(time.RFC3339),
		LogId:         logId.Hex(),
	}, err
}
