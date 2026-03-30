package server

import (
	"net/http"

	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
)

type stylistMeResponse struct {
	Stylist hairauth.UserInfo `json:"stylist"`
}

func (h *appHandler) currentStylist(r *http.Request) (*hairauth.UserInfo, int, *apiError) {
	claims, ok := h.currentClaims(r)
	if !ok {
		return nil, http.StatusUnauthorized, &apiError{
			Code:    "not-authenticated",
			Message: "No active browser session was found.",
		}
	}

	if h.stylistAuthorizer == nil || !h.stylistAuthorizer.IsAuthorized(claims) {
		return nil, http.StatusForbidden, &apiError{
			Code:    "not-stylist",
			Message: "This account does not have stylist access.",
		}
	}

	user := claims.UserInfo(h.authSettings.Mode)
	return &user, http.StatusOK, nil
}

func (h *appHandler) handleStylistMe(w http.ResponseWriter, r *http.Request) {
	stylistUser, status, apiErr := h.currentStylist(r)
	if apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistMeResponse{
		Stylist: *stylistUser,
	}})
}
