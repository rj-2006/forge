package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rj-2006/techtalk/internal/database"
	"github.com/rj-2006/techtalk/internal/handlers"
	"github.com/rj-2006/techtalk/internal/middleware"
	clubws "github.com/rj-2006/techtalk/internal/websocket"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestApp(t *testing.T) *gin.Engine {
	t.Helper()

	gin.SetMode(gin.TestMode)
	t.Setenv("JWT_SECRET", "test-secret")
	if err := middleware.InitJWT(); err != nil {
		t.Fatalf("init jwt: %v", err)
	}

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	database.DB = db
	if err := database.Migrate(); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	database.Seed()

	handlers.ChatHub = clubws.NewHub()
	go handlers.ChatHub.Run()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           time.Hour,
	}))

	r.POST("/api/register", handlers.Register)
	r.POST("/api/login", handlers.Login)
	r.GET("/api/homepage", handlers.GetHomepage)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/threads", handlers.CreateThread)
		protected.GET("/threads", handlers.GetThreads)
		protected.GET("/threads/:id", handlers.GetThread)
		protected.POST("/threads/:id/posts", handlers.CreatePost)

		protected.POST("/threads/:id/reactions", handlers.AddThreadReactions)
		protected.DELETE("/threads/:id/reactions/:emoji", handlers.RemoveThreadReaction)
		protected.GET("/threads/:id/reactions", handlers.GetThreadReactions)

		protected.POST("/chatrooms", handlers.CreateChatroom)
		protected.GET("/chatrooms", handlers.GetChatrooms)
		protected.GET("/chatrooms/:id/history", handlers.GetChatHistory)
		protected.GET("/chatrooms/:id/ws", handlers.HandleChatWebsocket)

		protected.POST("/upload/avatar", handlers.UploadAvatar)
		protected.POST("/upload/image", handlers.UploadThreadImage)

		protected.POST("/emojis", handlers.CreateCustomEmoji)
		protected.GET("/emojis", handlers.GetCustomEmojis)
		protected.DELETE("/emojis/:id", handlers.DeleteCustomEmoji)
	}

	return r
}

func performJSONRequest(t *testing.T, r http.Handler, method, path string, body any, token string) *httptest.ResponseRecorder {
	t.Helper()

	var payload []byte
	var err error
	if body != nil {
		payload, err = json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func decodeJSON[T any](t *testing.T, w *httptest.ResponseRecorder) T {
	t.Helper()

	var value T
	if err := json.Unmarshal(w.Body.Bytes(), &value); err != nil {
		t.Fatalf("decode response: %v; body=%s", err, w.Body.String())
	}
	return value
}

func registerTestUser(t *testing.T, r http.Handler, username, email, password string) string {
	t.Helper()

	resp := performJSONRequest(t, r, http.MethodPost, "/api/register", map[string]string{
		"username": username,
		"email":    email,
		"password": password,
	}, "")

	if resp.Code != http.StatusCreated {
		t.Fatalf("expected 201 on register, got %d: %s", resp.Code, resp.Body.String())
	}

	payload := decodeJSON[struct {
		Token string `json:"token"`
	}](t, resp)

	if payload.Token == "" {
		t.Fatal("expected register response to include token")
	}

	return payload.Token
}

func TestHomepageEndpointReturnsSeededClubData(t *testing.T) {
	r := setupTestApp(t)

	resp := performJSONRequest(t, r, http.MethodGet, "/api/homepage", nil, "")
	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
	}

	payload := decodeJSON[struct {
		Club struct {
			Name string `json:"name"`
		} `json:"club"`
		Team          []any `json:"team"`
		Events        []any `json:"events"`
		Announcements []any `json:"announcements"`
		Stats         struct {
			TotalEvents int64 `json:"total_events"`
		} `json:"stats"`
	}](t, resp)

	if payload.Club.Name != "Devign" {
		t.Fatalf("expected seeded club name Devign, got %q", payload.Club.Name)
	}
	if len(payload.Team) == 0 || len(payload.Events) == 0 || len(payload.Announcements) == 0 {
		t.Fatalf("expected seeded homepage collections, got team=%d events=%d announcements=%d", len(payload.Team), len(payload.Events), len(payload.Announcements))
	}
	if payload.Stats.TotalEvents == 0 {
		t.Fatal("expected homepage stats to include seeded events")
	}
}

func TestRegisterAndLoginFlow(t *testing.T) {
	r := setupTestApp(t)

	registerResp := performJSONRequest(t, r, http.MethodPost, "/api/register", map[string]string{
		"username": "testuser",
		"email":    "testuser@example.com",
		"password": "Password1",
	}, "")
	if registerResp.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", registerResp.Code, registerResp.Body.String())
	}

	registerPayload := decodeJSON[struct {
		Token string `json:"token"`
		User  struct {
			Username string `json:"username"`
			Email    string `json:"email"`
		} `json:"user"`
	}](t, registerResp)

	if registerPayload.Token == "" {
		t.Fatal("expected register to return a JWT")
	}
	if registerPayload.User.Email != "testuser@example.com" {
		t.Fatalf("unexpected registered email: %q", registerPayload.User.Email)
	}

	loginResp := performJSONRequest(t, r, http.MethodPost, "/api/login", map[string]string{
		"email":    "testuser@example.com",
		"password": "Password1",
	}, "")
	if loginResp.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", loginResp.Code, loginResp.Body.String())
	}

	loginPayload := decodeJSON[struct {
		Token string `json:"token"`
	}](t, loginResp)

	if loginPayload.Token == "" {
		t.Fatal("expected login to return a JWT")
	}
}

