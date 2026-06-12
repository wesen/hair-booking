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
	"google.golang.org/protobuf/types/known/structpb"
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
	request, err := store.CreateRequest(context.Background(), intakeadmin.RequestInput{ConfigVersionID: "cfg_default", ServiceCategory: "color", ServiceValue: "highlights", EstimateLabel: "$220–$420", Photos: map[string]any{"front": map[string]any{"publicUrl": "/uploads/front.jpg", "originalFilename": "front.jpg"}}})
	if err != nil {
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
	openID := findAdminProtoActionID(state.Page.Nodes, "request.open")
	if openID == "" {
		t.Fatalf("request.open action not found")
	}
	rowValue, err := structpb.NewValue(map[string]any{"id": request.ID})
	if err != nil {
		t.Fatalf("row value: %v", err)
	}
	event := &admindslv1.AdminInteractionEvent{EventId: "evt-open-request", SessionId: state.SessionId, PageVersion: state.PageVersion, ActionId: openID, Event: "click", Value: rowValue}
	body, err := protojson.Marshal(event)
	if err != nil {
		t.Fatalf("marshal event: %v", err)
	}
	eventReq := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/"+state.SessionId+"/events", bytes.NewReader(body))
	eventRec := httptest.NewRecorder()
	handler.ServeHTTP(eventRec, eventReq)
	if eventRec.Code != http.StatusOK {
		t.Fatalf("event status %d body %s", eventRec.Code, eventRec.Body.String())
	}
	var detailState admindslv1.AdminFlowState
	if err := protojson.Unmarshal(eventRec.Body.Bytes(), &detailState); err != nil {
		t.Fatalf("decode detail: %v", err)
	}
	if detailState.Page == nil || detailState.Page.Id != "admin-intake-request-detail" {
		t.Fatalf("unexpected detail page: %#v", detailState.Page)
	}
}

func TestAdminDSLHTTPIntakeConfigCreatesDraft(t *testing.T) {
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
	configID := findAdminProtoActionID(state.Page.Nodes, "nav.config")
	if configID == "" {
		t.Fatalf("nav.config action not found")
	}
	configState := postAdminEvent(t, handler, state.SessionId, state.PageVersion, configID, nil)
	if configState.Page == nil || configState.Page.Id != "admin-intake-config" {
		t.Fatalf("unexpected config page: %#v", configState.Page)
	}
	createDraftID := findAdminProtoActionID(configState.Page.Nodes, "config.createDraft")
	if createDraftID == "" {
		t.Fatalf("config.createDraft action not found")
	}
	draftState := postAdminEvent(t, handler, configState.SessionId, configState.PageVersion, createDraftID, nil)
	if draftState.Page == nil || draftState.Page.Id != "admin-intake-config" {
		t.Fatalf("unexpected draft page: %#v", draftState.Page)
	}
	publishID := findAdminProtoActionID(draftState.Page.Nodes, "config.publish.open")
	if publishID == "" {
		t.Fatalf("expected publish action for draft config")
	}
	openServiceID := findAdminProtoActionID(draftState.Page.Nodes, "config.service.open")
	if openServiceID == "" {
		t.Fatalf("config.service.open action not found")
	}
	var serviceID string
	if err := configHost.DB.QueryRow(`SELECT id FROM dsl_service_options WHERE config_version_id IN (SELECT id FROM dsl_config_versions WHERE status = 'draft') ORDER BY sort_order LIMIT 1`).Scan(&serviceID); err != nil {
		t.Fatalf("select draft service: %v", err)
	}
	rowValue, err := structpb.NewValue(map[string]any{"id": serviceID})
	if err != nil {
		t.Fatalf("row value: %v", err)
	}
	serviceDrawerState := postAdminEvent(t, handler, draftState.SessionId, draftState.PageVersion, openServiceID, rowValue)
	if len(serviceDrawerState.Page.Drawers) != 1 {
		t.Fatalf("expected service drawer, got %#v", serviceDrawerState.Page.Drawers)
	}
	saveServiceID := findAdminProtoActionID(serviceDrawerState.Page.Drawers, "config.service.save")
	if saveServiceID == "" {
		t.Fatalf("config.service.save action not found")
	}
	formValue, err := structpb.NewValue(map[string]any{"id": serviceID, "category": "color", "value": "cut", "title": "Precision Cut", "subtitle": "Updated from HTTP test", "badge": "$95+", "sortOrder": "15", "enabled": "true"})
	if err != nil {
		t.Fatalf("form value: %v", err)
	}
	savedState := postAdminEvent(t, handler, serviceDrawerState.SessionId, serviceDrawerState.PageVersion, saveServiceID, formValue)
	if len(savedState.Page.Drawers) != 0 {
		t.Fatalf("expected service drawer to close after save, got %#v", savedState.Page.Drawers)
	}
	var serviceTitle string
	if err := configHost.DB.QueryRow(`SELECT title FROM dsl_service_options WHERE id = ?`, serviceID).Scan(&serviceTitle); err != nil {
		t.Fatalf("select updated service: %v", err)
	}
	if serviceTitle != "Precision Cut" {
		t.Fatalf("expected updated service title, got %q", serviceTitle)
	}
	var drafts int
	if err := configHost.DB.QueryRow(`SELECT count(*) FROM dsl_config_versions WHERE status = 'draft'`).Scan(&drafts); err != nil {
		t.Fatalf("count drafts: %v", err)
	}
	if drafts != 1 {
		t.Fatalf("expected one draft, got %d", drafts)
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

func postAdminEvent(t *testing.T, handler http.Handler, sessionID string, pageVersion uint32, actionID string, value *structpb.Value) *admindslv1.AdminFlowState {
	t.Helper()
	event := &admindslv1.AdminInteractionEvent{EventId: "evt-test", SessionId: sessionID, PageVersion: pageVersion, ActionId: actionID, Event: "click", Value: value}
	body, err := protojson.Marshal(event)
	if err != nil {
		t.Fatalf("marshal event: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/admin-dsl/flows/"+sessionID+"/events", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("event status %d body %s", rec.Code, rec.Body.String())
	}
	state := &admindslv1.AdminFlowState{}
	if err := protojson.Unmarshal(rec.Body.Bytes(), state); err != nil {
		t.Fatalf("decode event: %v", err)
	}
	return state
}

func findAdminProtoActionID(nodes []*admindslv1.AdminNode, target string) string {
	for _, node := range nodes {
		if node.Props != nil {
			for _, propValue := range node.Props.AsMap() {
				if id := findActionIDInValue(propValue, target); id != "" {
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
