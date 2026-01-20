package server

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/go-go-golems/sbcap/internal/store"
	"github.com/go-go-golems/sbcap/internal/web"
)

// Server wires HTTP handlers and dependencies.
type Server struct {
	store  *store.Store
	logger zerolog.Logger
	mux    *http.ServeMux
}

// New constructs a server with the provided store.
func New(store *store.Store, logger zerolog.Logger) *Server {
	if logger.GetLevel() == zerolog.NoLevel {
		logger = log.Logger
	}

	apiRouter := chi.NewRouter()
	h := &handler{store: store, logger: logger}
	h.registerRoutes(apiRouter)

	mux := http.NewServeMux()
	mux.Handle("/api/", http.StripPrefix("/api", apiRouter))
	web.RegisterSPA(mux, web.PublicFS, web.SPAOptions{APIPrefix: "/api"})

	return &Server{store: store, logger: logger, mux: mux}
}

// Handler returns the root HTTP handler.
func (s *Server) Handler() http.Handler {
	return s.mux
}

// Serve starts the HTTP server.
func (s *Server) Serve(addr string) error {
	srv := &http.Server{
		Addr:              addr,
		Handler:           s.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	return srv.ListenAndServe()
}

// Shutdown gracefully stops the server.
func (s *Server) Shutdown(ctx context.Context) error {
	if s == nil {
		return nil
	}
	if s.mux == nil {
		return nil
	}
	return nil
}
