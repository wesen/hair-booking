package auth

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"golang.org/x/oauth2"
)

func TestPKCES256Challenge(t *testing.T) {
	got := pkceS256Challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")
	want := "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
	if got != want {
		t.Fatalf("pkceS256Challenge() = %q, want %q", got, want)
	}
}

func TestResolveRequestedRedirectAllowsRelativePath(t *testing.T) {
	authenticator := &OIDCAuthenticator{}
	request := httptest.NewRequest("GET", "http://127.0.0.1:8080/auth/login?return_to=%2Fportal", nil)

	redirect, err := authenticator.resolveRequestedRedirect(request, "/portal")
	if err != nil {
		t.Fatalf("resolveRequestedRedirect returned error: %v", err)
	}
	if redirect != "/portal" {
		t.Fatalf("expected /portal, got %q", redirect)
	}
}

func TestResolveRequestedRedirectRejectsSchemeRelativePath(t *testing.T) {
	authenticator := &OIDCAuthenticator{}
	request := httptest.NewRequest("GET", "http://127.0.0.1:8080/auth/login", nil)

	for _, value := range []string{"//evil.example.com/portal", "/\\evil.example.com/portal"} {
		if _, err := authenticator.resolveRequestedRedirect(request, value); err == nil {
			t.Fatalf("expected resolveRequestedRedirect to reject %q", value)
		}
	}
}

func TestResolveRequestedRedirectAllowsSameHostDifferentPort(t *testing.T) {
	authenticator := &OIDCAuthenticator{}
	authenticator.oauthConfig.RedirectURL = "http://127.0.0.1:8080/auth/callback"
	request := httptest.NewRequest("GET", "http://127.0.0.1:8080/auth/login", nil)

	redirect, err := authenticator.resolveRequestedRedirect(request, "http://127.0.0.1:5175/portal")
	if err != nil {
		t.Fatalf("resolveRequestedRedirect returned error: %v", err)
	}
	if redirect != "http://127.0.0.1:5175/portal" {
		t.Fatalf("unexpected redirect target %q", redirect)
	}
}

func TestResolveRequestedRedirectRejectsDifferentHost(t *testing.T) {
	authenticator := &OIDCAuthenticator{}
	authenticator.oauthConfig.RedirectURL = "http://127.0.0.1:8080/auth/callback"
	request := httptest.NewRequest("GET", "http://127.0.0.1:8080/auth/login", nil)

	if _, err := authenticator.resolveRequestedRedirect(request, "https://evil.example.com/portal"); err == nil {
		t.Fatal("expected resolveRequestedRedirect to reject different host")
	}
}

func TestBuildLogoutCallbackURLUsesBackendHostWithoutQuery(t *testing.T) {
	redirectURL, err := buildLogoutCallbackURL("http://127.0.0.1:8080/auth/callback")
	if err != nil {
		t.Fatalf("buildLogoutCallbackURL returned error: %v", err)
	}
	if redirectURL != "http://127.0.0.1:8080/auth/logout/callback" {
		t.Fatalf("expected backend logout callback redirect, got %q", redirectURL)
	}
}

