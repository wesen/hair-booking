package server

import (
	"encoding/json"
	"net/http"

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

	if err := r.ParseMultipartForm(10 << 20); err != nil {
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

	photo, err := h.intakeService.AddPhoto(r.Context(), intakeID, slot, header.Filename, file)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "photo-upload-failed", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, apiEnvelope{Data: intakePhotoResponse{
		ID:  photo.ID,
		URL: photo.URL,
	}})
}
