package server

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	hairappointments "github.com/go-go-golems/hair-booking/pkg/appointments"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	"github.com/google/uuid"
)

type portalAppointmentsResponse struct {
	Appointments []hairappointments.PortalAppointment `json:"appointments"`
	Total        int                                  `json:"total"`
}

type portalAppointmentDetailResponse struct {
	Appointment *hairappointments.PortalAppointment `json:"appointment"`
	Service     *hairappointments.ServiceInfo       `json:"service"`
	Photos      []hairappointments.AppointmentPhoto `json:"photos"`
}

type portalAppointmentUpdateRequest struct {
	Date      string `json:"date"`
	StartTime string `json:"start_time"`
}

type portalAppointmentCancelRequest struct {
	Reason string `json:"reason"`
}

type maintenancePlanResponse struct {
	Plan  *hairappointments.MaintenancePlan      `json:"plan"`
	Items []hairappointments.MaintenancePlanItem `json:"items"`
}

func (h *appHandler) currentClient(r *http.Request) (*hairclients.Client, error) {
	if h.clientService == nil {
		return nil, errors.New("client service is not configured")
	}
	identity, ok := h.currentIdentity(r)
	if !ok {
		return nil, nil
	}
	client, _, err := h.clientService.EnsureAuthenticatedClient(r.Context(), identity)
	if err != nil {
		return nil, err
	}
	return client, nil
}

func (h *appHandler) handleMyAppointments(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}
	client, err := h.currentClient(r)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}
	if client == nil {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}

	limit, _ := strconv.Atoi(strings.TrimSpace(r.URL.Query().Get("limit")))
	offset, _ := strconv.Atoi(strings.TrimSpace(r.URL.Query().Get("offset")))
	appointments, total, err := h.appointmentService.ListClientAppointments(r.Context(), client.ID, hairappointments.AppointmentListFilter{
		Status: r.URL.Query().Get("status"),
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment-query", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "appointment-query-failed", "Failed to load appointments.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: portalAppointmentsResponse{
		Appointments: appointments,
		Total:        total,
	}})
}

func (h *appHandler) handleMyAppointmentDetail(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}
	client, err := h.currentClient(r)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}
	if client == nil {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}

	appointmentID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", "Appointment ID must be a valid UUID.")
		return
	}

	appointment, service, photos, err := h.appointmentService.GetClientAppointmentDetail(r.Context(), client.ID, appointmentID)
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "appointment-not-found", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "appointment-query-failed", "Failed to load appointment detail.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: portalAppointmentDetailResponse{
		Appointment: appointment,
		Service:     service,
		Photos:      photos,
	}})
}

func (h *appHandler) handleMyAppointmentReschedule(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}
	client, err := h.currentClient(r)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}
	if client == nil {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}

	appointmentID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", "Appointment ID must be a valid UUID.")
		return
	}

	request := portalAppointmentUpdateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	appointment, err := h.appointmentService.RescheduleClientAppointment(r.Context(), client.ID, appointmentID, request.Date, request.StartTime)
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment-update", err.Error())
		case errors.Is(err, hairappointments.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "appointment-not-found", err.Error())
		case errors.Is(err, hairappointments.ErrSlotUnavailable):
			writeAPIError(w, http.StatusConflict, "slot-unavailable", err.Error())
		case errors.Is(err, hairappointments.ErrPolicyViolation):
			writeAPIError(w, http.StatusConflict, "policy-violation", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "appointment-update-failed", "Failed to update appointment.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: map[string]*hairappointments.Appointment{"appointment": appointment}})
}

func (h *appHandler) handleMyAppointmentCancel(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}
	client, err := h.currentClient(r)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}
	if client == nil {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}

	appointmentID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-appointment-id", "Appointment ID must be a valid UUID.")
		return
	}

	request := portalAppointmentCancelRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil && !errors.Is(err, io.EOF) {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	appointment, err := h.appointmentService.CancelClientAppointment(r.Context(), client.ID, appointmentID, request.Reason)
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "appointment-not-found", err.Error())
		case errors.Is(err, hairappointments.ErrPolicyViolation):
			writeAPIError(w, http.StatusConflict, "policy-violation", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "appointment-cancel-failed", "Failed to cancel appointment.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: map[string]*hairappointments.Appointment{"appointment": appointment}})
}

func (h *appHandler) handleMyMaintenancePlan(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}
	client, err := h.currentClient(r)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "client-bootstrap-failed", "Failed to load the authenticated client profile.")
		return
	}
	if client == nil {
		writeAPIError(w, http.StatusUnauthorized, "not-authenticated", "No active browser session was found.")
		return
	}

	plan, items, err := h.appointmentService.GetMaintenancePlan(r.Context(), client.ID)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "maintenance-query-failed", "Failed to load maintenance plan.")
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: maintenancePlanResponse{
		Plan:  plan,
		Items: items,
	}})
}
