package server

import (
	"context"
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
	mu        sync.RWMutex
	runtime   *dslgoja.Runtime
	configDB  *sql.DB
	stateDB   *sql.DB
	blobStore storage.BlobStore
	sessions  map[string]*dslgoja.FlowSession
}

func newDSLFlowStore(configDB, stateDB *sql.DB, configDBPath, stateDBPath string, blobStore storage.BlobStore) *dslFlowStore {
	runtime := dslgoja.NewRuntime(dslgoja.WithHost(dslgoja.RuntimeHost{
		ConfigDB:     configDB,
		ConfigDBPath: configDBPath,
		StateDB:      stateDB,
		StateDBPath:  stateDBPath,
		// Transitional legacy alias for existing require("db") callers.
		DB:        stateDB,
		DBPath:    stateDBPath,
		BlobStore: blobStore,
	}))
	return &dslFlowStore{
		runtime:   runtime,
		configDB:  configDB,
		stateDB:   stateDB,
		blobStore: blobStore,
		sessions:  map[string]*dslgoja.FlowSession{},
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

func (s *dslFlowStore) expireStaleSessions(ctx context.Context) (int64, error) {
	if s == nil || s.stateDB == nil {
		return 0, nil
	}
	result, err := s.stateDB.ExecContext(ctx, `UPDATE dsl_flow_sessions
SET status = 'expired', updated_at = datetime('now')
WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= datetime('now')`)
	if err != nil {
		return 0, err
	}
	rows, _ := result.RowsAffected()
	return rows, nil
}

func (s *dslFlowStore) getOrHydrate(r *http.Request, sessionID string, user dslgoja.UserSnapshot) (*dslgoja.FlowSession, *dslgoja.InteractionResult, bool, error) {
	if session, ok := s.get(sessionID); ok {
		return session, nil, true, nil
	}
	if s.stateDB == nil {
		return nil, nil, false, nil
	}

	var flowID, stateJSON string
	var pageVersion int64
	var ownerUserID sql.NullString
	err := s.stateDB.QueryRowContext(r.Context(), `SELECT flow_id, current_page_version, state_json, user_id FROM dsl_flow_sessions WHERE id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now'))`, sessionID).Scan(&flowID, &pageVersion, &stateJSON, &ownerUserID)
	if err == nil && ownerUserID.Valid && ownerUserID.String != "" && ownerUserID.String != user.ID {
		return nil, nil, false, nil
	}
	if err == sql.ErrNoRows {
		return nil, nil, false, nil
	}
	if err != nil {
		return nil, nil, false, err
	}
	if flowID != "fringe.intake.v1" {
		return nil, nil, false, nil
	}

	session, result, err := s.runtime.ResumeFlow(r.Context(), flowID, dslgoja.DemoIntakeFlowSource, dslgoja.ResumeFlowOptions{
		SessionID:           sessionID,
		User:                user,
		StateJSON:           []byte(stateJSON),
		PreviousPageVersion: pageVersion,
	})
	if err != nil {
		return nil, nil, false, err
	}
	s.put(session)
	return session, result, true, nil
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

	session, result, err := h.dslFlows.runtime.StartFlow(r.Context(), flowID, dslgoja.DemoIntakeFlowSource, dslgoja.WithUser(h.dslUserSnapshot(r)))
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_flow_start_failed", err.Error())
		return
	}
	h.dslFlows.put(session)
	if err := h.recordDSLFlowSession(r, session, result); err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_session_record_failed", err.Error())
		return
	}
	state, err := dslgoja.FlowStateFromResult(result)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}

func (h *appHandler) handleDSLGetFlow(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("sessionId")
	session, hydratedResult, ok, err := h.dslFlows.getOrHydrate(r, sessionID, h.dslUserSnapshot(r))
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_session_hydrate_failed", err.Error())
		return
	}
	if !ok {
		writeDSLProtoError(w, http.StatusNotFound, "dsl_session_not_found", "DSL session not found")
		return
	}
	if hydratedResult != nil {
		if err := h.recordDSLFlowSession(r, session, hydratedResult); err != nil {
			writeDSLProtoError(w, http.StatusInternalServerError, "dsl_session_record_failed", err.Error())
			return
		}
		state, err := dslgoja.FlowStateFromResult(hydratedResult)
		if err != nil {
			writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
			return
		}
		writeProtoJSON(w, http.StatusOK, state)
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
	session, _, ok, err := h.dslFlows.getOrHydrate(r, sessionID, h.dslUserSnapshot(r))
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_session_hydrate_failed", err.Error())
		return
	}
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
	if err := h.recordDSLFlowSession(r, session, result); err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_session_record_failed", err.Error())
		return
	}
	state, err := dslgoja.FlowStateFromResult(result)
	if err != nil {
		writeDSLProtoError(w, http.StatusInternalServerError, "dsl_proto_conversion_failed", err.Error())
		return
	}
	writeProtoJSON(w, http.StatusOK, state)
}
