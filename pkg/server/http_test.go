package server

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
	hairstorage "github.com/go-go-golems/hair-booking/pkg/storage"
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

type fakeIntakeRepo struct{}

func (f *fakeIntakeRepo) CreateSubmission(ctx context.Context, submission hairintake.Submission) (*hairintake.Submission, error) {
	submission.ID = uuid.New()
	return &submission, nil
}

func (f *fakeIntakeRepo) AddPhoto(ctx context.Context, intakeID uuid.UUID, slot, storageKey, url string) (*hairintake.Photo, error) {
	return &hairintake.Photo{
		ID:         uuid.New(),
		IntakeID:   intakeID,
		Slot:       slot,
		StorageKey: storageKey,
		URL:        url,
	}, nil
}

type fakeBlobStore struct{}

func (f *fakeBlobStore) Save(ctx context.Context, key string, reader io.Reader) (*hairstorage.SavedObject, error) {
	return &hairstorage.SavedObject{
		StorageKey: key,
		URL:        "http://127.0.0.1:8080/uploads/" + key,
	}, nil
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

func TestHandleIntakeCreatesSubmission(t *testing.T) {
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
		IntakeService: hairintake.NewService(&fakeIntakeRepo{}, &fakeBlobStore{}),
	})

	request := httptest.NewRequest(http.MethodPost, "/api/intake", strings.NewReader(`{"service_type":"extensions","desired_length":4,"ext_type":"ktip"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"estimate_low\"") {
		t.Fatalf("expected response body to include estimate fields, got %s", recorder.Body.String())
	}
}

func TestHandleIntakePhotoUploadsFile(t *testing.T) {
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
		IntakeService: hairintake.NewService(&fakeIntakeRepo{}, &fakeBlobStore{}),
	})

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	if err := writer.WriteField("slot", "front"); err != nil {
		t.Fatalf("WriteField returned error: %v", err)
	}
	part, err := writer.CreateFormFile("file", "hair.png")
	if err != nil {
		t.Fatalf("CreateFormFile returned error: %v", err)
	}
	if _, err := part.Write([]byte("png")); err != nil {
		t.Fatalf("failed to write multipart file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("Close returned error: %v", err)
	}

	intakeID := uuid.New()
	request := httptest.NewRequest(http.MethodPost, "/api/intake/"+intakeID.String()+"/photos", body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	request.SetPathValue("id", intakeID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"url\"") {
		t.Fatalf("expected response body to include photo URL, got %s", recorder.Body.String())
	}
}
