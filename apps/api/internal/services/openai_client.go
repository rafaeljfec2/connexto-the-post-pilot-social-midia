package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type OpenAIClient struct{}

func NewOpenAIClient() *OpenAIClient {
	return &OpenAIClient{}
}

type OpenAIChatRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Temperature float32         `json:"temperature,omitempty"`
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIChatResponse struct {
	Choices []struct {
		Message OpenAIMessage `json:"message"`
	} `json:"choices"`
	Usage map[string]interface{} `json:"usage"`
	Model string                 `json:"model"`
}

func (c *OpenAIClient) GenerateText(ctx context.Context, apiKey, model, prompt string) (string, string, map[string]interface{}, error) {
	url := "https://api.openai.com/v1/chat/completions"
	requestBody := OpenAIChatRequest{
		Model:       model,
		Messages:    []OpenAIMessage{{Role: "user", Content: prompt}},
		MaxTokens:   256,
		Temperature: 0.7,
	}
	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return "", "", nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", "", nil, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", "", nil, fmt.Errorf("OpenAI error: %s", string(b))
	}

	var openaiResp OpenAIChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&openaiResp); err != nil {
		return "", "", nil, err
	}
	if len(openaiResp.Choices) == 0 {
		return "", openaiResp.Model, openaiResp.Usage, fmt.Errorf("no choices returned from OpenAI")
	}
	return openaiResp.Choices[0].Message.Content, openaiResp.Model, openaiResp.Usage, nil
}
