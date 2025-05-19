package app

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/postpilot/api/internal/services"
)

type ArticleHandler struct {
	ArticleService services.ArticleService
	AuthService    services.AuthService
}

func NewArticleHandler(articleService services.ArticleService, authService services.AuthService) *ArticleHandler {
	return &ArticleHandler{ArticleService: articleService, AuthService: authService}
}

// GetSuggestions godoc
// @Summary Get article suggestions from user sources
// @Description Returns a list of technical articles from user-configured sources (RSS, dev.to, Hacker News)
// @Tags Articles
// @Produce json
// @Param q query string false "Search keyword" example(AI)
// @Param from query string false "Published after (YYYY-MM-DD)" example(2024-05-01)
// @Param to query string false "Published before (YYYY-MM-DD)" example(2024-06-01)
// @Param tags query string false "Comma-separated tags" example("go,ai,architecture")
// @Param limit query int false "Max articles (default 6, max 100)" example(10)
// @Success 200 {array} services.Article "OK" x-example([{"title":"Go 1.22 Released","url":"https://dev.to/golang/go-1-22-released-1234","source":"DEV Community","publishedAt":"2024-05-01T12:00:00Z","summary":"Resumo do artigo em português...","tags":["go","release"]}])
// @Failure 401 {object} map[string]interface{} "{ \"error\": \"Invalid user claims\" }"
// @Failure 500 {object} map[string]interface{} "{ \"error\": \"Internal server error\" }"
// @Security BearerAuth
// @Router /articles/suggestions [get]
func (h *ArticleHandler) GetSuggestions(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userId, ok := claims["sub"].(string)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(map[string]interface{}{"error": "Invalid user claims"})
	}

	user, err := h.AuthService.GetUserByID(c.Context(), userId)
	if err != nil || user == nil {
		return c.Status(http.StatusUnauthorized).JSON(map[string]interface{}{"error": "User not found"})
	}

	q := c.Query("q")
	fromStr := c.Query("from")
	toStr := c.Query("to")
	tagsStr := c.Query("tags")
	limitStr := c.Query("limit")

	var from, to *time.Time
	if fromStr != "" {
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			from = &t
		}
	}
	if toStr != "" {
		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			to = &t
		}
	}

	tags := []string{}
	if tagsStr != "" {
		tags = splitAndTrim(tagsStr, ",")
	}

	limit := 6
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	articles, err := h.ArticleService.FetchSuggestions(c.Context(), user, q, from, to, tags, limit)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(map[string]interface{}{"error": err.Error()})
	}
	return c.JSON(articles)
}

func splitAndTrim(s, sep string) []string {
	parts := []string{}
	for _, p := range strings.Split(s, sep) {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			parts = append(parts, trimmed)
		}
	}
	return parts
}
