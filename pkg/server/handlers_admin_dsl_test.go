package server

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	admindslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/admin_dsl/v1"
	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	"github.com/go-go-golems/hair-booking/pkg/intakeadmin"
	"google.golang.org/protobuf/encoding/protojson"
)

func TestAdminDSLHTTPRejectsUnknownFlow(t *testing.T) {
	handler := NewHandler(HandlerOptions{})
	req := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/not-real/start", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}
}

func TestAdminDSLHTTPStartsRealIntakeAdminFlow(t *testing.T) {
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
	if err := intakeadmin.ProvisionSchema(context.Background(), stateHost.DB); err != nil {
		t.Fatalf("ProvisionSchema: %v", err)
	}
	store := intakeadmin.NewStore(stateHost.DB, configHost.DB)
	if _, err := store.CreateRequest(context.Background(), intakeadmin.RequestInput{ConfigVersionID: "cfg_default", ServiceCategory: "color", ServiceValue: "highlights", EstimateLabel: "$220–$420"}); err != nil {
		t.Fatalf("CreateRequest: %v", err)
	}

	handler := NewHandler(HandlerOptions{DSLStateDB: stateHost.DB, DSLConfigDB: configHost.DB, DSLSQLiteMigrate: true})
	startReq := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/fringe.admin.intake.v1/start", nil)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("start status %d body %s", startRec.Code, startRec.Body.String())
	}
	var state admindslv1.AdminFlowState
	if err := protojson.Unmarshal(startRec.Body.Bytes(), &state); err != nil {
		t.Fatalf("decode start: %v", err)
	}
	if state.Page == nil || state.Page.Id != "admin-intake-dashboard" {
		t.Fatalf("unexpected page: %#v", state.Page)
	}
}

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

	staleReq := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/"+startState.SessionId+"/events", bytes.NewReader(body))
	staleRec := httptest.NewRecorder()
	handler.ServeHTTP(staleRec, staleReq)
	if staleRec.Code != http.StatusOK {
		t.Fatalf("stale status %d body %s", staleRec.Code, staleRec.Body.String())
	}
	var staleState admindslv1.AdminFlowState
	if err := protojson.Unmarshal(staleRec.Body.Bytes(), &staleState); err != nil {
		t.Fatalf("decode stale: %v", err)
	}
	if len(staleState.Effects) != 1 || staleState.Effects[0].Tone != "info" {
		t.Fatalf("expected stale info effect, got %#v", staleState.Effects)
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
