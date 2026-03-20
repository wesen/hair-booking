package server

import (
	"net/http"

	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
)

type servicesResponse struct {
	Services []hairservices.CatalogItem `json:"services"`
}

func (h *appHandler) handleServices(w http.ResponseWriter, r *http.Request) {
	if h.catalogService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Service catalog is not configured.")
		return
	}

	items, err := h.catalogService.ListActive(r.Context(), r.URL.Query().Get("category"))
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "service-query-failed", "Failed to load services.")
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: servicesResponse{Services: items}})
}
