package server

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	admindslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/admin_dsl/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

func TestAdminDSLHTTPStartGetDispatch(t *testing.T) {
	handler := NewHandler(HandlerOptions{})

	startReq := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/fringe.admin.services.v1/start", nil)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("start status %d body %s", startRec.Code, startRec.Body.String())
	}
	var startState admindslv1.AdminFlowState
	if err := protojson.Unmarshal(startRec.Body.Bytes(), &startState); err != nil {
		t.Fatalf("decode start: %v", err)
	}
	if startState.SessionId == "" || startState.Page == nil || len(startState.Page.Nodes) == 0 {
		t.Fatalf("unexpected start state: %#v", &startState)
	}

	actionID := findAdminProtoActionID(startState.Page.Nodes, "service.open")
	if actionID == "" {
		t.Fatalf("service.open action not found")
	}
	event := &admindslv1.AdminInteractionEvent{
		EventId:     "evt-http-open",
		SessionId:   startState.SessionId,
		PageVersion: startState.PageVersion,
		ActionId:    actionID,
		Event:       "click",
	}
	body, err := protojson.Marshal(event)
	if err != nil {
		t.Fatalf("marshal event: %v", err)
	}
	eventReq := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/"+startState.SessionId+"/events", bytes.NewReader(body))
	eventRec := httptest.NewRecorder()
	handler.ServeHTTP(eventRec, eventReq)
	if eventRec.Code != http.StatusOK {
		t.Fatalf("event status %d body %s", eventRec.Code, eventRec.Body.String())
	}
	var eventState admindslv1.AdminFlowState
	if err := protojson.Unmarshal(eventRec.Body.Bytes(), &eventState); err != nil {
		t.Fatalf("decode event: %v", err)
	}
	if len(eventState.Page.Drawers) != 1 {
		t.Fatalf("expected drawer after open, got %#v", eventState.Page.Drawers)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/admin-dsl/flows/"+startState.SessionId, nil)
	getRec := httptest.NewRecorder()
	handler.ServeHTTP(getRec, getReq)
	if getRec.Code != http.StatusOK {
		t.Fatalf("get status %d body %s", getRec.Code, getRec.Body.String())
	}
}

func findAdminProtoActionID(nodes []*admindslv1.AdminNode, target string) string {
	for _, node := range nodes {
		if node.Props != nil {
			if actionsValue, ok := node.Props.AsMap()["actions"]; ok {
				if id := findActionIDInValue(actionsValue, target); id != "" {
					return id
				}
			}
		}
		if id := findAdminProtoActionID(node.Children, target); id != "" {
			return id
		}
	}
	return ""
}

func findActionIDInValue(value any, target string) string {
	switch v := value.(type) {
	case []any:
		for _, item := range v {
			if id := findActionIDInValue(item, target); id != "" {
				return id
			}
		}
	case map[string]any:
		if v["target"] == target {
			id, _ := v["id"].(string)
			return id
		}
		for _, item := range v {
			if id := findActionIDInValue(item, target); id != "" {
				return id
			}
		}
	}
	return ""
}
