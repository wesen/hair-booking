package admindsl

import (
	"context"
	"testing"
)

func TestServicesFlowSourceRendersAndDispatches(t *testing.T) {
	rt := NewScriptRuntime()
	session, initial, err := rt.StartFlow(context.Background(), "fringe.admin.services.v1", ServicesFlowSource)
	if err != nil {
		t.Fatalf("start flow: %v", err)
	}
	if initial.Page.ID != "admin-services" {
		t.Fatalf("unexpected page id: %s", initial.Page.ID)
	}
	openID := firstActionID(t, initial.Page, "service.open")
	opened, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-open", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("dispatch open: %v", err)
	}
	if len(opened.Page.Drawers) != 1 {
		t.Fatalf("expected drawer after open, got %#v", opened.Page.Drawers)
	}
	validateID := firstActionID(t, opened.Page, "service.validate")
	validation, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-validate", PageVersion: opened.PageVersion, ActionID: validateID})
	if err != nil {
		t.Fatalf("dispatch validate: %v", err)
	}
	if validation.Page.Drawers[0].Children[0].Props["errors"] == nil {
		t.Fatalf("expected validation errors in drawer form, got %#v", validation.Page.Drawers[0].Children[0].Props)
	}
}
