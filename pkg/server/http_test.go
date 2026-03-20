package server

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	hairappointments "github.com/go-go-golems/hair-booking/pkg/appointments"
	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
	hairstorage "github.com/go-go-golems/hair-booking/pkg/storage"
	hairstylist "github.com/go-go-golems/hair-booking/pkg/stylist"
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

func TestRootProxiesToFrontendDevServerWhenConfigured(t *testing.T) {
	frontend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/portal" {
			t.Fatalf("expected proxied request path /portal, got %s", r.URL.Path)
		}
		_, _ = io.WriteString(w, "<html><body>frontend portal</body></html>")
	}))
	defer frontend.Close()

	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>landing</body></html>")},
		},
		FrontendDevProxyURL: frontend.URL,
	})

	request := httptest.NewRequest(http.MethodGet, "/portal", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "frontend portal") {
		t.Fatalf("expected proxied frontend body, got %s", recorder.Body.String())
	}
}

func TestAPIRoutesBypassFrontendDevProxy(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>landing</body></html>")},
		},
		ClientService:       hairclients.NewService(&fakeClientServiceRepo{}),
		FrontendDevProxyURL: "http://127.0.0.1:65535",
	})

	request := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"service\":\"hair-booking\"") {
		t.Fatalf("expected API response body, got %s", recorder.Body.String())
	}
}

func TestHandleStylistMeDevMode(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/me", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"stylist\"") {
		t.Fatalf("expected stylist payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistMeOIDCRequiresSession(t *testing.T) {
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:                 hairauth.AuthModeOIDC,
			StylistAllowedEmails: []string{"alice@example.com"},
		},
		SessionManager: mustSessionManager(t),
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/me", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestHandleStylistMeOIDCRejectsNonStylistUser(t *testing.T) {
	sessionManager := mustSessionManager(t)
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:                 hairauth.AuthModeOIDC,
			StylistAllowedEmails: []string{"alice@example.com"},
		},
		SessionManager: sessionManager,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := requestWithSession(t, sessionManager, hairauth.SessionClaims{
		Issuer:      "issuer",
		Subject:     "user-123",
		Email:       "bob@example.com",
		DisplayName: "Bob Example",
		IssuedAt:    time.Now().UTC(),
		ExpiresAt:   time.Now().UTC().Add(24 * time.Hour),
	}, "/api/stylist/me")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", recorder.Code)
	}
}

func TestHandleStylistMeOIDCAllowsConfiguredStylist(t *testing.T) {
	sessionManager := mustSessionManager(t)
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:                 hairauth.AuthModeOIDC,
			StylistAllowedEmails: []string{"alice@example.com"},
		},
		SessionManager: sessionManager,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := requestWithSession(t, sessionManager, hairauth.SessionClaims{
		Issuer:            "issuer",
		Subject:           "user-123",
		Email:             "alice@example.com",
		DisplayName:       "Alice Example",
		PreferredUsername: "alice",
		IssuedAt:          time.Now().UTC(),
		ExpiresAt:         time.Now().UTC().Add(24 * time.Hour),
	}, "/api/stylist/me")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"alice@example.com\"") {
		t.Fatalf("expected stylist email in response, got %s", recorder.Body.String())
	}
}

