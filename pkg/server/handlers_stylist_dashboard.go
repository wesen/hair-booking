package server

import (
	"errors"
	"net/http"

	hairstylist "github.com/go-go-golems/hair-booking/pkg/stylist"
)

type stylistDashboardResponse struct {
	Dashboard *hairstylist.Dashboard `json:"dashboard"`
}

func (h *appHandler) handleStylistDashboard(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	dashboard, err := h.stylistService.Dashboard(r.Context())
	if err != nil {
		switch {
		case errors.Is(err, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-stylist-dashboard-query", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-dashboard-load-failed", "Failed to load the stylist dashboard.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistDashboardResponse{Dashboard: dashboard}})
}
