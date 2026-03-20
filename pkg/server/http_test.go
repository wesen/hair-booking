package server

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
	"github.com/google/uuid"
)

func TestHandleMeDevMode(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html":    &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
			"static/app.js": &fstest.MapFile{Data: []byte("console.log('ok');")},
		},
		ClientService: hairclients.NewService(&fakeClientServiceRepo{}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"client\"") {
		t.Fatalf("expected response body to include a client payload, got %s", recorder.Body.String())
	}
}

func TestHandleMeOIDCRequiresSession(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode: hairauth.AuthModeOIDC,
		},
		PublicFS: fstest.MapFS{
			"index.html":    &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
			"static/app.js": &fstest.MapFile{Data: []byte("console.log('ok');")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestRootServesSPAIndex(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html":        &fstest.MapFile{Data: []byte("<html><body>landing</body></html>")},
			"static/app.js":     &fstest.MapFile{Data: []byte("console.log('ok');")},
			"static/app.css":    &fstest.MapFile{Data: []byte("body {}")},
			"favicon.ico":       &fstest.MapFile{Data: []byte("ico")},
			"nested/route.html": &fstest.MapFile{Data: []byte("<html>route</html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "landing") {
		t.Fatalf("expected SPA fallback body, got %s", recorder.Body.String())
	}
}

type fakeClientServiceRepo struct{}

func (f *fakeClientServiceRepo) FindByAuthIdentity(ctx context.Context, issuer, subject string) (*hairclients.Client, error) {
	return nil, hairclients.ErrNotFound
}

func (f *fakeClientServiceRepo) CreateAuthenticatedClient(ctx context.Context, identity hairclients.AuthenticatedIdentity) (*hairclients.Client, error) {
	return &hairclients.Client{
		ID:          uuid.New(),
		AuthSubject: identity.Subject,
		AuthIssuer:  identity.Issuer,
		Name:        identity.DisplayName,
		Email:       identity.Email,
	}, nil
}

func (f *fakeClientServiceRepo) UpdateAuthenticatedClient(ctx context.Context, clientID uuid.UUID, identity hairclients.AuthenticatedIdentity) (*hairclients.Client, error) {
	return &hairclients.Client{
		ID:          clientID,
		AuthSubject: identity.Subject,
		AuthIssuer:  identity.Issuer,
		Name:        identity.DisplayName,
		Email:       identity.Email,
	}, nil
}

func (f *fakeClientServiceRepo) EnsureNotificationPrefs(ctx context.Context, clientID uuid.UUID) (*hairclients.NotificationPrefs, error) {
	return &hairclients.NotificationPrefs{
		ClientID:    clientID,
		Remind48hr:  true,
		Remind2hr:   true,
		MaintAlerts: true,
	}, nil
}

type fakeCatalogRepo struct {
	items []hairservices.CatalogItem
}

func (f *fakeCatalogRepo) ListActive(ctx context.Context, category string) ([]hairservices.CatalogItem, error) {
	return f.items, nil
}

func TestHandleMeReturnsBootstrappedClient(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html":    &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
			"static/app.js": &fstest.MapFile{Data: []byte("console.log('ok');")},
		},
		ClientService: hairclients.NewService(&fakeClientServiceRepo{}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"notification_prefs\"") {
		t.Fatalf("expected response to include notification preferences, got %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "\"name\":\"Development User\"") {
		t.Fatalf("expected response to include bootstrapped client name, got %s", recorder.Body.String())
	}
}

func TestHandleServicesReturnsCatalog(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html":    &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
			"static/app.js": &fstest.MapFile{Data: []byte("console.log('ok');")},
		},
		CatalogService: hairservices.NewService(&fakeCatalogRepo{
			items: []hairservices.CatalogItem{{
				ID:          uuid.New(),
				Name:        "Gloss / Toner",
				Category:    "color",
				DurationMin: 45,
				IsActive:    true,
				SortOrder:   1,
			}},
		}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/services", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "Gloss / Toner") {
		t.Fatalf("expected response to include seeded service name, got %s", recorder.Body.String())
	}
}
