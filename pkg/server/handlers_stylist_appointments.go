package server

import (
	"encoding/json"
	"errors"
	"net/http"

	hairstylist "github.com/go-go-golems/hair-booking/pkg/stylist"
	"github.com/google/uuid"
)

type stylistAppointmentsResponse struct {
	Appointments []hairstylist.Appointment `json:"appointments"`
}

type stylistAppointmentDetailResponse struct {
	Appointment *hairstylist.AppointmentDetail `json:"appointment"`
}

type stylistAppointmentUpdateResponse struct {
	Appointment *hairstylist.Appointment `json:"appointment"`
}

type stylistAppointmentUpdateRequest struct {
	Status       *string `json:"status"`
	PrepNotes    *string `json:"prep_notes"`
	StylistNotes *string `json:"stylist_notes"`
}

func (h *appHandler) handleStylistAppointments(w http.ResponseWriter, r *http.Request) {
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

	items, serviceErr := h.stylistService.ListAppointments(r.Context(), hairstylist.AppointmentListFilter{
		Status: r.URL.Query().Get("status"),
		Limit:  limit,
		Offset: offset,
	})
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment-query", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-appointment-query-failed", "Failed to load stylist appointments.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistAppointmentsResponse{Appointments: items}})
}

func (h *appHandler) handleStylistAppointmentDetail(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	appointmentID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", "Appointment ID must be a valid UUID.")
		return
	}

	detail, serviceErr := h.stylistService.GetAppointment(r.Context(), appointmentID)
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", serviceErr.Error())
		case errors.Is(serviceErr, hairstylist.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "stylist-appointment-not-found", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-appointment-load-failed", "Failed to load the stylist appointment detail.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistAppointmentDetailResponse{Appointment: detail}})
}

func (h *appHandler) handleStylistAppointmentUpdate(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	appointmentID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", "Appointment ID must be a valid UUID.")
		return
	}

	request := stylistAppointmentUpdateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	appointment, serviceErr := h.stylistService.UpdateAppointment(r.Context(), appointmentID, hairstylist.AppointmentUpdate{
		Status:       request.Status,
		PrepNotes:    request.PrepNotes,
		StylistNotes: request.StylistNotes,
	})
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment-update", serviceErr.Error())
		case errors.Is(serviceErr, hairstylist.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "stylist-appointment-not-found", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-appointment-update-failed", "Failed to update the stylist appointment.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistAppointmentUpdateResponse{Appointment: appointment}})
}
