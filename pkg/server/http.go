package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"strings"
	"time"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairdb "github.com/go-go-golems/hair-booking/pkg/db"
	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
	"github.com/go-go-golems/hair-booking/pkg/web"
)

type ServerOptions struct {
	Host           string
	Port           int
	Version        string
	AuthSettings   *hairauth.Settings
	Database       *hairdb.DB
	ClientService  *hairclients.Service
	CatalogService *hairservices.Service
}

type HandlerOptions struct {
	Version        string
	StartedAt      time.Time
	AuthSettings   *hairauth.Settings
	SessionManager *hairauth.SessionManager
	WebAuth        hairauth.WebHandler
	PublicFS       fs.FS
	Database       *hairdb.DB
	ClientService  *hairclients.Service
	CatalogService *hairservices.Service
}

type infoResponse struct {
	Service            string    `json:"service"`
	Version            string    `json:"version"`
	StartedAt          time.Time `json:"startedAt"`
	AuthMode           string    `json:"authMode"`
	IssuerURL          string    `json:"issuerUrl,omitempty"`
	ClientID           string    `json:"clientId,omitempty"`
	LoginPath          string    `json:"loginPath,omitempty"`
	LogoutPath         string    `json:"logoutPath,omitempty"`
	CallbackPath       string    `json:"callbackPath,omitempty"`
	DatabaseConfigured bool      `json:"databaseConfigured"`
}

type appHandler struct {
	version        string
	startedAt      time.Time
	authSettings   *hairauth.Settings
	sessionManager *hairauth.SessionManager
	database       *hairdb.DB
	clientService  *hairclients.Service
	catalogService *hairservices.Service
}

type apiEnvelope struct {
	Data any `json:"data,omitempty"`
}

type errorEnvelope struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewHTTPServer(ctx context.Context, options ServerOptions) (*http.Server, error) {
	var (
		sessionManager *hairauth.SessionManager
		webAuth        hairauth.WebHandler
		err            error
	)

	authSettings := options.AuthSettings
	if authSettings == nil {
		authSettings = &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "local-user"}
	}

	if authSettings.Mode == hairauth.AuthModeOIDC {
		sessionManager, err = hairauth.NewSessionManager(
			authSettings.SessionCookieName,
			authSettings.SessionSecret,
			authSettings.OIDCRedirectURL,
		)
		if err != nil {
			return nil, err
		}

		webAuth, err = hairauth.NewOIDCAuthenticator(ctx, authSettings, sessionManager)
		if err != nil {
			return nil, err
		}
	}

	clientService := options.ClientService
	catalogService := options.CatalogService
	if options.Database != nil && options.Database.Pool() != nil {
		if clientService == nil {
			clientService = hairclients.NewService(hairclients.NewPostgresRepository(options.Database.Pool()))
		}
		if catalogService == nil {
			catalogService = hairservices.NewService(hairservices.NewPostgresRepository(options.Database.Pool()))
		}
	}

	return &http.Server{
		Addr: fmt.Sprintf("%s:%d", options.Host, options.Port),
		Handler: NewHandler(HandlerOptions{
			Version:        options.Version,
			StartedAt:      time.Now().UTC(),
			AuthSettings:   authSettings,
			SessionManager: sessionManager,
			WebAuth:        webAuth,
			PublicFS:       web.PublicFS,
			Database:       options.Database,
			ClientService:  clientService,
			CatalogService: catalogService,
		}),
		ReadHeaderTimeout: 10 * time.Second,
	}, nil
}

func NewHandler(options HandlerOptions) http.Handler {
	authSettings := options.AuthSettings
	if authSettings == nil {
		authSettings = &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "local-user"}
	}

	publicFS := options.PublicFS
	if publicFS == nil {
		publicFS = web.PublicFS
	}

	h := &appHandler{
		version:        options.Version,
		startedAt:      options.StartedAt,
		authSettings:   authSettings,
		sessionManager: options.SessionManager,
		database:       options.Database,
		clientService:  options.ClientService,
		catalogService: options.CatalogService,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, apiEnvelope{Data: map[string]string{"status": "ok"}})
	})
	mux.HandleFunc("GET /api/info", h.handleInfo)
	mux.HandleFunc("GET /api/me", h.handleMe)
	mux.HandleFunc("GET /api/services", h.handleServices)

	if options.WebAuth != nil {
		mux.HandleFunc("GET /auth/login", options.WebAuth.HandleLogin)
		mux.HandleFunc("GET /auth/callback", options.WebAuth.HandleCallback)
		mux.HandleFunc("GET /auth/logout", options.WebAuth.HandleLogout)
	}

	registerWeb(mux, publicFS)
	return mux
}

func (h *appHandler) handleInfo(w http.ResponseWriter, r *http.Request) {
	response := infoResponse{
		Service:            "hair-booking",
		Version:            h.version,
		StartedAt:          h.startedAt,
		AuthMode:           h.authSettings.Mode,
		IssuerURL:          h.authSettings.OIDCIssuerURL,
		ClientID:           h.authSettings.OIDCClientID,
		LoginPath:          "/auth/login",
		LogoutPath:         "/auth/logout",
		CallbackPath:       "/auth/callback",
		DatabaseConfigured: h.database != nil,
	}
	writeJSON(w, http.StatusOK, apiEnvelope{Data: response})
}

func (h *appHandler) currentUser(r *http.Request) (*hairauth.UserInfo, bool) {
	claims, ok := h.currentClaims(r)
	if !ok {
		return nil, false
	}
	user := claims.UserInfo(h.authSettings.Mode)
	return &user, true
}

func timeNowUTC() time.Time {
	return time.Now().UTC()
}

func registerWeb(mux *http.ServeMux, publicFS fs.FS) {
	if mux == nil || publicFS == nil {
		return
	}

	staticFS, err := fs.Sub(publicFS, "static")
	if err == nil {
		fileServer := http.FileServer(http.FS(staticFS))
		mux.Handle("/static/", http.StripPrefix("/static/", fileServer))
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") || strings.HasPrefix(r.URL.Path, "/auth/") {
			http.NotFound(w, r)
			return
		}

		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		if _, err := publicFS.Open(path); err == nil {
			http.FileServer(http.FS(publicFS)).ServeHTTP(w, r)
			return
		}

		index, err := publicFS.Open("index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer func() { _ = index.Close() }()

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = io.Copy(w, index)
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeAPIError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorEnvelope{
		Error: apiError{
			Code:    code,
			Message: message,
		},
	})
}
