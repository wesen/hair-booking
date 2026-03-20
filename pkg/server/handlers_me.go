package server

import (
	"net/http"
	"time"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	"github.com/go-go-golems/hair-booking/pkg/clients"
)

type meResponse struct {
	Client            *clients.Client            `json:"client"`
	NotificationPrefs *clients.NotificationPrefs `json:"notification_prefs"`
}

func (h *appHandler) handleMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.currentClaims(r)
	if !ok {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}
	if h.clientService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Client service is not configured.")
		return
	}

	client, prefs, err := h.clientService.EnsureAuthenticatedClient(r.Context(), clients.AuthenticatedIdentity{
		Issuer:      claims.Issuer,
		Subject:     claims.Subject,
		Email:       claims.Email,
		DisplayName: claims.DisplayName,
	})
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: meResponse{
		Client:            client,
		NotificationPrefs: prefs,
	}})
}

func (h *appHandler) currentClaims(r *http.Request) (*hairauth.SessionClaims, bool) {
	switch h.authSettings.Mode {
	case hairauth.AuthModeDev:
		return &hairauth.SessionClaims{
			Issuer:            "dev",
			Subject:           h.authSettings.DevUserID,
			PreferredUsername: h.authSettings.DevUserID,
			DisplayName:       "Development User",
			IssuedAt:          timeNowUTC(),
			ExpiresAt:         timeNowUTC().Add(24 * time.Hour),
		}, true
	case hairauth.AuthModeOIDC:
		if h.sessionManager == nil {
			return nil, false
		}
		claims, err := h.sessionManager.ReadSession(r)
		if err != nil {
			return nil, false
		}
		return claims, true
	default:
		return nil, false
	}
}
