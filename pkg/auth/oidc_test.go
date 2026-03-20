package auth

import (
	"net/http/httptest"
	"testing"
)

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

func TestDerivePostLogoutRedirectURLUsesFallback(t *testing.T) {
	redirectURL, err := derivePostLogoutRedirectURL("http://127.0.0.1:8080/auth/callback", "http://127.0.0.1:5175/")
	if err != nil {
		t.Fatalf("derivePostLogoutRedirectURL returned error: %v", err)
	}
	if redirectURL != "http://127.0.0.1:5175/" {
		t.Fatalf("expected fallback redirect, got %q", redirectURL)
	}
}
