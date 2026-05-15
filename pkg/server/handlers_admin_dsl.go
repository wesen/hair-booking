package server

import (
	"io"
	"net/http"
	"sync"

	admindslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/admin_dsl/v1"
	"github.com/go-go-golems/hair-booking/pkg/admindsl"
	"google.golang.org/protobuf/encoding/protojson"
)

type adminDSLFlowStore struct {
	mu       sync.RWMutex
	sessions map[string]*admindsl.ServicesFlowSession
}

func newAdminDSLFlowStore() *adminDSLFlowStore {
	return &adminDSLFlowStore{sessions: map[string]*admindsl.ServicesFlowSession{}}
}

func (s *adminDSLFlowStore) put(session *admindsl.ServicesFlowSession) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.ID] = session
}

func (s *adminDSLFlowStore) get(id string) (*admindsl.ServicesFlowSession, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, ok := s.sessions[id]
	return session, ok
}

func writeAdminDSLProtoError(w http.ResponseWriter, status int, code, message string) {
	writeProtoJSON(w, status, &admindslv1.AdminDslError{Code: code, Message: message})
}

func (h *appHandler) handleAdminDSLStartFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("flowId")
	if flowID != "fringe.admin.services.v1" {
		writeAdminDSLProtoError(w, http.StatusNotFound, "admin_dsl_flow_not_found", "Admin DSL flow not found")
		return
	}

	session := admindsl.NewServicesFlowSession()
	result, err := session.Start()
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusInternalServerError, "admin_dsl_flow_start_failed", err.Error())
		return
	}
	h.adminDSLFlows.put(session)
	state, err := admindsl.FlowStateFromResult(result)
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusInternalServerError, "admin_dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}

func (h *appHandler) handleAdminDSLGetFlow(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.adminDSLFlows.get(sessionID)
	if !ok {
		writeAdminDSLProtoError(w, http.StatusNotFound, "admin_dsl_session_not_found", "Admin DSL session not found")
		return
	}
	result := &admindsl.FlowResult{SessionID: session.ID, PageVersion: session.Version, Page: session.CurrentPage()}
	state, err := admindsl.FlowStateFromResult(result)
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusInternalServerError, "admin_dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}

func (h *appHandler) handleAdminDSLEvent(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.adminDSLFlows.get(sessionID)
	if !ok {
		writeAdminDSLProtoError(w, http.StatusNotFound, "admin_dsl_session_not_found", "Admin DSL session not found")
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusBadRequest, "invalid_admin_dsl_event", "Could not read Admin DSL event body")
		return
	}
	var protoEvent admindslv1.AdminInteractionEvent
	if err := protojson.Unmarshal(body, &protoEvent); err != nil {
		writeAdminDSLProtoError(w, http.StatusBadRequest, "invalid_admin_dsl_event", "Invalid Admin DSL event protobuf JSON")
		return
	}
	protoEvent.SessionId = sessionID
	result, err := session.Dispatch(admindsl.InteractionEventFromProto(&protoEvent))
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusBadRequest, "admin_dsl_dispatch_failed", err.Error())
		return
	}
	state, err := admindsl.FlowStateFromResult(result)
	if err != nil {
		writeAdminDSLProtoError(w, http.StatusInternalServerError, "admin_dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}
