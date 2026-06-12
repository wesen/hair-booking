package server

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	dslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/dsl/v1"
	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	"google.golang.org/protobuf/encoding/protojson"
)

func TestDSLFlowEndpointsStartGetAndDispatch(t *testing.T) {
	handler := newTestDSLHandler(t, HandlerOptions{Version: "test"})

	startReq := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/fringe.intake.v1/start", nil)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("start status = %d body=%s", startRec.Code, startRec.Body.String())
	}

	var data map[string]any
	if err := json.Unmarshal(startRec.Body.Bytes(), &data); err != nil {
		t.Fatalf("decode start: %v", err)
	}
	sessionID := data["sessionId"].(string)
	pageVersion := int64(data["pageVersion"].(float64))
	page := data["page"].(map[string]any)
	if page["id"] != "intake-service" {
		t.Fatalf("start page id = %#v", page["id"])
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/dsl/flows/"+sessionID, nil)
	getRec := httptest.NewRecorder()
	handler.ServeHTTP(getRec, getReq)
	if getRec.Code != http.StatusOK {
		t.Fatalf("get status = %d body=%s", getRec.Code, getRec.Body.String())
	}

	setCategoryActionID := findActionIDInPage(t, page, "category-tabs", "change")
	eventBody := map[string]any{
		"eventId":     "evt_http_set_category",
		"pageVersion": pageVersion,
		"nodeId":      "category-tabs",
		"nodeKind":    "segmented",
		"actionId":    setCategoryActionID,
		"event":       "change",
		"value":       "extensions",
	}
	body, _ := json.Marshal(eventBody)
	eventReq := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/"+sessionID+"/events", bytes.NewReader(body))
	eventReq.Header.Set("Content-Type", "application/json")
	eventRec := httptest.NewRecorder()
	handler.ServeHTTP(eventRec, eventReq)
	if eventRec.Code != http.StatusOK {
		t.Fatalf("event status = %d body=%s", eventRec.Code, eventRec.Body.String())
	}

	var eventData map[string]any
	if err := json.Unmarshal(eventRec.Body.Bytes(), &eventData); err != nil {
		t.Fatalf("decode event: %v", err)
	}
	if int64(eventData["pageVersion"].(float64)) != pageVersion+1 {
		t.Fatalf("event page version = %#v", eventData["pageVersion"])
	}
	updatedPage := eventData["page"].(map[string]any)
	if got := findNodeValue(t, updatedPage, "category-tabs"); got != "extensions" {
		t.Fatalf("category value = %q", got)
	}
}

func TestDSLStartUnknownFlowReturnsProtobufError(t *testing.T) {
	handler := NewHandler(HandlerOptions{Version: "test"})
	req := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/missing/start", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
	var protoErr dslv1.DslError
	if err := protojson.Unmarshal(rec.Body.Bytes(), &protoErr); err != nil {
		t.Fatalf("decode proto error: %v body=%s", err, rec.Body.String())
	}
	if protoErr.Code != "dsl_flow_not_found" || protoErr.Message != "DSL flow not found" {
		t.Fatalf("proto error = %#v", &protoErr)
	}
}

