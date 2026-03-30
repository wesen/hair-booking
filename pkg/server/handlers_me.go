package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	"github.com/go-go-golems/hair-booking/pkg/clients"
)

type meResponse struct {
	Client            *clients.Client            `json:"client"`
	NotificationPrefs *clients.NotificationPrefs `json:"notification_prefs"`
}

type meUpdateRequest struct {
	Name       *string `json:"name"`
	Email      *string `json:"email"`
	Phone      *string `json:"phone"`
	ScalpNotes *string `json:"scalp_notes"`
}

type notificationPrefsUpdateRequest struct {
	Remind48hr  *bool `json:"remind_48hr"`
	Remind2hr   *bool `json:"remind_2hr"`
	MaintAlerts *bool `json:"maint_alerts"`
}

func (h *appHandler) handleMe(w http.ResponseWriter, r *http.Request) {
	identity, ok := h.currentIdentity(r)
	if !ok {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}
	if h.clientService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Client service is not configured.")
		return
	}
	client, prefs, err := h.clientService.EnsureAuthenticatedClient(r.Context(), identity)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: meResponse{
		Client:            client,
		NotificationPrefs: prefs,
	}})
}

func (h *appHandler) handlePatchMe(w http.ResponseWriter, r *http.Request) {
	identity, ok := h.currentIdentity(r)
	if !ok {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}
	if h.clientService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Client service is not configured.")
		return
	}

	request := meUpdateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	client, err := h.clientService.UpdateAuthenticatedProfile(r.Context(), identity, clients.ProfileUpdate{
		Name:       request.Name,
		Email:      request.Email,
		Phone:      request.Phone,
		ScalpNotes: request.ScalpNotes,
	})
	if err != nil {
		switch {
		case errors.Is(err, clients.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-profile-update", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "profile-update-failed", "Failed to update the client profile.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: map[string]*clients.Client{"client": client}})
}

func (h *appHandler) handlePatchNotificationPrefs(w http.ResponseWriter, r *http.Request) {
	identity, ok := h.currentIdentity(r)
	if !ok {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}
	if h.clientService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Client service is not configured.")
		return
	}

	request := notificationPrefsUpdateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	prefs, err := h.clientService.UpdateAuthenticatedNotificationPrefs(r.Context(), identity, clients.NotificationPrefsUpdate{
		Remind48hr:  request.Remind48hr,
		Remind2hr:   request.Remind2hr,
		MaintAlerts: request.MaintAlerts,
	})
	if err != nil {
		switch {
		case errors.Is(err, clients.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-notification-update", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "notification-update-failed", "Failed to update notification preferences.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: map[string]*clients.NotificationPrefs{"notification_prefs": prefs}})
}

func (h *appHandler) currentIdentity(r *http.Request) (clients.AuthenticatedIdentity, bool) {
	claims, ok := h.currentClaims(r)
	if !ok {
		return clients.AuthenticatedIdentity{}, false
	}

	return clients.AuthenticatedIdentity{
		Issuer:      claims.Issuer,
		Subject:     claims.Subject,
		Email:       claims.Email,
		DisplayName: claims.DisplayName,
	}, true
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