func TestProtectedForumFlow(t *testing.T) {
	r := setupTestApp(t)
	token := registerTestUser(t, r, "forumuser", "forumuser@example.com", "Password1")

	unauthorized := performJSONRequest(t, r, http.MethodGet, "/api/threads", nil, "")
	if unauthorized.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for protected route without token, got %d", unauthorized.Code)
	}

	createThread := performJSONRequest(t, r, http.MethodPost, "/api/threads", map[string]any{
		"title":   "Test Thread",
		"content": "Initial post content",
		"images": []map[string]string{
			{"url": "/uploads/images/demo.jpg", "caption": "demo"},
		},
	}, token)
	if createThread.Code != http.StatusCreated {
		t.Fatalf("expected 201 creating thread, got %d: %s", createThread.Code, createThread.Body.String())
	}

	createdThread := decodeJSON[struct {
		ID     uint `json:"id"`
		Posts  []struct {
			Content string `json:"content"`
		} `json:"posts"`
		Images []struct {
			URL string `json:"url"`
		} `json:"images"`
	}](t, createThread)

	if createdThread.ID == 0 {
		t.Fatal("expected created thread id")
	}
	if len(createdThread.Posts) != 1 || createdThread.Posts[0].Content != "Initial post content" {
		t.Fatalf("expected initial post to be created, got %+v", createdThread.Posts)
	}
	if len(createdThread.Images) != 1 || createdThread.Images[0].URL == "" {
		t.Fatalf("expected thread image to be persisted, got %+v", createdThread.Images)
	}

	listThreads := performJSONRequest(t, r, http.MethodGet, "/api/threads", nil, token)
	if listThreads.Code != http.StatusOK {
		t.Fatalf("expected 200 listing threads, got %d: %s", listThreads.Code, listThreads.Body.String())
	}

	getThread := performJSONRequest(t, r, http.MethodGet, fmt.Sprintf("/api/threads/%d", createdThread.ID), nil, token)
	if getThread.Code != http.StatusOK {
		t.Fatalf("expected 200 fetching thread, got %d: %s", getThread.Code, getThread.Body.String())
	}

	reply := performJSONRequest(t, r, http.MethodPost, fmt.Sprintf("/api/threads/%d/posts", createdThread.ID), map[string]string{
		"content": "A follow-up reply",
	}, token)
	if reply.Code != http.StatusCreated {
		t.Fatalf("expected 201 creating post, got %d: %s", reply.Code, reply.Body.String())
	}
}

func TestThreadReactionsCanBeAddedFetchedAndRemoved(t *testing.T) {
	r := setupTestApp(t)
	token := registerTestUser(t, r, "reactuser", "reactuser@example.com", "Password1")

	createThread := performJSONRequest(t, r, http.MethodPost, "/api/threads", map[string]string{
		"title":   "Reaction Thread",
		"content": "React to me",
	}, token)
	if createThread.Code != http.StatusCreated {
		t.Fatalf("expected 201 creating thread, got %d: %s", createThread.Code, createThread.Body.String())
	}

	createdThread := decodeJSON[struct {
		ID uint `json:"id"`
	}](t, createThread)

	addReaction := performJSONRequest(t, r, http.MethodPost, fmt.Sprintf("/api/threads/%d/reactions", createdThread.ID), map[string]string{
		"emoji": "🔥",
	}, token)
	if addReaction.Code != http.StatusCreated {
		t.Fatalf("expected 201 adding reaction, got %d: %s", addReaction.Code, addReaction.Body.String())
	}

	getReactions := performJSONRequest(t, r, http.MethodGet, fmt.Sprintf("/api/threads/%d/reactions", createdThread.ID), nil, token)
	if getReactions.Code != http.StatusOK {
		t.Fatalf("expected 200 getting reactions, got %d: %s", getReactions.Code, getReactions.Body.String())
	}

	reactionsPayload := decodeJSON[struct {
		EmojiCounts map[string]int `json:"emoji_counts"`
	}](t, getReactions)

	if reactionsPayload.EmojiCounts["🔥"] != 1 {
		t.Fatalf("expected one fire reaction, got %+v", reactionsPayload.EmojiCounts)
	}

	removeReaction := performJSONRequest(t, r, http.MethodDelete, fmt.Sprintf("/api/threads/%d/reactions/%%F0%%9F%%94%%A5", createdThread.ID), nil, token)
	if removeReaction.Code != http.StatusOK {
		t.Fatalf("expected 200 removing reaction, got %d: %s", removeReaction.Code, removeReaction.Body.String())
	}
}