func TestDSLFlowPersistsStateJSONOnStartAndDispatch(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	handler := newTestDSLHandler(t, HandlerOptions{Version: "test", DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	startData := startDSLFlow(t, handler)
	sessionID := startData["sessionId"].(string)
	pageVersion := int64(startData["pageVersion"].(float64))

	var startState string
	var startConfigVersion string
	if err := dbHost.DB.QueryRow(`SELECT state_json, config_version_id FROM dsl_flow_sessions WHERE id = ?`, sessionID).Scan(&startState, &startConfigVersion); err != nil {
		t.Fatalf("query start state_json: %v", err)
	}
	var startStateData map[string]any
	if err := json.Unmarshal([]byte(startState), &startStateData); err != nil {
		t.Fatalf("decode start state_json: %v", err)
	}
	if startStateData["category"] != "color" {
		t.Fatalf("start category = %#v in %s", startStateData["category"], startState)
	}
	if startConfigVersion != "cfg_default" {
		t.Fatalf("start config_version_id = %q", startConfigVersion)
	}

	eventData := dispatchCategory(t, handler, startData, "extensions", "evt_persist_set_category")
	var persistedVersion int64
	var eventState string
	var eventConfigVersion string
	if err := dbHost.DB.QueryRow(`SELECT current_page_version, state_json, config_version_id FROM dsl_flow_sessions WHERE id = ?`, sessionID).Scan(&persistedVersion, &eventState, &eventConfigVersion); err != nil {
		t.Fatalf("query event state_json: %v", err)
	}
	if persistedVersion != pageVersion+1 {
		t.Fatalf("persisted page version = %d, want %d", persistedVersion, pageVersion+1)
	}
	var eventStateData map[string]any
	if err := json.Unmarshal([]byte(eventState), &eventStateData); err != nil {
		t.Fatalf("decode event state_json: %v", err)
	}
	if eventStateData["category"] != "extensions" {
		t.Fatalf("event category = %#v in %s", eventStateData["category"], eventState)
	}
	if eventConfigVersion != "cfg_default" {
		t.Fatalf("event config_version_id = %q", eventConfigVersion)
	}
	updatedPage := eventData["page"].(map[string]any)
	if got := findNodeValue(t, updatedPage, "category-tabs"); got != "extensions" {
		t.Fatalf("category value = %q", got)
	}
}

func TestDSLConfirmCreatesPersistedIntakeRequest(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	handler := newTestDSLHandler(t, HandlerOptions{Version: "test", DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path, DSLSQLiteMigrate: true})
	state := startDSLFlow(t, handler)
	for i := 0; i < 6; i++ {
		state = dispatchShellAction(t, handler, state, "next", "evt_next_")
	}
	page := state["page"].(map[string]any)
	if page["id"] != "intake-confirm" {
		t.Fatalf("expected confirm page, got %#v", page["id"])
	}
	submitID := findActionIDInPage(t, page, "submit-intake-request", "click")
	state = dispatchActionByID(t, handler, state, "submit-intake-request", "button", submitID, "submit", nil, "evt_submit_intake")

	var count int
	if err := dbHost.DB.QueryRow(`SELECT count(*) FROM intake_requests WHERE service_value = 'highlights' AND status = 'new'`).Scan(&count); err != nil {
		t.Fatalf("count intake requests: %v", err)
	}
	if count != 1 {
		t.Fatalf("intake request count = %d, want 1", count)
	}
	updatedPage := state["page"].(map[string]any)
	if updatedPage["id"] != "intake-confirm" {
		t.Fatalf("updated page id = %#v", updatedPage["id"])
	}
}

func TestDSLGetHydratesPersistedSessionWithFreshActions(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	firstHandler := newTestDSLHandler(t, HandlerOptions{Version: "test", DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	startData, eventData := startAndSetCategory(t, firstHandler, "extensions")
	sessionID := startData["sessionId"].(string)
	eventPageVersion := int64(eventData["pageVersion"].(float64))
	eventPage := eventData["page"].(map[string]any)
	oldActionID := findActionIDInPage(t, eventPage, "category-tabs", "change")

	secondHandler := newTestDSLHandler(t, HandlerOptions{Version: "test", DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	getReq := httptest.NewRequest(http.MethodGet, "/api/dsl/flows/"+sessionID, nil)
	getRec := httptest.NewRecorder()
	secondHandler.ServeHTTP(getRec, getReq)
	if getRec.Code != http.StatusOK {
		t.Fatalf("get status = %d body=%s", getRec.Code, getRec.Body.String())
	}
	var getData map[string]any
	if err := json.Unmarshal(getRec.Body.Bytes(), &getData); err != nil {
		t.Fatalf("decode get: %v", err)
	}
	if int64(getData["pageVersion"].(float64)) <= eventPageVersion {
		t.Fatalf("hydrated page version = %#v, want > %d", getData["pageVersion"], eventPageVersion)
	}
	hydratedPage := getData["page"].(map[string]any)
	if got := findNodeValue(t, hydratedPage, "category-tabs"); got != "extensions" {
		t.Fatalf("hydrated category value = %q", got)
	}
	newActionID := findActionIDInPage(t, hydratedPage, "category-tabs", "change")
	if newActionID == oldActionID {
		t.Fatalf("hydrated action id reused old action id %q", newActionID)
	}
}

func TestDSLHydrationRejectsWrongUserAndExpiredSessions(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	alice := &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "alice"}
	bob := &hairauth.Settings{Mode: hairauth.AuthModeDev, DevUserID: "bob"}
	firstHandler := newTestDSLHandler(t, HandlerOptions{Version: "test", AuthSettings: alice, DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	startData := startDSLFlow(t, firstHandler)
	sessionID := startData["sessionId"].(string)

	wrongUserHandler := newTestDSLHandler(t, HandlerOptions{Version: "test", AuthSettings: bob, DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	wrongReq := httptest.NewRequest(http.MethodGet, "/api/dsl/flows/"+sessionID, nil)
	wrongRec := httptest.NewRecorder()
	wrongUserHandler.ServeHTTP(wrongRec, wrongReq)
	if wrongRec.Code != http.StatusNotFound {
		t.Fatalf("wrong user get status = %d body=%s", wrongRec.Code, wrongRec.Body.String())
	}

	if _, err := dbHost.DB.Exec(`UPDATE dsl_flow_sessions SET expires_at = datetime('now', '-1 hour') WHERE id = ?`, sessionID); err != nil {
		t.Fatalf("expire session: %v", err)
	}
	expiredHandler := newTestDSLHandler(t, HandlerOptions{Version: "test", AuthSettings: alice, DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	expiredReq := httptest.NewRequest(http.MethodGet, "/api/dsl/flows/"+sessionID, nil)
	expiredRec := httptest.NewRecorder()
	expiredHandler.ServeHTTP(expiredRec, expiredReq)
	if expiredRec.Code != http.StatusNotFound {
		t.Fatalf("expired get status = %d body=%s", expiredRec.Code, expiredRec.Body.String())
	}
}

func TestDSLFlowStoreExpiresStaleSessions(t *testing.T) {
	dbHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "dsl.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = dbHost.Close() }()

	store := newDSLFlowStore(nil, dbHost.DB, "", dbHost.Path, nil)
	_, err = dbHost.DB.Exec(`INSERT INTO dsl_flow_sessions(id, flow_id, user_id, status, current_page_version, state_json, expires_at)
VALUES
  ('expired_1', 'fringe.intake.v1', 'alice', 'active', 1, '{}', datetime('now', '-1 hour')),
  ('active_1', 'fringe.intake.v1', 'alice', 'active', 1, '{}', datetime('now', '+1 hour'))`)
	if err != nil {
		t.Fatalf("seed sessions: %v", err)
	}
	rows, err := store.expireStaleSessions(context.Background())
	if err != nil {
		t.Fatalf("expire stale sessions: %v", err)
	}
	if rows != 1 {
		t.Fatalf("expired rows = %d", rows)
	}
	var expiredStatus, activeStatus string
	if err := dbHost.DB.QueryRow(`SELECT status FROM dsl_flow_sessions WHERE id = 'expired_1'`).Scan(&expiredStatus); err != nil {
		t.Fatalf("query expired status: %v", err)
	}
	if err := dbHost.DB.QueryRow(`SELECT status FROM dsl_flow_sessions WHERE id = 'active_1'`).Scan(&activeStatus); err != nil {
		t.Fatalf("query active status: %v", err)
	}
	if expiredStatus != "expired" || activeStatus != "active" {
		t.Fatalf("statuses expired=%q active=%q", expiredStatus, activeStatus)
	}
}

func TestDSLFlowReadsServiceOptionsFromConfigDB(t *testing.T) {
	stateHost, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "state.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = stateHost.Close() }()
	configHost, err := dslhost.OpenConfigDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "config.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenConfigDB: %v", err)
	}
	defer func() { _ = configHost.Close() }()
	if _, err := configHost.DB.Exec(`UPDATE dsl_service_options SET title = 'Color Consult' WHERE value = 'cut'`); err != nil {
		t.Fatalf("update config seed: %v", err)
	}

	handler := NewHandler(HandlerOptions{Version: "test", DSLStateDB: stateHost.DB, DSLStateSQLitePath: stateHost.Path, DSLConfigDB: configHost.DB, DSLConfigSQLitePath: configHost.Path})
	startData := startDSLFlow(t, handler)
	page := startData["page"].(map[string]any)
	options := findNodeOptions(t, page, "service-options")
	if len(options) == 0 {
		t.Fatalf("service options empty")
	}
	first := options[0].(map[string]any)
	if first["title"] != "Color Consult" {
		t.Fatalf("first service title = %#v", first["title"])
	}
}

func newTestDSLHandler(t *testing.T, options HandlerOptions) http.Handler {
	t.Helper()
	if options.DSLConfigDB == nil {
		configHost, err := dslhost.OpenConfigDB(context.Background(), dslhost.DBOptions{Path: filepath.Join(t.TempDir(), "config.sqlite"), Migrate: true})
		if err != nil {
			t.Fatalf("OpenConfigDB: %v", err)
		}
		t.Cleanup(func() { _ = configHost.Close() })
		options.DSLConfigDB = configHost.DB
		options.DSLConfigSQLitePath = configHost.Path
	}
	return NewHandler(options)
}

func startAndSetCategory(t *testing.T, handler http.Handler, value string) (map[string]any, map[string]any) {
	t.Helper()
	startData := startDSLFlow(t, handler)
	return startData, dispatchCategory(t, handler, startData, value, "evt_set_category_"+value)
}

func startDSLFlow(t *testing.T, handler http.Handler) map[string]any {
	t.Helper()
	startReq := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/fringe.intake.v1/start", nil)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("start status = %d body=%s", startRec.Code, startRec.Body.String())
	}
	var data map[string]any
	if err := json.Unmarshal(startRec.Body.Bytes(), &data); err != nil {
		t.Fatalf("decode start: %v", err)
	}
	return data
}

func dispatchShellAction(t *testing.T, handler http.Handler, state map[string]any, action, eventPrefix string) map[string]any {
	t.Helper()
	page := state["page"].(map[string]any)
	shell := page["shell"].(map[string]any)
	props := shell["props"].(map[string]any)
	actions := props["actions"].(map[string]any)
	ref := actions[action].(map[string]any)
	return dispatchActionByID(t, handler, state, "", "shell", ref["id"].(string), ref["event"].(string), nil, eventPrefix+page["id"].(string))
}

func dispatchActionByID(t *testing.T, handler http.Handler, state map[string]any, nodeID, nodeKind, actionID, event string, value any, eventID string) map[string]any {
	t.Helper()
	sessionID := state["sessionId"].(string)
	pageVersion := int64(state["pageVersion"].(float64))
	eventBody := map[string]any{
		"eventId":     eventID,
		"pageVersion": pageVersion,
		"nodeId":      nodeID,
		"nodeKind":    nodeKind,
		"actionId":    actionID,
		"event":       event,
	}
	if value != nil {
		eventBody["value"] = value
	}
	body, _ := json.Marshal(eventBody)
	eventReq := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/"+sessionID+"/events", bytes.NewReader(body))
	eventReq.Header.Set("Content-Type", "application/json")
	eventRec := httptest.NewRecorder()
	handler.ServeHTTP(eventRec, eventReq)
	if eventRec.Code != http.StatusOK {
		t.Fatalf("event status = %d body=%s", eventRec.Code, eventRec.Body.String())
	}
	var eventData map[string]any
	if err := json.Unmarshal(eventRec.Body.Bytes(), &eventData); err != nil {
		t.Fatalf("decode event: %v", err)
	}
	return eventData
}

func dispatchCategory(t *testing.T, handler http.Handler, state map[string]any, value, eventID string) map[string]any {
	t.Helper()
	page := state["page"].(map[string]any)
	setCategoryActionID := findActionIDInPage(t, page, "category-tabs", "change")
	return dispatchActionByID(t, handler, state, "category-tabs", "segmented", setCategoryActionID, "change", value, eventID)
}

func findActionIDInPage(t *testing.T, page map[string]any, nodeID, event string) string {
	t.Helper()
	nodes := page["nodes"].([]any)
	for _, raw := range nodes {
		node := raw.(map[string]any)
		meta, _ := node["meta"].(map[string]any)
		if meta["id"] != nodeID {
			continue
		}
		props := node["props"].(map[string]any)
		actions := props["actions"].(map[string]any)
		action := actions[event].(map[string]any)
		return action["id"].(string)
	}
	t.Fatalf("action %s for node %s not found", event, nodeID)
	return ""
}

func findNodeValue(t *testing.T, page map[string]any, nodeID string) string {
	t.Helper()
	nodes := page["nodes"].([]any)
	for _, raw := range nodes {
		node := raw.(map[string]any)
		meta, _ := node["meta"].(map[string]any)
		if meta["id"] != nodeID {
			continue
		}
		props := node["props"].(map[string]any)
		value, _ := props["value"].(string)
		return value
	}
	t.Fatalf("node %s not found", nodeID)
	return ""
}

func findNodeOptions(t *testing.T, page map[string]any, nodeID string) []any {
	t.Helper()
	nodes := page["nodes"].([]any)
	for _, raw := range nodes {
		node := raw.(map[string]any)
		meta, _ := node["meta"].(map[string]any)
		if meta["id"] != nodeID {
			continue
		}
		props := node["props"].(map[string]any)
		options, _ := props["options"].([]any)
		return options
	}
	t.Fatalf("node %s not found", nodeID)
	return nil
}
