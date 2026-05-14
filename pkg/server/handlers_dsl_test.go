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
	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	"google.golang.org/protobuf/encoding/protojson"
)

func TestDSLFlowEndpointsStartGetAndDispatch(t *testing.T) {
	handler := NewHandler(HandlerOptions{Version: "test"})

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

	handler := NewHandler(HandlerOptions{Version: "test", DSLStateDB: dbHost.DB, DSLStateSQLitePath: dbHost.Path})
	startReq := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/fringe.intake.v1/start", nil)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("start status = %d body=%s", startRec.Code, startRec.Body.String())
	}

	var startData map[string]any
	if err := json.Unmarshal(startRec.Body.Bytes(), &startData); err != nil {
		t.Fatalf("decode start: %v", err)
	}
	sessionID := startData["sessionId"].(string)
	pageVersion := int64(startData["pageVersion"].(float64))
	page := startData["page"].(map[string]any)

	var startState string
	if err := dbHost.DB.QueryRow(`SELECT state_json FROM dsl_flow_sessions WHERE id = ?`, sessionID).Scan(&startState); err != nil {
		t.Fatalf("query start state_json: %v", err)
	}
	var startStateData map[string]any
	if err := json.Unmarshal([]byte(startState), &startStateData); err != nil {
		t.Fatalf("decode start state_json: %v", err)
	}
	if startStateData["category"] != "color" {
		t.Fatalf("start category = %#v in %s", startStateData["category"], startState)
	}

	setCategoryActionID := findActionIDInPage(t, page, "category-tabs", "change")
	eventBody := map[string]any{
		"eventId":     "evt_persist_set_category",
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

	var persistedVersion int64
	var eventState string
	if err := dbHost.DB.QueryRow(`SELECT current_page_version, state_json FROM dsl_flow_sessions WHERE id = ?`, sessionID).Scan(&persistedVersion, &eventState); err != nil {
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
