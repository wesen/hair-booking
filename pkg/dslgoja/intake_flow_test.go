package dslgoja

import (
	"context"
	"testing"
)

func TestDemoIntakeFlowStartsOnServiceStep(t *testing.T) {
	rt := NewRuntime()
	session, result, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "intake-service" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if result.Page.Shell.Kind != "intake" {
		t.Fatalf("shell kind = %q", result.Page.Shell.Kind)
	}
	if len(result.Page.Nodes) != 3 {
		t.Fatalf("node count = %d", len(result.Page.Nodes))
	}
	if result.Page.Nodes[1].Meta == nil || result.Page.Nodes[1].Meta.ID != "category-tabs" {
		t.Fatalf("category node meta = %#v", result.Page.Nodes[1].Meta)
	}
	if result.Page.Nodes[2].Meta == nil || result.Page.Nodes[2].Meta.ID != "service-options" {
		t.Fatalf("service node meta = %#v", result.Page.Nodes[2].Meta)
	}
	if len(session.CurrentActions) != 4 {
		t.Fatalf("registered actions = %d, want 4", len(session.CurrentActions))
	}
}

func TestDemoIntakeFlowCanStartOnColorStepFromState(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	state := session.state.ToObject(session.VM)
	if err := state.Set("step", "color"); err != nil {
		t.Fatalf("set step: %v", err)
	}
	result, err := session.Render(context.Background())
	if err != nil {
		t.Fatalf("render color: %v", err)
	}
	if result.Page.ID != "intake-color" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if len(result.Page.Nodes) != 2 {
		t.Fatalf("node count = %d", len(result.Page.Nodes))
	}
	if result.Page.Nodes[0].Meta == nil || result.Page.Nodes[0].Meta.ID != "tone-chips" {
		t.Fatalf("tone node meta = %#v", result.Page.Nodes[0].Meta)
	}
	if result.Page.Nodes[1].Meta == nil || result.Page.Nodes[1].Meta.ID != "damage-rating" {
		t.Fatalf("damage node meta = %#v", result.Page.Nodes[1].Meta)
	}
}
