package server

import (
	"database/sql"
	"io"
	"net/http"
	"sync"

	dslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/dsl/v1"
	"github.com/go-go-golems/hair-booking/pkg/dslgoja"
	"github.com/go-go-golems/hair-booking/pkg/storage"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

type dslFlowStore struct {
	mu       sync.RWMutex
	runtime  *dslgoja.Runtime
	sessions map[string]*dslgoja.FlowSession
}

func newDSLFlowStore(db *sql.DB, dbPath string, blobStore storage.BlobStore) *dslFlowStore {
	runtime := dslgoja.NewRuntime(dslgoja.WithHost(dslgoja.RuntimeHost{
		DB:        db,
		DBPath:    dbPath,
		BlobStore: blobStore,
	}))
	return &dslFlowStore{
		runtime:  runtime,
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

func writeProtoJSON(w http.ResponseWriter, status int, msg proto.Message) {
	payload, err := protojson.MarshalOptions{EmitUnpopulated: false}.Marshal(msg)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(payload)
}

func writeDSLProtoError(w http.ResponseWriter, status int, code, message string) {
	writeProtoJSON(w, status, &dslv1.DslError{Code: code, Message: message})
}

func (h *appHandler) handleDSLStartFlow(w http.ResponseWriter, r *http.Request) {
	flowID := r.PathValue("flowId")
	if flowID != "fringe.intake.v1" {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_flow_not_found", "DSL flow not found")
		return
	}

	session, result, err := h.dslFlows.runtime.StartFlow(r.Context(), flowID, dslgoja.DemoIntakeFlowSource)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_flow_start_failed", err.Error())
		return
	}
	h.dslFlows.put(session)
	state, err := dslgoja.FlowStateFromResult(result)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}

func (h *appHandler) handleDSLGetFlow(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.dslFlows.get(sessionID)
	if !ok {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}
	version, page := session.Snapshot()
	state, err := dslgoja.FlowStateFromSnapshot(session.ID, version, page)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}

func (h *appHandler) handleDSLEvent(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, ok := h.dslFlows.get(sessionID)
	if !ok {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_event", "Could not read DSL event body")
		return
	}
	var protoEvent dslv1.InteractionEvent
	if err := protojson.Unmarshal(body, &protoEvent); err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "invalid_dsl_event", "Invalid DSL event protobuf JSON")
		return
	}
	protoEvent.SessionId = sessionID

	result, err := session.Dispatch(r.Context(), dslgoja.InteractionEventFromProto(&protoEvent))
	if err != nil {
		writeDSLProtoError(w, http.StatusBadRequest, "dsl_dispatch_failed", err.Error())
		return
	}
	state, err := dslgoja.FlowStateFromResult(result)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}