func TestHandleStylistIntakesDevMode(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{
		items: []hairstylist.IntakeListItem{
			{
				ID:          uuid.New(),
				ServiceType: "extensions",
				Review: hairstylist.IntakeReview{
					Status:   hairstylist.ReviewStatusNew,
					Priority: hairstylist.ReviewPriorityNormal,
				},
			},
		},
	})

	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/intakes", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"intakes\"") {
		t.Fatalf("expected intakes payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistDashboardDevMode(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{
		stats: &hairstylist.DashboardIntakeStats{
			NewCount:      2,
			InReviewCount: 1,
		},
		dashboardAppointments: []hairstylist.DashboardAppointment{
			{
				AppointmentID: uuid.New(),
				Date:          time.Now().UTC().Format(time.DateOnly),
				StartTime:     "09:00 AM",
				ClientName:    "Alice Example",
				ServiceName:   "Extensions Consultation",
				Status:        "pending",
			},
		},
	})

	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/dashboard", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"dashboard\"") {
		t.Fatalf("expected dashboard payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistAppointmentsDevMode(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{
		appointmentRows: []hairstylist.Appointment{
			{
				ID:          uuid.New(),
				ClientID:    uuid.New(),
				ClientName:  "Alice Example",
				ServiceID:   uuid.New(),
				ServiceName: "Extensions Consultation",
				Date:        "2026-03-25",
				StartTime:   "09:30 AM",
				Status:      "pending",
			},
		},
	})

	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/appointments", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"appointments\"") {
		t.Fatalf("expected appointments payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistAppointmentUpdateRejectsInvalidStatus(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodPatch, "/api/stylist/appointments/"+uuid.NewString(), strings.NewReader(`{"status":"bogus"}`))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestHandleStylistAppointmentDetailReturnsPhotos(t *testing.T) {
	appointmentID := uuid.New()
	service := hairstylist.NewService(&fakeStylistRepo{
		appointmentDetail: &hairstylist.AppointmentDetail{
			Appointment: &hairstylist.Appointment{
				ID:          appointmentID,
				ClientID:    uuid.New(),
				ClientName:  "Alice Example",
				ServiceID:   uuid.New(),
				ServiceName: "Extensions Consultation",
				Date:        "2026-03-25",
				StartTime:   "09:30 AM",
				Status:      "confirmed",
			},
			Photos: []hairappointments.AppointmentPhoto{{
				ID:   uuid.New(),
				Slot: "after",
				URL:  "http://127.0.0.1:8080/uploads/after.png",
			}},
		},
	})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/appointments/"+appointmentID.String(), nil)
	request.SetPathValue("id", appointmentID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"photos\"") || !strings.Contains(recorder.Body.String(), "\"slot\":\"after\"") {
		t.Fatalf("expected appointment detail photos, got %s", recorder.Body.String())
	}
}

func TestHandleStylistAppointmentPhotoUploadsFile(t *testing.T) {
	appointmentID := uuid.New()
	handler := NewHandler(HandlerOptions{
		Version:   "dev",
		StartedAt: time.Now().UTC(),
		AuthSettings: &hairauth.Settings{
			Mode:      hairauth.AuthModeDev,
			DevUserID: "intern",
		},
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{}, &fakeBlobStore{}),
	})

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	if err := writer.WriteField("slot", "before"); err != nil {
		t.Fatalf("WriteField returned error: %v", err)
	}
	if err := writer.WriteField("caption", "Fresh install"); err != nil {
		t.Fatalf("WriteField returned error: %v", err)
	}
	part, err := writer.CreateFormFile("file", "before.png")
	if err != nil {
		t.Fatalf("CreateFormFile returned error: %v", err)
	}
	if _, err := part.Write([]byte{0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n'}); err != nil {
		t.Fatalf("failed to write multipart file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("Close returned error: %v", err)
	}

	request := httptest.NewRequest(http.MethodPost, "/api/stylist/appointments/"+appointmentID.String()+"/photos", body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	request.SetPathValue("id", appointmentID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"photo\"") || !strings.Contains(recorder.Body.String(), "\"slot\":\"before\"") {
		t.Fatalf("expected created photo payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistIntakeDetailNotFound(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{detailErr: hairstylist.ErrNotFound})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/intakes/"+uuid.NewString(), nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", recorder.Code)
	}
}

func TestHandleStylistIntakeReviewRejectsInvalidPayload(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodPatch, "/api/stylist/intakes/"+uuid.NewString()+"/review", strings.NewReader(`{"status":"bogus"}`))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestHandleStylistIntakeReviewReturnsReview(t *testing.T) {
	review := &hairstylist.IntakeReview{
		ID:       uuid.New(),
		IntakeID: uuid.New(),
		Status:   hairstylist.ReviewStatusApprovedToBook,
		Priority: hairstylist.ReviewPriorityUrgent,
	}
	service := hairstylist.NewService(&fakeStylistRepo{upserted: review})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	bodyBytes, err := json.Marshal(map[string]any{
		"status":   hairstylist.ReviewStatusApprovedToBook,
		"priority": hairstylist.ReviewPriorityUrgent,
	})
	if err != nil {
		t.Fatalf("json.Marshal returned error: %v", err)
	}

	request := httptest.NewRequest(http.MethodPatch, "/api/stylist/intakes/"+review.IntakeID.String()+"/review", strings.NewReader(string(bodyBytes)))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), review.Status) {
		t.Fatalf("expected review payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistClientsDevMode(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{
		clientRows: []hairstylist.ClientListItem{{
			ID:   uuid.New(),
			Name: "Alice Example",
		}},
	})

	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/clients?search=alice", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"clients\"") {
		t.Fatalf("expected clients payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistClientDetailDevMode(t *testing.T) {
	clientID := uuid.New()
	service := hairstylist.NewService(&fakeStylistRepo{
		clientDetail: &hairstylist.ClientDetail{
			Client: &hairclients.Client{
				ID:   clientID,
				Name: "Alice Example",
			},
		},
	})

	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/clients/"+clientID.String(), nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"Alice Example\"") {
		t.Fatalf("expected client detail payload, got %s", recorder.Body.String())
	}
}

func TestHandleStylistClientDetailNotFound(t *testing.T) {
	service := hairstylist.NewService(&fakeStylistRepo{clientErr: hairstylist.ErrNotFound})
	handler := NewHandler(HandlerOptions{
		Version:        "dev",
		StartedAt:      time.Now().UTC(),
		AuthSettings:   &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "intern"},
		StylistService: service,
		PublicFS: fstest.MapFS{
			"index.html": &fstest.MapFile{Data: []byte("<html><body>ok</body></html>")},
		},
	})

	request := httptest.NewRequest(http.MethodGet, "/api/stylist/clients/"+uuid.NewString(), nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", recorder.Code)
	}
}

type fakeClientServiceRepo struct{}

type fakeStylistRepo struct {
	items                 []hairstylist.IntakeListItem
	detail                *hairstylist.IntakeDetail
	upserted              *hairstylist.IntakeReview
	stats                 *hairstylist.DashboardIntakeStats
	dashboardAppointments []hairstylist.DashboardAppointment
	appointmentRows       []hairstylist.Appointment
	appointmentDetail     *hairstylist.AppointmentDetail
	updatedAppointment    *hairstylist.Appointment
	clientRows            []hairstylist.ClientListItem
	clientDetail          *hairstylist.ClientDetail
	detailErr             error
	updateErr             error
	clientErr             error
}

func (f *fakeStylistRepo) ListIntakes(ctx context.Context, filter hairstylist.IntakeListFilter) ([]hairstylist.IntakeListItem, error) {
	return f.items, nil
}

func (f *fakeStylistRepo) GetDashboardIntakeStats(ctx context.Context) (*hairstylist.DashboardIntakeStats, error) {
	return f.stats, nil
}

func (f *fakeStylistRepo) ListDashboardAppointments(ctx context.Context, startDate time.Time, limit int) ([]hairstylist.DashboardAppointment, error) {
	return f.dashboardAppointments, nil
}

func (f *fakeStylistRepo) ListAppointments(ctx context.Context, filter hairstylist.AppointmentListFilter) ([]hairstylist.Appointment, error) {
	return f.appointmentRows, nil
}

func (f *fakeStylistRepo) GetAppointment(ctx context.Context, appointmentID uuid.UUID) (*hairstylist.AppointmentDetail, error) {
	if f.appointmentDetail != nil {
		return f.appointmentDetail, nil
	}
	return &hairstylist.AppointmentDetail{
		Appointment: &hairstylist.Appointment{ID: appointmentID, Status: "pending"},
	}, nil
}

func (f *fakeStylistRepo) UpdateAppointment(ctx context.Context, appointmentID uuid.UUID, update hairstylist.AppointmentUpdate, updatedAt time.Time) (*hairstylist.Appointment, error) {
	if f.updatedAppointment != nil {
		return f.updatedAppointment, nil
	}
	return &hairstylist.Appointment{
		ID:     appointmentID,
		Status: "confirmed",
	}, nil
}

func (f *fakeStylistRepo) GetIntake(ctx context.Context, intakeID uuid.UUID) (*hairstylist.IntakeDetail, error) {
	if f.detailErr != nil {
		return nil, f.detailErr
	}
	if f.detail != nil {
		return f.detail, nil
	}
	return &hairstylist.IntakeDetail{
		Submission: &hairintake.Submission{ID: intakeID, ServiceType: "extensions"},
	}, nil
}

func (f *fakeStylistRepo) UpsertIntakeReview(ctx context.Context, intakeID uuid.UUID, update hairstylist.IntakeReviewUpdate, reviewedAt time.Time) (*hairstylist.IntakeReview, error) {
	if f.updateErr != nil {
		return nil, f.updateErr
	}
	if f.upserted != nil {
		return f.upserted, nil
	}
	return &hairstylist.IntakeReview{
		ID:       uuid.New(),
		IntakeID: intakeID,
		Status:   hairstylist.ReviewStatusInReview,
		Priority: hairstylist.ReviewPriorityNormal,
	}, nil
}

func (f *fakeStylistRepo) ListClients(ctx context.Context, filter hairstylist.ClientListFilter) ([]hairstylist.ClientListItem, error) {
	return f.clientRows, nil
}

func (f *fakeStylistRepo) GetClient(ctx context.Context, clientID uuid.UUID) (*hairstylist.ClientDetail, error) {
	if f.clientErr != nil {
		return nil, f.clientErr
	}
	if f.clientDetail != nil {
		return f.clientDetail, nil
	}
	return &hairstylist.ClientDetail{
		Client: &hairclients.Client{
			ID:   clientID,
			Name: "Alice Example",
		},
	}, nil
}

func mustSessionManager(t *testing.T) *hairauth.SessionManager {
	t.Helper()

	manager, err := hairauth.NewSessionManager("test-session", "test-secret", "http://127.0.0.1:8080/auth/callback")
	if err != nil {
		t.Fatalf("NewSessionManager returned error: %v", err)
	}
	return manager
}

func requestWithSession(t *testing.T, sessionManager *hairauth.SessionManager, claims hairauth.SessionClaims, path string) *http.Request {
	t.Helper()

	request := httptest.NewRequest(http.MethodGet, path, nil)
	recorder := httptest.NewRecorder()
	if err := sessionManager.WriteSession(recorder, request, claims); err != nil {
		t.Fatalf("WriteSession returned error: %v", err)
	}

	response := recorder.Result()
	t.Cleanup(func() {
		_ = response.Body.Close()
	})
	for _, cookie := range response.Cookies() {
		request.AddCookie(cookie)
	}
	return request
}

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

func (f *fakeClientServiceRepo) UpdateProfile(ctx context.Context, clientID uuid.UUID, update hairclients.ProfileUpdate) (*hairclients.Client, error) {
	client := &hairclients.Client{
		ID:          clientID,
		AuthSubject: "intern",
		AuthIssuer:  "dev",
		Name:        "Development User",
	}
	if update.Name != nil {
		client.Name = *update.Name
	}
	if update.Email != nil {
		client.Email = *update.Email
	}
	if update.Phone != nil {
		client.Phone = *update.Phone
	}
	if update.ScalpNotes != nil {
		client.ScalpNotes = *update.ScalpNotes
	}
	return client, nil
}

func (f *fakeClientServiceRepo) UpdateNotificationPrefs(ctx context.Context, clientID uuid.UUID, update hairclients.NotificationPrefsUpdate) (*hairclients.NotificationPrefs, error) {
	prefs := &hairclients.NotificationPrefs{
		ClientID:    clientID,
		Remind48hr:  true,
		Remind2hr:   true,
		MaintAlerts: true,
	}
	if update.Remind48hr != nil {
		prefs.Remind48hr = *update.Remind48hr
	}
	if update.Remind2hr != nil {
		prefs.Remind2hr = *update.Remind2hr
	}
	if update.MaintAlerts != nil {
		prefs.MaintAlerts = *update.MaintAlerts
	}
	return prefs, nil
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

type fakeAppointmentRepo struct {
	service          *hairappointments.ServiceInfo
	client           *hairappointments.Client
	portalRows       []hairappointments.PortalAppointment
	portalDetail     *hairappointments.PortalAppointment
	photos           []hairappointments.AppointmentPhoto
	maintenance      *hairappointments.MaintenancePlan
	maintenanceItems []hairappointments.MaintenancePlanItem
}

func (f *fakeAppointmentRepo) ListScheduleBlocks(ctx context.Context) ([]hairappointments.ScheduleBlock, error) {
	return []hairappointments.ScheduleBlock{
		{DayOfWeek: 1, StartTime: "09:00", EndTime: "11:00", IsAvailable: true},
	}, nil
}

func (f *fakeAppointmentRepo) ListScheduleOverrides(ctx context.Context, startDate, endDate time.Time) ([]hairappointments.ScheduleOverride, error) {
	return nil, nil
}

func (f *fakeAppointmentRepo) ListBookedAppointments(ctx context.Context, startDate, endDate time.Time) ([]hairappointments.Appointment, error) {
	return nil, nil
}

func (f *fakeAppointmentRepo) GetService(ctx context.Context, serviceID uuid.UUID) (*hairappointments.ServiceInfo, error) {
	if f.service != nil && f.service.ID == serviceID {
		return f.service, nil
	}
	return nil, hairappointments.ErrNotFound
}

func (f *fakeAppointmentRepo) FindOrCreateBookingClient(ctx context.Context, name, email, phone string) (*hairappointments.Client, error) {
	if f.client != nil {
		return f.client, nil
	}
	return &hairappointments.Client{ID: uuid.New(), Name: name, Email: email, Phone: phone}, nil
}

func (f *fakeAppointmentRepo) CreateAppointment(ctx context.Context, appointment hairappointments.Appointment) (*hairappointments.Appointment, error) {
	if appointment.ID == uuid.Nil {
		appointment.ID = uuid.New()
	}
	appointment.CreatedAt = time.Now().UTC()
	appointment.UpdatedAt = appointment.CreatedAt
	return &appointment, nil
}

func (f *fakeAppointmentRepo) ListClientAppointments(ctx context.Context, clientID uuid.UUID) ([]hairappointments.PortalAppointment, error) {
	return f.portalRows, nil
}

func (f *fakeAppointmentRepo) GetClientAppointment(ctx context.Context, clientID, appointmentID uuid.UUID) (*hairappointments.PortalAppointment, error) {
	if f.portalDetail != nil && f.portalDetail.ID == appointmentID {
		return f.portalDetail, nil
	}
	return nil, hairappointments.ErrNotFound
}

func (f *fakeAppointmentRepo) ListAppointmentPhotos(ctx context.Context, appointmentID uuid.UUID) ([]hairappointments.AppointmentPhoto, error) {
	return f.photos, nil
}

func (f *fakeAppointmentRepo) AddAppointmentPhoto(ctx context.Context, appointmentID uuid.UUID, slot, storageKey, url, caption string) (*hairappointments.AppointmentPhoto, error) {
	photo := &hairappointments.AppointmentPhoto{
		ID:         uuid.New(),
		Slot:       slot,
		StorageKey: storageKey,
		URL:        url,
		Caption:    caption,
	}
	f.photos = append(f.photos, *photo)
	return photo, nil
}

func (f *fakeAppointmentRepo) UpdateAppointmentSchedule(ctx context.Context, clientID, appointmentID uuid.UUID, date, startTime string) (*hairappointments.Appointment, error) {
	return &hairappointments.Appointment{
		ID:                  appointmentID,
		ClientID:            clientID,
		ServiceID:           f.portalDetail.ServiceID,
		Date:                date,
		StartTime:           startTime,
		DurationMinSnapshot: f.portalDetail.DurationMinSnapshot,
		Status:              f.portalDetail.Status,
		CreatedAt:           time.Now().UTC(),
		UpdatedAt:           time.Now().UTC(),
	}, nil
}

func (f *fakeAppointmentRepo) CancelAppointment(ctx context.Context, clientID, appointmentID uuid.UUID, reason string, cancelledAt time.Time) (*hairappointments.Appointment, error) {
	return &hairappointments.Appointment{
		ID:                  appointmentID,
		ClientID:            clientID,
		ServiceID:           f.portalDetail.ServiceID,
		Date:                f.portalDetail.Date,
		StartTime:           f.portalDetail.StartTime,
		DurationMinSnapshot: f.portalDetail.DurationMinSnapshot,
		Status:              "cancelled",
		CancelReason:        reason,
		CancelledAt:         &cancelledAt,
		CreatedAt:           time.Now().UTC(),
		UpdatedAt:           time.Now().UTC(),
	}, nil
}

func (f *fakeAppointmentRepo) GetMaintenancePlan(ctx context.Context, clientID uuid.UUID) (*hairappointments.MaintenancePlan, []hairappointments.MaintenancePlanItem, error) {
	return f.maintenance, f.maintenanceItems, nil
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

func TestHandlePatchMeUpdatesClient(t *testing.T) {
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

	request := httptest.NewRequest(http.MethodPatch, "/api/me", strings.NewReader(`{"name":"Mia Kovacs","scalp_notes":"Sensitive scalp"}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"name\":\"Mia Kovacs\"") {
		t.Fatalf("expected updated client name in response, got %s", recorder.Body.String())
	}
}

func TestHandlePatchNotificationPrefsUpdatesPrefs(t *testing.T) {
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

	request := httptest.NewRequest(http.MethodPatch, "/api/me/notification-prefs", strings.NewReader(`{"remind_2hr":false}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"remind_2hr\":false") {
		t.Fatalf("expected updated notification prefs in response, got %s", recorder.Body.String())
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
	if _, err := part.Write([]byte{0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n'}); err != nil {
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

func TestHandleIntakePhotoRejectsInvalidMimeType(t *testing.T) {
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
	_ = writer.WriteField("slot", "front")
	part, _ := writer.CreateFormFile("file", "notes.txt")
	_, _ = part.Write([]byte("plain text is not an image"))
	_ = writer.Close()

	intakeID := uuid.New()
	request := httptest.NewRequest(http.MethodPost, "/api/intake/"+intakeID.String()+"/photos", body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	request.SetPathValue("id", intakeID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"invalid-photo-file\"") {
		t.Fatalf("expected invalid-photo-file error, got %s", recorder.Body.String())
	}
}

func TestHandleAvailabilityReturnsSlots(t *testing.T) {
	serviceID := uuid.New()
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			service: &hairappointments.ServiceInfo{
				ID:          serviceID,
				Name:        "Extensions Consultation",
				DurationMin: 30,
				IsActive:    true,
			},
		}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/availability?month=2026-03&service_id="+serviceID.String(), nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"2026-03-02\"") {
		t.Fatalf("expected response body to include a March availability date, got %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "9:00 AM") {
		t.Fatalf("expected response body to include a time slot, got %s", recorder.Body.String())
	}
}

func TestHandleCreateAppointmentReturnsPendingAppointment(t *testing.T) {
	serviceID := uuid.New()
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			service: &hairappointments.ServiceInfo{
				ID:          serviceID,
				Name:        "Extensions Consultation",
				DurationMin: 30,
				IsActive:    true,
			},
			client: &hairappointments.Client{
				ID:    uuid.New(),
				Name:  "Mia Kovacs",
				Email: "mia@example.com",
			},
		}),
	})

	request := httptest.NewRequest(http.MethodPost, "/api/appointments", strings.NewReader(`{
		"service_id":"`+serviceID.String()+`",
		"date":"2026-03-02",
		"start_time":"10:00 AM",
		"client_name":"Mia Kovacs",
		"client_email":"mia@example.com"
	}`))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"status\":\"pending\"") {
		t.Fatalf("expected response body to include pending appointment status, got %s", recorder.Body.String())
	}
}

func TestHandleMyAppointmentsReturnsFilteredRows(t *testing.T) {
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			portalRows: []hairappointments.PortalAppointment{
				{Appointment: hairappointments.Appointment{ID: uuid.New(), ClientID: uuid.New(), ServiceID: uuid.New(), Date: "2026-03-25", StartTime: "10:00 AM", Status: "confirmed", DurationMinSnapshot: 30}, ServiceName: "Gloss / Toner"},
				{Appointment: hairappointments.Appointment{ID: uuid.New(), ClientID: uuid.New(), ServiceID: uuid.New(), Date: "2026-03-05", StartTime: "10:00 AM", Status: "completed", DurationMinSnapshot: 30}, ServiceName: "Gloss / Toner"},
			},
		}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me/appointments?status=upcoming", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"total\":1") {
		t.Fatalf("expected filtered total in response, got %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), "\"service_name\":\"Gloss / Toner\"") {
		t.Fatalf("expected appointment data in response, got %s", recorder.Body.String())
	}
}

func TestHandleMyAppointmentDetailReturnsServiceAndPhotos(t *testing.T) {
	appointmentID := uuid.New()
	serviceID := uuid.New()
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			portalDetail: &hairappointments.PortalAppointment{
				Appointment: hairappointments.Appointment{
					ID:                  appointmentID,
					ClientID:            uuid.New(),
					ServiceID:           serviceID,
					Date:                "2026-03-25",
					StartTime:           "10:00 AM",
					Status:              "confirmed",
					DurationMinSnapshot: 30,
				},
				ServiceName:     "Gloss / Toner",
				ServiceCategory: "color",
				PriceLow:        75,
				PriceHigh:       150,
			},
			photos: []hairappointments.AppointmentPhoto{{
				ID:  uuid.New(),
				URL: "http://127.0.0.1:8080/uploads/after.png",
			}},
		}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me/appointments/"+appointmentID.String(), nil)
	request.SetPathValue("id", appointmentID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"service\"") || !strings.Contains(recorder.Body.String(), "\"photos\"") {
		t.Fatalf("expected appointment detail response, got %s", recorder.Body.String())
	}
}

func TestHandleMyAppointmentRescheduleReturnsUpdatedAppointment(t *testing.T) {
	appointmentID := uuid.New()
	serviceID := uuid.New()
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			portalDetail: &hairappointments.PortalAppointment{
				Appointment: hairappointments.Appointment{
					ID:                  appointmentID,
					ClientID:            uuid.New(),
					ServiceID:           serviceID,
					Date:                "2026-03-25",
					StartTime:           "10:00 AM",
					Status:              "confirmed",
					DurationMinSnapshot: 30,
				},
				ServiceName: "Gloss / Toner",
			},
		}),
	})

	request := httptest.NewRequest(http.MethodPatch, "/api/me/appointments/"+appointmentID.String(), strings.NewReader(`{"date":"2026-03-30","start_time":"9:00 AM"}`))
	request.Header.Set("Content-Type", "application/json")
	request.SetPathValue("id", appointmentID.String())
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"appointment\"") {
		t.Fatalf("expected updated appointment response, got %s", recorder.Body.String())
	}
}

func TestHandleMyMaintenancePlanReturnsItems(t *testing.T) {
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
		AppointmentService: hairappointments.NewService(&fakeAppointmentRepo{
			maintenance: &hairappointments.MaintenancePlan{ID: uuid.New(), ClientID: uuid.New()},
			maintenanceItems: []hairappointments.MaintenancePlanItem{{
				ID:          uuid.New(),
				ServiceName: "Move-up",
				DueDate:     "2026-03-24",
				Status:      "next",
			}},
		}),
	})

	request := httptest.NewRequest(http.MethodGet, "/api/me/maintenance-plan", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "\"items\"") || !strings.Contains(recorder.Body.String(), "Move-up") {
		t.Fatalf("expected maintenance plan payload, got %s", recorder.Body.String())
	}
}
