package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog"

	"github.com/go-go-golems/XXX/internal/dsl"
	"github.com/go-go-golems/XXX/internal/store"
)

type handler struct {
	store  *store.Store
	logger zerolog.Logger
}

func (h *handler) registerRoutes(r chi.Router) {
	r.Route("/decision-trees", func(r chi.Router) {
		r.Get("/", h.listPublishedTrees)
		r.Get("/all", h.listAllTrees)
		r.Get("/{id}", h.getTree)
		r.Post("/", h.createTree)
		r.Patch("/{id}", h.updateTree)
		r.Delete("/{id}", h.deleteTree)
		r.Post("/validate", h.validateTree)
	})

	r.Route("/bookings", func(r chi.Router) {
		r.Post("/", h.createBooking)
		r.Get("/", h.listBookings)
		r.Get("/{id}", h.getBooking)
	})
}

func (h *handler) listPublishedTrees(w http.ResponseWriter, r *http.Request) {
	trees, err := h.store.ListDecisionTrees(true)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, trees)
}

func (h *handler) listAllTrees(w http.ResponseWriter, r *http.Request) {
	trees, err := h.store.ListDecisionTrees(false)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, trees)
}

func (h *handler) getTree(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	tree, err := h.store.GetDecisionTree(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if tree == nil {
		writeError(w, http.StatusNotFound, "decision tree not found")
		return
	}

	writeJSON(w, http.StatusOK, tree)
}

type createTreeRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	DSLContent  string  `json:"dslContent"`
	IsPublished bool    `json:"isPublished"`
}

func (h *handler) createTree(w http.ResponseWriter, r *http.Request) {
	var req createTreeRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.DSLContent == "" {
		writeError(w, http.StatusBadRequest, "name and dslContent are required")
		return
	}
	if _, err := dsl.ParseDSL(req.DSLContent); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.store.CreateDecisionTree(store.DecisionTree{
		Name:        req.Name,
		Description: req.Description,
		DSLContent:  req.DSLContent,
		IsPublished: req.IsPublished,
		IsPreset:    false,
		Version:     1,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

type updateTreeRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	DSLContent  *string `json:"dslContent"`
	IsPublished *bool   `json:"isPublished"`
}

func (h *handler) updateTree(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	var req updateTreeRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.DSLContent != nil {
		if _, err := dsl.ParseDSL(*req.DSLContent); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	updates := store.DecisionTreeUpdates{
		Name:        req.Name,
		Description: req.Description,
		DSLContent:  req.DSLContent,
		IsPublished: req.IsPublished,
	}

	if err := h.store.UpdateDecisionTree(id, updates); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (h *handler) deleteTree(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.store.DeleteDecisionTree(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

type validateTreeRequest struct {
	DSLContent string `json:"dslContent"`
}

func (h *handler) validateTree(w http.ResponseWriter, r *http.Request) {
	var req validateTreeRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.DSLContent == "" {
		writeError(w, http.StatusBadRequest, "dslContent is required")
		return
	}

	valid, errors := dsl.ValidateDSL(req.DSLContent)
	writeJSON(w, http.StatusOK, map[string]any{
		"valid":  valid,
		"errors": errors,
	})
}

type createBookingRequest struct {
	DecisionTreeID int64   `json:"decisionTreeId"`
	Selected       string  `json:"selectedServices"`
	TotalPrice     int     `json:"totalPrice"`
	TotalDuration  int     `json:"totalDuration"`
	AppliedRules   *string `json:"appliedRules"`
	ClientName     *string `json:"clientName"`
	ClientEmail    *string `json:"clientEmail"`
	ClientPhone    *string `json:"clientPhone"`
	PreferredTime  *string `json:"preferredDateTime"`
	Notes          *string `json:"notes"`
}

func (h *handler) createBooking(w http.ResponseWriter, r *http.Request) {
	var req createBookingRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.DecisionTreeID == 0 || req.Selected == "" {
		writeError(w, http.StatusBadRequest, "decisionTreeId and selectedServices are required")
		return
	}

	var preferred *time.Time
	if req.PreferredTime != nil && *req.PreferredTime != "" {
		parsed, err := time.Parse(time.RFC3339, *req.PreferredTime)
		if err != nil {
			writeError(w, http.StatusBadRequest, "preferredDateTime must be RFC3339")
			return
		}
		preferred = &parsed
	}

	id, err := h.store.CreateBooking(store.Booking{
		DecisionTreeID: req.DecisionTreeID,
		Selected:       req.Selected,
		TotalPrice:     req.TotalPrice,
		TotalDuration:  req.TotalDuration,
		AppliedRules:   req.AppliedRules,
		ClientName:     req.ClientName,
		ClientEmail:    req.ClientEmail,
		ClientPhone:    req.ClientPhone,
		PreferredAt:    preferred,
		Status:         "pending",
		Notes:          req.Notes,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

func (h *handler) listBookings(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.store.ListBookings()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, bookings)
}

func (h *handler) getBooking(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDParam(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	booking, err := h.store.GetBooking(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if booking == nil {
		writeError(w, http.StatusNotFound, "booking not found")
		return
	}
	writeJSON(w, http.StatusOK, booking)
}

func parseIDParam(r *http.Request, key string) (int64, error) {
	value := chi.URLParam(r, key)
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id <= 0 {
		return 0, strconv.ErrSyntax
	}
	return id, nil
}

func readJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
