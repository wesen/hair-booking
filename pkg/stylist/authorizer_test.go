package stylist

import (
	"testing"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
)

func TestAuthorizerAllowsDevMode(t *testing.T) {
	authorizer := NewAuthorizer(&hairauth.Settings{Mode: hairauth.AuthModeDev})
	if !authorizer.IsAuthorized(&hairauth.SessionClaims{Subject: "local-user"}) {
		t.Fatal("expected dev-mode authorizer to allow stylist access")
	}
}

func TestAuthorizerAllowsConfiguredEmail(t *testing.T) {
	authorizer := NewAuthorizer(&hairauth.Settings{
		Mode:                 hairauth.AuthModeOIDC,
		StylistAllowedEmails: []string{"alice@example.com"},
	})
	if !authorizer.IsAuthorized(&hairauth.SessionClaims{Email: "Alice@Example.com"}) {
		t.Fatal("expected configured email to be authorized")
	}
}

func TestAuthorizerAllowsConfiguredSubject(t *testing.T) {
	authorizer := NewAuthorizer(&hairauth.Settings{
		Mode:                   hairauth.AuthModeOIDC,
		StylistAllowedSubjects: []string{"abc-123"},
	})
	if !authorizer.IsAuthorized(&hairauth.SessionClaims{Subject: "abc-123"}) {
		t.Fatal("expected configured subject to be authorized")
	}
}

func TestAuthorizerRejectsUnconfiguredOIDCUser(t *testing.T) {
	authorizer := NewAuthorizer(&hairauth.Settings{
		Mode:                 hairauth.AuthModeOIDC,
		StylistAllowedEmails: []string{"alice@example.com"},
	})
	if authorizer.IsAuthorized(&hairauth.SessionClaims{Email: "bob@example.com"}) {
		t.Fatal("expected unconfigured oidc user to be rejected")
	}
}
