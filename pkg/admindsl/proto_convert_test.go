package admindsl

import (
	"testing"

	"google.golang.org/protobuf/encoding/protojson"
)

func TestAdminFlowStateProtoJSONIncludesSurfaces(t *testing.T) {
	session := NewServicesFlowSession()
	initial, err := session.Start()
	if err != nil {
		t.Fatalf("start: %v", err)
	}
	openID := firstActionID(t, initial.Page, "service.select")
	selected, err := session.Dispatch(FlowEvent{EventID: "evt-open", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("dispatch: %v", err)
	}
	state, err := FlowStateFromResult(selected)
	if err != nil {
		t.Fatalf("proto convert: %v", err)
	}
	if len(state.Page.Drawers) != 1 {
		t.Fatalf("expected drawer in proto page, got %#v", state.Page.Drawers)
	}
	data, err := protojson.Marshal(state)
	if err != nil {
		t.Fatalf("protojson marshal: %v", err)
	}
	var roundTrip = state.ProtoReflect().New().Interface()
	if err := protojson.Unmarshal(data, roundTrip); err != nil {
		t.Fatalf("protojson round trip: %v", err)
	}
}
