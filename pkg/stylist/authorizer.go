package stylist

import (
	"strings"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
)

type Authorizer struct {
	authMode        string
	allowedEmails   map[string]struct{}
	allowedSubjects map[string]struct{}
}

func NewAuthorizer(settings *hairauth.Settings) *Authorizer {
	authorizer := &Authorizer{
		allowedEmails:   map[string]struct{}{},
		allowedSubjects: map[string]struct{}{},
	}
	if settings == nil {
		return authorizer
	}

	authorizer.authMode = strings.TrimSpace(settings.Mode)
	for _, email := range settings.StylistAllowedEmails {
		if normalized := normalizeValue(email); normalized != "" {
			authorizer.allowedEmails[normalized] = struct{}{}
		}
	}
	for _, subject := range settings.StylistAllowedSubjects {
		if normalized := normalizeValue(subject); normalized != "" {
			authorizer.allowedSubjects[normalized] = struct{}{}
		}
	}
	return authorizer
}

func (a *Authorizer) IsAuthorized(claims *hairauth.SessionClaims) bool {
	if claims == nil {
		return false
	}
	if a.authMode == hairauth.AuthModeDev {
		return true
	}

	email := normalizeValue(claims.Email)
	if email != "" {
		if _, ok := a.allowedEmails[email]; ok {
			return true
		}
	}

	subject := normalizeValue(claims.Subject)
	if subject != "" {
		if _, ok := a.allowedSubjects[subject]; ok {
			return true
		}
	}

	return false
}

func normalizeValue(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}
