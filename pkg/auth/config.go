package auth

import (
	"os"
	"strings"

	"github.com/go-go-golems/glazed/pkg/cmds/fields"
	"github.com/go-go-golems/glazed/pkg/cmds/schema"
	"github.com/go-go-golems/glazed/pkg/cmds/values"
	"github.com/pkg/errors"
)

const (
	AuthSectionSlug          = "auth"
	AuthModeDev              = "dev"
	AuthModeOIDC             = "oidc"
	DefaultSessionCookieName = "hair_booking_session"
)

type Settings struct {
	Mode                   string   `glazed:"auth-mode"`
	DevUserID              string   `glazed:"auth-dev-user-id"`
	SessionCookieName      string   `glazed:"auth-session-cookie-name"`
	SessionSecret          string   `glazed:"auth-session-secret"`
	OIDCIssuerURL          string   `glazed:"oidc-issuer-url"`
	OIDCClientID           string   `glazed:"oidc-client-id"`
	OIDCClientSecret       string   `glazed:"oidc-client-secret"`
	OIDCRedirectURL        string   `glazed:"oidc-redirect-url"`
	OIDCScopes             []string `glazed:"oidc-scopes"`
	StylistAllowedEmails   []string `glazed:"stylist-allowed-emails"`
	StylistAllowedSubjects []string `glazed:"stylist-allowed-subjects"`
}

type UserInfo struct {
	Authenticated     bool     `json:"authenticated"`
	AuthMode          string   `json:"authMode"`
	Issuer            string   `json:"issuer,omitempty"`
	Subject           string   `json:"subject,omitempty"`
	Email             string   `json:"email,omitempty"`
	EmailVerified     bool     `json:"emailVerified,omitempty"`
	PreferredUsername string   `json:"preferredUsername,omitempty"`
	DisplayName       string   `json:"displayName,omitempty"`
	Picture           string   `json:"picture,omitempty"`
	Scopes            []string `json:"scopes,omitempty"`
	SessionExpiresAt  string   `json:"sessionExpiresAt,omitempty"`
}

func NewSection() (schema.Section, error) {
	return schema.NewSection(
		AuthSectionSlug,
		"Authentication Settings",
		schema.WithFields(
			fields.New(
				"auth-mode",
				fields.TypeChoice,
				fields.WithChoices(AuthModeDev, AuthModeOIDC),
				fields.WithHelp("Authentication mode for the website"),
				fields.WithDefault(envOr("HAIR_BOOKING_AUTH_MODE", AuthModeOIDC)),
			),
			fields.New(
				"auth-dev-user-id",
				fields.TypeString,
				fields.WithHelp("Development user ID returned by /api/me in auth-mode=dev"),
				fields.WithDefault(envOr("HAIR_BOOKING_AUTH_DEV_USER_ID", "local-user")),
			),
			fields.New(
				"auth-session-cookie-name",
				fields.TypeString,
				fields.WithHelp("Cookie name used for browser sessions"),
				fields.WithDefault(envOr("HAIR_BOOKING_AUTH_SESSION_COOKIE_NAME", DefaultSessionCookieName)),
			),
			fields.New(
				"auth-session-secret",
				fields.TypeString,
				fields.WithHelp("HMAC secret used to sign browser session cookies"),
				fields.WithDefault(strings.TrimSpace(os.Getenv("HAIR_BOOKING_AUTH_SESSION_SECRET"))),
			),
			fields.New(
				"oidc-issuer-url",
				fields.TypeString,
				fields.WithHelp("OIDC issuer URL exposed by Keycloak"),
				fields.WithDefault(strings.TrimSpace(os.Getenv("HAIR_BOOKING_OIDC_ISSUER_URL"))),
			),
			fields.New(
				"oidc-client-id",
				fields.TypeString,
				fields.WithHelp("OIDC client ID for the hair-booking web app"),
				fields.WithDefault(strings.TrimSpace(os.Getenv("HAIR_BOOKING_OIDC_CLIENT_ID"))),
			),
			fields.New(
				"oidc-client-secret",
				fields.TypeString,
				fields.WithHelp("OIDC client secret for confidential clients"),
				fields.WithDefault(strings.TrimSpace(os.Getenv("HAIR_BOOKING_OIDC_CLIENT_SECRET"))),
			),
			fields.New(
				"oidc-redirect-url",
				fields.TypeString,
				fields.WithHelp("Redirect URL handled by this app after Keycloak login"),
				fields.WithDefault(envOr("HAIR_BOOKING_OIDC_REDIRECT_URL", "http://127.0.0.1:8080/auth/callback")),
			),
			fields.New(
				"oidc-scopes",
				fields.TypeStringList,
				fields.WithHelp("Scopes requested during browser login"),
				fields.WithDefault([]string{"openid", "profile", "email"}),
			),
			fields.New(
				"stylist-allowed-emails",
				fields.TypeStringList,
				fields.WithHelp("Email allowlist for single-stylist access in OIDC mode"),
				fields.WithDefault(splitCSV(os.Getenv("HAIR_BOOKING_STYLIST_ALLOWED_EMAILS"))),
			),
			fields.New(
				"stylist-allowed-subjects",
				fields.TypeStringList,
				fields.WithHelp("Subject allowlist for single-stylist access in OIDC mode"),
				fields.WithDefault(splitCSV(os.Getenv("HAIR_BOOKING_STYLIST_ALLOWED_SUBJECTS"))),
			),
		),
	)
}

