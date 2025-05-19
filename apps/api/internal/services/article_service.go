package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/mmcdole/gofeed"
	"github.com/postpilot/api/internal/log"
	"github.com/postpilot/api/internal/models"
	"go.uber.org/zap"
)

type Article struct {
	Title       string    `json:"title"`
	Url         string    `json:"url"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"publishedAt"`
	Summary     string    `json:"summary,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
}

type ArticleService interface {
	FetchSuggestions(ctx context.Context, user *models.User, q string, from, to *time.Time, tags []string, limit int) ([]Article, error)
}

type articleService struct{}

func NewArticleService() ArticleService {
	return &articleService{}
}

// FetchSuggestions busca e normaliza artigos das fontes do usuário
func (s *articleService) FetchSuggestions(ctx context.Context, user *models.User, q string, from, to *time.Time, tags []string, limit int) ([]Article, error) {
	allArticles := s.fetchFromAllSources(ctx, user, limit)
	return s.filterArticles(allArticles, q, from, to, tags, limit), nil
}

func (s *articleService) fetchFromAllSources(ctx context.Context, user *models.User, limit int) []Article {
	numSources := len(user.DataSources)
	if numSources == 0 {
		return nil
	}
	// Limite por fonte (pelo menos 1)
	perSource := (limit + numSources - 1) / numSources
	// Busca os artigos de cada fonte
	articlesBySource := make([][]Article, numSources)
	for i, ds := range user.DataSources {
		articlesBySource[i] = s.fetchFromSource(ctx, ds, perSource)
	}
	// Intercala os artigos (round-robin)
	var diversified []Article
	for i := 0; len(diversified) < limit; i++ {
		added := false
		for _, sourceArticles := range articlesBySource {
			if i < len(sourceArticles) {
				diversified = append(diversified, sourceArticles[i])
				if len(diversified) >= limit {
					break
				}
				added = true
			}
		}
		if !added {
			break // Nenhum artigo novo adicionado, pode sair
		}
	}
	return diversified
}

func (s *articleService) fetchFromSource(ctx context.Context, ds models.DataSource, limit int) []Article {
	switch ds.Type {
	case models.DataSourceRSS:
		articles, err := fetchArticlesFromRSS(ctx, ds.Url, limit)
		if err == nil {
			return articles
		}
	case models.DataSourceDevTo:
		articles, err := fetchArticlesFromDevTo(ctx, ds.Tags, limit)
		if err == nil {
			return articles
		}
	case models.DataSourceHackerNews:
		articles, err := fetchArticlesFromHackerNews(ctx, limit)
		if err == nil {
			return articles
		}
	}
	return nil
}

func (s *articleService) filterArticles(articles []Article, q string, from, to *time.Time, tags []string, limit int) []Article {
	filtered := make([]Article, 0, limit)
	for _, art := range articles {
		if !s.matchesFilters(art, q, from, to, tags) {
			continue
		}
		filtered = append(filtered, art)
		if len(filtered) >= limit {
			break
		}
	}
	return filtered
}

func (s *articleService) matchesFilters(art Article, q string, from, to *time.Time, tags []string) bool {
	if q != "" && !containsIgnoreCase(art.Title, q) && !containsIgnoreCase(art.Summary, q) {
		return false
	}
	if from != nil && art.PublishedAt.Before(*from) {
		return false
	}
	if to != nil && art.PublishedAt.After(*to) {
		return false
	}
	if len(tags) > 0 && !hasAnyTag(art.Tags, tags) {
		return false
	}
	return true
}

func fetchArticlesFromRSS(ctx context.Context, url string, limit int) ([]Article, error) {
	parser := gofeed.NewParser()
	feed, err := parser.ParseURLWithContext(url, ctx)
	if err != nil {
		log.Logger.Error("Failed to fetch RSS feed", zap.String("url", url), zap.Error(err))
		return nil, err
	}
	articles := make([]Article, 0, limit)
	for i, item := range feed.Items {
		if i >= limit {
			break
		}
		published := time.Now()
		if item.PublishedParsed != nil {
			published = *item.PublishedParsed
		}
		articles = append(articles, Article{
			Title:       item.Title,
			Url:         item.Link,
			Source:      feed.Title,
			PublishedAt: published,
			Summary:     item.Description,
		})
	}
	log.Logger.Info("Fetched articles from RSS", zap.String("url", url), zap.Int("count", len(articles)))
	return articles, nil
}

func containsIgnoreCase(s, substr string) bool {
	return s != "" && substr != "" && (containsFold(s, substr))
}

func containsFold(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || (len(s) > 0 && (containsFold(s[1:], substr) || containsFold(s, substr[1:]))))
}

func hasAnyTag(articleTags, filterTags []string) bool {
	if len(articleTags) == 0 || len(filterTags) == 0 {
		return false
	}
	for _, t := range articleTags {
		for _, f := range filterTags {
			if t == f {
				return true
			}
		}
	}
	return false
}

type devtoArticle struct {
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	PublishedAt time.Time `json:"published_at"`
	Description string    `json:"description"`
	Tags        []string  `json:"tag_list"`
}

func fetchArticlesFromDevTo(ctx context.Context, tags []string, limit int) ([]Article, error) {
	baseURL := "https://dev.to/api/articles?per_page=%d"
	if len(tags) > 0 {
		baseURL += "&tag=" + tags[0]
	}
	url := fmt.Sprintf(baseURL, limit)

	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Logger.Error("Failed to fetch dev.to articles", zap.String("url", url), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	var devtoResp []devtoArticle
	if err := json.NewDecoder(resp.Body).Decode(&devtoResp); err != nil {
		log.Logger.Error("Failed to decode dev.to response", zap.String("url", url), zap.Error(err))
		return nil, err
	}
	articles := make([]Article, 0, limit)
	for i, item := range devtoResp {
		if i >= limit {
			break
		}
		articles = append(articles, Article{
			Title:       item.Title,
			Url:         item.URL,
			Source:      "dev.to",
			PublishedAt: item.PublishedAt,
			Summary:     item.Description,
			Tags:        item.Tags,
		})
	}
	log.Logger.Info("Fetched articles from dev.to", zap.String("url", url), zap.Int("count", len(articles)))
	return articles, nil
}

type hackerNewsItem struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Url   string `json:"url"`
	Time  int64  `json:"time"`
}

func fetchArticlesFromHackerNews(ctx context.Context, limit int) ([]Article, error) {
	req, _ := http.NewRequestWithContext(ctx, "GET", "https://hacker-news.firebaseio.com/v0/topstories.json", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Logger.Error("Failed to fetch Hacker News top stories", zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()
	var ids []int
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		log.Logger.Error("Failed to decode Hacker News IDs", zap.Error(err))
		return nil, err
	}

	articles := make([]Article, 0, limit)
	for i, id := range ids {
		if i >= limit {
			break
		}
		itemUrl := fmt.Sprintf("https://hacker-news.firebaseio.com/v0/item/%d.json", id)
		itemReq, _ := http.NewRequestWithContext(ctx, "GET", itemUrl, nil)
		itemResp, err := http.DefaultClient.Do(itemReq)
		if err != nil {
			log.Logger.Warn("Failed to fetch Hacker News item", zap.String("itemUrl", itemUrl), zap.Error(err))
			continue
		}
		var item hackerNewsItem
		if err := json.NewDecoder(itemResp.Body).Decode(&item); err != nil {
			itemResp.Body.Close()
			log.Logger.Warn("Failed to decode Hacker News item", zap.String("itemUrl", itemUrl), zap.Error(err))
			continue
		}
		itemResp.Body.Close()
		if item.Url == "" {
			continue
		}
		articles = append(articles, Article{
			Title:       item.Title,
			Url:         item.Url,
			Source:      "Hacker News",
			PublishedAt: time.Unix(item.Time, 0),
		})
	}
	log.Logger.Info("Fetched articles from Hacker News", zap.Int("count", len(articles)))
	return articles, nil
}
