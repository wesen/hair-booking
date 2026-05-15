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
	validation, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-validate", PageVersion: opened.PageVersion, ActionID: validateID, Value: map[string]any{"name": "", "price": "60 min · $80+"}})
	if err != nil {
		t.Fatalf("dispatch validate: %v", err)
	}
	if validation.Page.Drawers[0].Children[0].Props["errors"] == nil {
		t.Fatalf("expected validation errors in drawer form, got %#v", validation.Page.Drawers[0].Children[0].Props)
	}

	saveID := firstActionID(t, validation.Page, "service.save")
	saved, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-save", PageVersion: validation.PageVersion, ActionID: saveID, Value: map[string]any{"name": "Curly Cut", "price": "75 min · $95+"}})
	if err != nil {
		t.Fatalf("dispatch save: %v", err)
	}
	if len(saved.Page.Drawers) != 1 {
		t.Fatalf("expected saved drawer, got %#v", saved.Page.Drawers)
	}
	form := saved.Page.Drawers[0].Children[0]
	if form.Props["state"] != "success" {
		t.Fatalf("expected saved form state, got %#v", form.Props)
	}
	if saved.Page.Nodes[0].Children[0].Children[0].Props["title"] != "Curly Cut" {
		t.Fatalf("expected updated service title, got %#v", saved.Page.Nodes[0].Children[0].Children[0].Props)
	}
}