func TestHandleLogoutSetsCookieAndUsesPlainCallbackRedirect(t *testing.T) {
	authenticator := &OIDCAuthenticator{
		oauthConfig: oauth2.Config{
			RedirectURL: "https://hair-booking.app.scapegoat.dev/auth/callback",
		},
		discovery: oidcDiscoveryDocument{
			EndSessionEndpoint: "https://auth.example.com/realms/hair-booking/protocol/openid-connect/logout",
		},
		settings: &Settings{
			OIDCClientID: "hair-booking-web",
		},
		sessions: &SessionManager{
			cookieName:  "hair_booking_session",
			redirectURL: "https://hair-booking.app.scapegoat.dev/auth/callback",
			secret:      []byte("test-secret"),
		},
		postLoginPath: "/",
	}

	request := httptest.NewRequest(http.MethodGet, "https://hair-booking.app.scapegoat.dev/auth/logout?return_to=%2Fportal", nil)
	recorder := httptest.NewRecorder()

	authenticator.HandleLogout(recorder, request)

	response := recorder.Result()
	if response.StatusCode != http.StatusSeeOther {
		t.Fatalf("expected 303, got %d", response.StatusCode)
	}

	location := response.Header.Get("Location")
	expected := "https://auth.example.com/realms/hair-booking/protocol/openid-connect/logout?client_id=hair-booking-web&post_logout_redirect_uri=https%3A%2F%2Fhair-booking.app.scapegoat.dev%2Fauth%2Flogout%2Fcallback"
	if location != expected {
		t.Fatalf("unexpected logout redirect location %q", location)
	}

	foundLogoutCookie := false
	for _, cookie := range response.Cookies() {
		if cookie.Name == logoutReturnCookieName {
			foundLogoutCookie = true
			if cookie.Value != "/portal" {
				t.Fatalf("expected logout return cookie to preserve /portal, got %q", cookie.Value)
			}
		}
	}
	if !foundLogoutCookie {
		t.Fatal("expected logout return cookie to be set")
	}
}

func TestHandleLogoutCallbackUsesCookieReturnToAndClearsCookie(t *testing.T) {
	authenticator := &OIDCAuthenticator{
		oauthConfig: oauth2.Config{
			RedirectURL: "https://hair-booking.app.scapegoat.dev/auth/callback",
		},
		postLoginPath: "/",
	}

	request := httptest.NewRequest(http.MethodGet, "https://hair-booking.app.scapegoat.dev/auth/logout/callback", nil)
	request.AddCookie(&http.Cookie{
		Name:  logoutReturnCookieName,
		Value: "/portal",
		Path:  "/",
	})
	recorder := httptest.NewRecorder()

	authenticator.HandleLogoutCallback(recorder, request)

	response := recorder.Result()
	if response.StatusCode != http.StatusSeeOther {
		t.Fatalf("expected 303, got %d", response.StatusCode)
	}
	if location := response.Header.Get("Location"); location != "/portal" {
		t.Fatalf("expected redirect to /portal, got %q", location)
	}

	foundClearedCookie := false
	for _, cookie := range response.Cookies() {
		if cookie.Name == logoutReturnCookieName {
			foundClearedCookie = true
			if cookie.MaxAge != -1 {
				t.Fatalf("expected cleared logout return cookie, got MaxAge=%d", cookie.MaxAge)
			}
		}
	}
	if !foundClearedCookie {
		t.Fatal("expected logout return cookie to be cleared")
	}
}

func TestOAuthStateRoundTripPreservesReturnTo(t *testing.T) {
	value, err := marshalOAuthState(oauthStatePayload{
		ID:       "state-123",
		ReturnTo: "http://127.0.0.1:5175/stylist",
	})
	if err != nil {
		t.Fatalf("marshalOAuthState returned error: %v", err)
	}

	payload, err := unmarshalOAuthState(value)
	if err != nil {
		t.Fatalf("unmarshalOAuthState returned error: %v", err)
	}
	if payload.ID != "state-123" {
		t.Fatalf("expected state id to round-trip, got %q", payload.ID)
	}
	if payload.ReturnTo != "http://127.0.0.1:5175/stylist" {
		t.Fatalf("expected return_to to round-trip, got %q", payload.ReturnTo)
	}
}

func TestUnmarshalOAuthStateRejectsMissingID(t *testing.T) {
	raw, err := json.Marshal(oauthStatePayload{ReturnTo: "/portal"})
	if err != nil {
		t.Fatalf("json.Marshal returned error: %v", err)
	}

	value := base64.RawURLEncoding.EncodeToString(raw)
	if _, err := unmarshalOAuthState(value); err == nil {
		t.Fatal("expected unmarshalOAuthState to reject missing state id")
	}
}
