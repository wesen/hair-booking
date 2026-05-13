package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
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

func TestDSLStartUnknownFlowReturnsNotFound(t *testing.T) {
	handler := NewHandler(HandlerOptions{Version: "test"})
	req := httptest.NewRequest(http.MethodPost, "/api/dsl/flows/missing/start", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
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
