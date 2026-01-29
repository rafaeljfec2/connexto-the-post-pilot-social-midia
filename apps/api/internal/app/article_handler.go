package app

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gofiber/fiber/v2"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/services"
	"go.uber.org/zap"
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
	user, err := GetUserFromContext(c, h.AuthService)
	if err != nil {
		return HandleUserContextError(c, err, "/articles/suggestions")
	}
	userId := user.ID.Hex()

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
		log.Logger.Error("Failed to fetch article suggestions", zap.Error(err), zap.String("userId", userId), zap.String("endpoint", "/articles/suggestions"))
		return c.Status(http.StatusInternalServerError).JSON(map[string]interface{}{"error": err.Error()})
	}
	log.Logger.Info("Article suggestions fetched", zap.String("userId", userId), zap.String("endpoint", "/articles/suggestions"), zap.Int("count", len(articles)))
	return c.Status(http.StatusOK).JSON(articles)
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

type DuckArticle struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Source      string `json:"source"`
	PublishedAt string `json:"publishedAt"`
	Summary     string `json:"summary"`
}

type DuckArticlesResponse struct {
	Articles []DuckArticle `json:"articles"`
}

// DuckDuckGoSuggestionsHandler godoc
// @Summary Busca artigos no DuckDuckGo por palavra-chave (paralelo)
// @Description Busca artigos no DuckDuckGo para cada palavra-chave, em paralelo, com scraping e parsing dos resultados.
// @Tags Articles
// @Produce json
// @Param q query string true "Lista de palavras-chave separadas por vírgula" example(golang,ia,vscode)
// @Param limit query int false "Número de artigos por palavra-chave (default: 3)" example(3)
// @Success 200 {object} DuckArticlesResponse
// @Failure 400 {object} map[string]string
// @Router /articles/suggestions/by/duckduckgo [get]
// @Security BearerAuth
func (h *ArticleHandler) DuckDuckGoSuggestionsHandler(c *fiber.Ctx) error {
	q := c.Query("q")
	if q == "" {
		return BadRequestError(c, "Missing required parameter: q")
	}
	limit := 3
	if l := c.Query("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	keywords := strings.Split(q, ",")
	var wg sync.WaitGroup
	var mu sync.Mutex
	var articles []DuckArticle

	for _, keyword := range keywords {
		keyword = strings.TrimSpace(keyword)
		if keyword == "" {
			continue
		}
		wg.Add(1)
		go func(kw string) {
			defer wg.Done()
			results := fetchDuckDuckGoArticles(kw, limit)
			mu.Lock()
			articles = append(articles, results...)
			mu.Unlock()
		}(keyword)
	}

	wg.Wait()
	return c.JSON(DuckArticlesResponse{Articles: articles})
}

func fetchDuckDuckGoArticles(keyword string, limit int) []DuckArticle {
	searchURL := "https://html.duckduckgo.com/html/?q=" + url.QueryEscape(keyword) + "&iar=news&ia=news"
	req, _ := http.NewRequest("GET", searchURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil
	}

	var articles []DuckArticle
	doc.Find(".result").EachWithBreak(func(i int, s *goquery.Selection) bool {
		if i >= limit {
			return false
		}
		title := s.Find(".result__title").Text()
		href, _ := s.Find(".result__a").Attr("href")
		img, _ := s.Find("img").Attr("src")
		summary := s.Find(".result__snippet").Text()
		author := s.Find(".result__extras__url").Text()
		parsedURL, _ := url.Parse(href)
		source := ""
		if parsedURL != nil {
			source = parsedURL.Host
		}
		articles = append(articles, DuckArticle{
			Title:       title,
			URL:         href,
			Source:      source,
			PublishedAt: time.Now().UTC().Format(time.RFC3339),
			Summary:     fmt.Sprintf("<img src='%s'/><p>%s</p><i>%s</i>", img, summary, author),
		})
		return true
	})
	return articles
}
