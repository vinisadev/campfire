package main

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// ResponseHeader represents a single response header
type ResponseHeader struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// HTTPResponse represents the response from an HTTP request
type HTTPResponse struct {
	Status     int              `json:"status"`
	StatusText string           `json:"statusText"`
	Headers    []ResponseHeader `json:"headers"`
	Body       string           `json:"body"`
	Time       int64            `json:"time"`       // milliseconds
	Size       int64            `json:"size"`       // bytes
	Error      string           `json:"error,omitempty"`
}

// HTTPClient handles sending HTTP requests
type HTTPClient struct {
	client *http.Client
}

// NewHTTPClient creates a new HTTP client
func NewHTTPClient() *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 30 * time.Second,
			// Don't follow redirects automatically - let us capture them
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("too many redirects")
				}
				return nil
			},
		},
	}
}

// SendRequest sends an HTTP request and returns the response
func (c *HTTPClient) SendRequest(request RequestData) HTTPResponse {
	startTime := time.Now()

	// Validate URL
	if request.URL == "" {
		return HTTPResponse{
			Error: "URL is required",
			Time:  0,
		}
	}

	// Build URL with query params
	requestURL, err := c.buildURL(request.URL, request.Params, request.Auth)
	if err != nil {
		return HTTPResponse{
			Error: fmt.Sprintf("Invalid URL: %v", err),
			Time:  time.Since(startTime).Milliseconds(),
		}
	}

	// Create request body
	var bodyReader io.Reader
	if request.Body != "" {
		bodyReader = strings.NewReader(request.Body)
	}

	// Create HTTP request
	req, err := http.NewRequest(request.Method, requestURL, bodyReader)
	if err != nil {
		return HTTPResponse{
			Error: fmt.Sprintf("Failed to create request: %v", err),
			Time:  time.Since(startTime).Milliseconds(),
		}
	}

	// Set default headers
	req.Header.Set("User-Agent", "Campfire/1.0")

	// Add custom headers
	for _, h := range request.Headers {
		if h.Enabled && h.Key != "" {
			req.Header.Set(h.Key, h.Value)
		}
	}

	// Apply authentication
	c.applyAuth(req, request.Auth)

	// Send request
	resp, err := c.client.Do(req)
	if err != nil {
		return HTTPResponse{
			Error: fmt.Sprintf("Request failed: %v", err),
			Time:  time.Since(startTime).Milliseconds(),
		}
	}
	defer resp.Body.Close()

	// Read response body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return HTTPResponse{
			Status:     resp.StatusCode,
			StatusText: resp.Status,
			Error:      fmt.Sprintf("Failed to read response: %v", err),
			Time:       time.Since(startTime).Milliseconds(),
		}
	}

	// Convert headers to our format
	var headers []ResponseHeader
	for key, values := range resp.Header {
		for _, value := range values {
			headers = append(headers, ResponseHeader{
				Key:   key,
				Value: value,
			})
		}
	}

	// Extract status text (remove status code prefix)
	statusText := resp.Status
	if idx := strings.Index(statusText, " "); idx != -1 {
		statusText = statusText[idx+1:]
	}

	return HTTPResponse{
		Status:     resp.StatusCode,
		StatusText: statusText,
		Headers:    headers,
		Body:       string(bodyBytes),
		Time:       time.Since(startTime).Milliseconds(),
		Size:       int64(len(bodyBytes)),
	}
}

// buildURL constructs the full URL with query parameters
func (c *HTTPClient) buildURL(baseURL string, params []KeyValuePair, auth *AuthConfig) (string, error) {
	// Add protocol if missing
	if !strings.HasPrefix(baseURL, "http://") && !strings.HasPrefix(baseURL, "https://") {
		baseURL = "https://" + baseURL
	}

	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	// Get existing query params
	query := parsedURL.Query()

	// Add custom params
	for _, p := range params {
		if p.Enabled && p.Key != "" {
			query.Add(p.Key, p.Value)
		}
	}

	// Add API key as query param if configured
	if auth != nil && auth.Type == AuthTypeAPIKey && auth.APIKeyLocation == "query" {
		if auth.APIKeyKey != "" {
			query.Set(auth.APIKeyKey, auth.APIKeyValue)
		}
	}

	parsedURL.RawQuery = query.Encode()
	return parsedURL.String(), nil
}

// applyAuth adds authentication to the request
func (c *HTTPClient) applyAuth(req *http.Request, auth *AuthConfig) {
	if auth == nil || auth.Type == AuthTypeNone {
		return
	}

	switch auth.Type {
	case AuthTypeBasic:
		if auth.BasicUsername != "" || auth.BasicPassword != "" {
			credentials := auth.BasicUsername + ":" + auth.BasicPassword
			encoded := base64.StdEncoding.EncodeToString([]byte(credentials))
			req.Header.Set("Authorization", "Basic "+encoded)
		}

	case AuthTypeBearer:
		if auth.BearerToken != "" {
			prefix := auth.BearerPrefix
			if prefix == "" {
				prefix = "Bearer"
			}
			req.Header.Set("Authorization", prefix+" "+auth.BearerToken)
		}

	case AuthTypeAPIKey:
		// Only handle header-based API key here (query is handled in buildURL)
		if auth.APIKeyLocation != "query" && auth.APIKeyKey != "" {
			req.Header.Set(auth.APIKeyKey, auth.APIKeyValue)
		}
	}
}

// FormatBytes formats bytes into a human-readable string
func FormatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}
