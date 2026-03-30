package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	hairstylist "github.com/go-go-golems/hair-booking/pkg/stylist"
	"github.com/google/uuid"
)

type stylistIntakesResponse struct {
	Intakes []hairstylist.IntakeListItem `json:"intakes"`
}

type stylistIntakeDetailResponse struct {
	Intake *hairstylist.IntakeDetail `json:"intake"`
}

type stylistIntakeReviewResponse struct {
	Review *hairstylist.IntakeReview `json:"review"`
}

type stylistIntakeReviewRequest struct {
	Status          *string `json:"status"`
	Priority        *string `json:"priority"`
	Summary         *string `json:"summary"`
	InternalNotes   *string `json:"internal_notes"`
	QuotedPriceLow  *int    `json:"quoted_price_low"`
	QuotedPriceHigh *int    `json:"quoted_price_high"`
}

func (h *appHandler) handleStylistIntakes(w http.ResponseWriter, r *http.Request) {
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

	items, serviceErr := h.stylistService.ListIntakes(r.Context(), hairstylist.IntakeListFilter{
		Status: r.URL.Query().Get("status"),
		Limit:  limit,
		Offset: offset,
	})
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-intake-query", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-intake-query-failed", "Failed to load stylist intakes.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistIntakesResponse{Intakes: items}})
}

func (h *appHandler) handleStylistIntakeDetail(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	intakeID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-intake-id", "Intake ID must be a valid UUID.")
		return
	}

	detail, serviceErr := h.stylistService.GetIntake(r.Context(), intakeID)
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-intake-id", serviceErr.Error())
		case errors.Is(serviceErr, hairstylist.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "stylist-intake-not-found", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-intake-load-failed", "Failed to load the stylist intake detail.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistIntakeDetailResponse{Intake: detail}})
}

func (h *appHandler) handleStylistIntakeReview(w http.ResponseWriter, r *http.Request) {
	if _, status, apiErr := h.currentStylist(r); apiErr != nil {
		writeAPIError(w, status, apiErr.Code, apiErr.Message)
		return
	}
	if h.stylistService == nil {
		writeAPIError(w, http.StatusInternalServerError, "backend-not-configured", "Stylist service is not configured.")
		return
	}

	intakeID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-intake-id", "Intake ID must be a valid UUID.")
		return
	}

	request := stylistIntakeReviewRequest{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid-json", "Request body must be valid JSON.")
		return
	}

	review, serviceErr := h.stylistService.UpdateIntakeReview(r.Context(), intakeID, hairstylist.IntakeReviewUpdate{
		Status:          request.Status,
		Priority:        request.Priority,
		Summary:         request.Summary,
		InternalNotes:   request.InternalNotes,
		QuotedPriceLow:  request.QuotedPriceLow,
		QuotedPriceHigh: request.QuotedPriceHigh,
	})
	if serviceErr != nil {
		switch {
		case errors.Is(serviceErr, hairstylist.ErrInvalidInput):
			writeAPIError(w, http.StatusBadRequest, "invalid-intake-review", serviceErr.Error())
		case errors.Is(serviceErr, hairstylist.ErrNotFound):
			writeAPIError(w, http.StatusNotFound, "stylist-intake-not-found", serviceErr.Error())
		default:
			writeAPIError(w, http.StatusInternalServerError, "stylist-intake-review-failed", "Failed to update the stylist intake review.")
		}
		return
	}

	writeJSON(w, http.StatusOK, apiEnvelope{Data: stylistIntakeReviewResponse{Review: review}})
}

func parseListPagination(r *http.Request) (int, int, error) {
	limit := 0
	offset := 0
	if r == nil {
		return limit, offset, nil
	}

	if rawLimit := r.URL.Query().Get("limit"); rawLimit != "" {
		parsed, err := strconv.Atoi(rawLimit)
		if err != nil {
			return 0, 0, errors.New("limit must be an integer")
		}
		limit = parsed
	}
	if rawOffset := r.URL.Query().Get("offset"); rawOffset != "" {
		parsed, err := strconv.Atoi(rawOffset)
		if err != nil {
			return 0, 0, errors.New("offset must be an integer")
		}
		offset = parsed
	}
	return limit, offset, nil
}
