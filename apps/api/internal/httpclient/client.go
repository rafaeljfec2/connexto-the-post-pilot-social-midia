package httpclient

import (
	"net/http"
	"time"
)

// Config holds HTTP client configuration
type Config struct {
	Timeout             time.Duration
	MaxIdleConns        int
	MaxIdleConnsPerHost int
	MaxConnsPerHost     int
	IdleConnTimeout     time.Duration
}

// DefaultConfig returns a default HTTP client configuration
func DefaultConfig() *Config {
	return &Config{
		Timeout:             30 * time.Second,
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		MaxConnsPerHost:     100,
		IdleConnTimeout:     90 * time.Second,
	}
}

// HTTPClient wraps http.Client with additional functionality
type HTTPClient struct {
	client *http.Client
	config *Config
}

// New creates a new HTTPClient with the given configuration
func New(config *Config) *HTTPClient {
	if config == nil {
		config = DefaultConfig()
	}

	transport := &http.Transport{
		MaxIdleConns:        config.MaxIdleConns,
		MaxIdleConnsPerHost: config.MaxIdleConnsPerHost,
		MaxConnsPerHost:     config.MaxConnsPerHost,
		IdleConnTimeout:     config.IdleConnTimeout,
	}

	client := &http.Client{
		Timeout:   config.Timeout,
		Transport: transport,
	}

	return &HTTPClient{
		client: client,
		config: config,
	}
}

// NewWithTimeout creates a new HTTPClient with a specific timeout
func NewWithTimeout(timeout time.Duration) *HTTPClient {
	config := DefaultConfig()
	config.Timeout = timeout
	return New(config)
}

// Do performs an HTTP request
func (c *HTTPClient) Do(req *http.Request) (*http.Response, error) {
	return c.client.Do(req)
}

// Get performs an HTTP GET request
func (c *HTTPClient) Get(url string) (*http.Response, error) {
	return c.client.Get(url)
}

// Post performs an HTTP POST request
func (c *HTTPClient) Post(url, contentType string, body []byte) (*http.Response, error) {
	return c.client.Post(url, contentType, nil)
}

// Client returns the underlying http.Client
func (c *HTTPClient) Client() *http.Client {
	return c.client
}

// Interface defines the HTTP client interface for dependency injection
type Interface interface {
	Do(req *http.Request) (*http.Response, error)
	Get(url string) (*http.Response, error)
	Client() *http.Client
}

var _ Interface = (*HTTPClient)(nil)
