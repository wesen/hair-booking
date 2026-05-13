package server

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/go-go-golems/hair-booking/pkg/dslgoja"
)

type dslFlowStore struct {
	mu       sync.RWMutex
	runtime  *dslgoja.Runtime
	sessions map[string]*dslgoja.FlowSession
}

func newDSLFlowStore() *dslFlowStore {
	return &dslFlowStore{
		runtime:  dslgoja.NewRuntime(),
		sessions: map[string]*dslgoja.FlowSession{},
	}
}

func (s *dslFlowStore) put(session *dslgoja.FlowSession) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.ID] = session
}

func (s *dslFlowStore) get(id string) (*dslgoja.FlowSession, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, ok := s.sessions[id]
	return session, ok
}

type dslFlowResponse struct {
	SessionID   string           `json:"sessionId"`
	PageVersion int64            `json:"pageVersion"`
	Page        dslgoja.Page     `json:"page"`
	Effects     []dslgoja.Effect `json:"effects,omitempty"`
}

func newDSLFlowResponse(result *dslgoja.InteractionResult) dslFlowResponse {
	return dslFlowResponse{
		SessionID:   result.SessionID,
		PageVersion: result.PageVersion,
		Page:        result.Page,
		Effects:     result.Effects,
	}
}

func (h *appHandler) handleDSLStartFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("flowId")
	if flowID != "fringe.intake.v1" {
		writeAPIError(w, http.StatusNotFound, "dsl_flow_not_found", "DSL flow not found")
		return
	}

	session, result, err := h.dslFlows.runtime.StartFlow(r.Context(), flowID, dslgoja.DemoIntakeFlowSource)
	if err != nil {
		writeAPIError(w, http.StatusInternalServerError, "dsl_flow_start_failed", err.Error())
		return
	}
	h.dslFlows.put(session)
	writeJSON(w, http.StatusOK, apiEnvelope{Data: newDSLFlowResponse(result)})
}

func (h *appHandler) handleDSLGetFlow(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.dslFlows.get(sessionID)
	if !ok {
		writeAPIError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}
	version, page := session.Snapshot()
	writeJSON(w, http.StatusOK, apiEnvelope{Data: dslFlowResponse{
		SessionID:   session.ID,
		PageVersion: version,
		Page:        page,
	}})
}

func (h *appHandler) handleDSLEvent(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.dslFlows.get(sessionID)
	if !ok {
		writeAPIError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}

	var event dslgoja.InteractionEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		writeAPIError(w, http.StatusBadRequest, "invalid_dsl_event", "Invalid DSL event JSON")
		return
	}
	event.SessionID = sessionID

	result, err := session.Dispatch(r.Context(), event)
	if err != nil {
		writeAPIError(w, http.StatusBadRequest, "dsl_dispatch_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, apiEnvelope{Data: newDSLFlowResponse(result)})
}