func LoadSettingsFromParsedValues(parsedValues *values.Values) (*Settings, error) {
	if parsedValues == nil {
		return nil, errors.New("parsed values are nil")
	}

	settings := &Settings{}
	if err := parsedValues.DecodeSectionInto(AuthSectionSlug, settings); err != nil {
		return nil, errors.Wrap(err, "failed to decode auth section")
	}

	settings.Mode = normalizeMode(settings.Mode)
	settings.DevUserID = strings.TrimSpace(settings.DevUserID)
	if settings.DevUserID == "" {
		settings.DevUserID = "local-user"
	}
	settings.SessionCookieName = strings.TrimSpace(settings.SessionCookieName)
	if settings.SessionCookieName == "" {
		settings.SessionCookieName = DefaultSessionCookieName
	}
	settings.SessionSecret = strings.TrimSpace(settings.SessionSecret)
	settings.OIDCIssuerURL = strings.TrimSpace(settings.OIDCIssuerURL)
	settings.OIDCClientID = strings.TrimSpace(settings.OIDCClientID)
	settings.OIDCClientSecret = strings.TrimSpace(settings.OIDCClientSecret)
	settings.OIDCRedirectURL = strings.TrimSpace(settings.OIDCRedirectURL)
	settings.OIDCScopes = compact(settings.OIDCScopes)
	settings.StylistAllowedEmails = compact(settings.StylistAllowedEmails)
	settings.StylistAllowedSubjects = compact(settings.StylistAllowedSubjects)

	if settings.Mode == AuthModeOIDC {
		if settings.SessionSecret == "" {
			return nil, errors.New("auth-session-secret is required when auth-mode=oidc")
		}
		if settings.OIDCIssuerURL == "" {
			return nil, errors.New("oidc-issuer-url is required when auth-mode=oidc")
		}
		if settings.OIDCClientID == "" {
			return nil, errors.New("oidc-client-id is required when auth-mode=oidc")
		}
		if settings.OIDCRedirectURL == "" {
			return nil, errors.New("oidc-redirect-url is required when auth-mode=oidc")
		}
	}

	return settings, nil
}

func normalizeMode(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case AuthModeDev:
		return AuthModeDev
	case AuthModeOIDC:
		return AuthModeOIDC
	default:
		return AuthModeOIDC
	}
}

func envOr(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func compact(values []string) []string {
	ret := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		ret = append(ret, value)
	}
	return ret
}

func splitCSV(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return compact(strings.Split(value, ","))
}
