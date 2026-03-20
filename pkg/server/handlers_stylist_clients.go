package server

import (
	"errors"
	"net/http"

	hairstylist "github.com/go-go-golems/hair-booking/pkg/stylist"
	"github.com/google/uuid"
)

type stylistClientsResponse struct {
	Clients []hairstylist.ClientListItem `json:"clients"`
}

type stylistClientDetailResponse struct {
	Client *hairstylist.ClientDetail `json:"client"`
}

func (h *appHandler) handleStylistClients(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	limit, offset, err := parseListPagination(r)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-pagination", err.Error())
		return
	}

	clients, serviceErr := h.stylistService.ListClients(r.Context(), hairstylist.ClientListFilter{
		Search: r.URL.Query().Get("search"),
		Limit:  limit,
		Offset: offset,
	})
	if serviceErr != nil {
		writeAPIError(w, http.StatusInternalServerError, "stylist-client-query-failed", "Failed to load stylist clients.")
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistClientsResponse{Clients: clients}})
}

func (h *appHandler) handleStylistClientDetail(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	clientID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-client-id", "Client ID must be a valid UUID.")
		return
	}

	client, serviceErr := h.stylistService.GetClient(r.Context(), clientID)
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-client-id", serviceErr.Error())
		case errors.Is(serviceErr, hairstylist.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "stylist-client-not-found", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-client-load-failed", "Failed to load stylist client detail.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistClientDetailResponse{Client: client}})
}
