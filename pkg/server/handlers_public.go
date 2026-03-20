package server

import (
	"encoding/json"
	"errors"
	"net/http"

	hairappointments "github.com/go-go-golems/hair-booking/pkg/appointments"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
	hairservices "github.com/go-go-golems/hair-booking/pkg/services"
	"github.com/google/uuid"
)

type servicesResponse struct {
	Services []hairservices.CatalogItem `json:"services"`
}

type intakeCreateRequest struct {
	ServiceType     string   `json:"service_type"`
	HairLength      string   `json:"hair_length"`
	HairDensity     string   `json:"hair_density"`
	HairTexture     string   `json:"hair_texture"`
	PrevExtensions  string   `json:"prev_extensions"`
	ColorService    string   `json:"color_service"`
	NaturalLevel    string   `json:"natural_level"`
	CurrentColor    string   `json:"current_color"`
	ChemicalHistory []string `json:"chemical_history"`
	LastChemical    string   `json:"last_chemical"`
	DesiredLength   int      `json:"desired_length"`
	ExtType         string   `json:"ext_type"`
	Budget          string   `json:"budget"`
	Maintenance     string   `json:"maintenance"`
	Deadline        string   `json:"deadline"`
	DreamResult     string   `json:"dream_result"`
}

type intakeCreateResponse struct {
	ID           uuid.UUID `json:"id"`
	EstimateLow  int       `json:"estimate_low"`
	EstimateHigh int       `json:"estimate_high"`
}

type intakePhotoResponse struct {
	ID  uuid.UUID `json:"id"`
	URL string    `json:"url"`
}

type availabilityResponse struct {
	Availability map[string][]string `json:"availability"`
}

type appointmentCreateRequest struct {
	IntakeID    string `json:"intake_id"`
	ServiceID   string `json:"service_id"`
	Date        string `json:"date"`
	StartTime   string `json:"start_time"`
	ClientName  string `json:"client_name"`
	ClientEmail string `json:"client_email"`
	ClientPhone string `json:"client_phone"`
}

type appointmentCreateResponse struct {
	Appointment *hairappointments.Appointment `json:"appointment"`
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

func (h *appHandler) handleIntake(w http.ResponseWriter, r *http.Request) {
	if h.intakeService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Intake service is not configured.")
		return
	}

	request := intakeCreateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	submission, err := h.intakeService.CreateSubmission(r.Context(), hairintake.Submission{
		ServiceType:     request.ServiceType,
		HairLength:      request.HairLength,
		HairDensity:     request.HairDensity,
		HairTexture:     request.HairTexture,
		PrevExtensions:  request.PrevExtensions,
		ColorService:    request.ColorService,
		NaturalLevel:    request.NaturalLevel,
		CurrentColor:    request.CurrentColor,
		ChemicalHistory: request.ChemicalHistory,
		LastChemical:    request.LastChemical,
		DesiredLength:   request.DesiredLength,
		ExtType:         request.ExtType,
		Budget:          request.Budget,
		Maintenance:     request.Maintenance,
		Deadline:        request.Deadline,
		DreamResult:     request.DreamResult,
	})
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-intake", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, apiEnvelope{Data: intakeCreateResponse{
		ID:           submission.ID,
		EstimateLow:  submission.EstimateLow,
		EstimateHigh: submission.EstimateHigh,
	}})
}

func (h *appHandler) handleIntakePhoto(w http.ResponseWriter, r *http.Request) {
	if h.intakeService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Intake service is not configured.")
		return
	}

	intakeID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-intake-id", "Intake ID must be a valid UUID.")
		return
	}

	if err := r.ParseMultipartForm(maxPhotoUploadBytes); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-form", "Request body must be multipart/form-data.")
		return
	}

	slot := r.FormValue("slot")
	file, header, err := r.FormFile("file")
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "missing-file", "A file upload is required.")
		return
	}
	defer func() { _ = file.Close() }()

	reader, err := readValidatedPhotoUpload(file, header)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-photo-file", err.Error())
		return
	}

	photo, err := h.intakeService.AddPhoto(r.Context(), intakeID, slot, header.Filename, reader)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "photo-upload-failed", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, apiEnvelope{Data: intakePhotoResponse{
		ID:  photo.ID,
		URL: photo.URL,
	}})
}

func (h *appHandler) handleAvailability(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}

	var serviceID *uuid.UUID
	if rawServiceID := r.URL.Query().Get("service_id"); rawServiceID != "" {
		parsed, err := uuid.Parse(rawServiceID)
		if err != nil {
			writeAPIError(w, http.StatusBadRequest, "invalid-service-id", "service_id must be a valid UUID.")
			return
		}
		serviceID = &parsed
	}

	availability, err := h.appointmentService.Availability(r.Context(), r.URL.Query().Get("month"), serviceID)
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-availability-query", err.Error())
		case errors.Is(err, hairappointments.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "service-not-found", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "availability-query-failed", "Failed to calculate availability.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: availabilityResponse{Availability: availability}})
}

func (h *appHandler) handleCreateAppointment(w http.ResponseWriter, r *http.Request) {
	if h.appointmentService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Appointment service is not configured.")
		return
	}

	request := appointmentCreateRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	var intakeID *uuid.UUID
	if request.IntakeID != "" {
		parsed, err := uuid.Parse(request.IntakeID)
		if err != nil {
			writeAPIError(w, http.StatusBadRequest, "invalid-intake-id", "intake_id must be a valid UUID.")
			return
		}
		intakeID = &parsed
	}

	serviceID, err := uuid.Parse(request.ServiceID)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-service-id", "service_id must be a valid UUID.")
		return
	}

	appointment, err := h.appointmentService.CreatePublicAppointment(r.Context(), hairappointments.CreatePublicAppointmentInput{
		IntakeID:    intakeID,
		ServiceID:   serviceID,
		Date:        request.Date,
		StartTime:   request.StartTime,
		ClientName:  request.ClientName,
		ClientEmail: request.ClientEmail,
		ClientPhone: request.ClientPhone,
	})
	if err != nil {
		switch {
		case errors.Is(err, hairappointments.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-appointment", err.Error())
		case errors.Is(err, hairappointments.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "appointment-resource-not-found", err.Error())
		case errors.Is(err, hairappointments.ErrSlotUnavailable):
			writeAPIError(w, http.StatusConflict, "slot-unavailable", err.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "appointment-create-failed", "Failed to create appointment.")
		}
		return
	}

	writeJSON(w, http.StatusCreated, apiEnvelope{Data: appointmentCreateResponse{Appointment: appointment}})
}
