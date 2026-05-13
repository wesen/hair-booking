package dslgoja

import (
	"context"
	"testing"
)

const minimalFlow = `
function initialState() {
  return { category: "color" };
}

function render(ctx) {
  return {
    schemaVersion: 1,
    id: "intake-service",
    title: "Service",
    shell: {
      kind: "intake",
      props: {
        step: 1,
        total: 2,
        title: "What brings you in?",
        actions: {
          next: ctx.action("next", function(event) { return render(ctx); }, "next")
        }
      }
    },
    nodes: [
      {
        kind: "segmented",
        meta: { id: "category-tabs" },
        props: {
          value: ctx.state.category,
          options: [
            { value: "cut", label: "Cut" },
            { value: "color", label: "Color" }
          ],
          actions: {
            change: ctx.action("setCategory", function(event) {
              ctx.state.category = event.value;
              return render(ctx);
            }, "change")
          }
        }
      }
    ]
  };
}
`

func TestRuntimeStartFlowRendersInitialPageAndRegistersActions(t *testing.T) {
	rt := NewRuntime()
	session, result, err := rt.StartFlow(context.Background(), "fringe.intake.test", minimalFlow)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if session.ID == "" {
		t.Fatalf("session id was empty")
	}
	if result.PageVersion != 1 {
		t.Fatalf("page version = %d", result.PageVersion)
	}
	if result.Page.ID != "intake-service" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if len(session.CurrentActions) != 2 {
		t.Fatalf("registered actions = %d, want 2", len(session.CurrentActions))
	}

	node := result.Page.Nodes[0]
	if node.Kind != "segmented" {
		t.Fatalf("node kind = %q", node.Kind)
	}
	actions, ok := node.Props["actions"].(map[string]any)
	if !ok {
		t.Fatalf("node props actions missing or wrong type: %#v", node.Props["actions"])
	}
	change, ok := actions["change"].(map[string]any)
	if !ok {
		t.Fatalf("change action missing or wrong type: %#v", actions["change"])
	}
	if change["id"] == "" || change["event"] != "change" {
		t.Fatalf("change action ref = %#v", change)
	}
}

func TestRuntimeUsesEmptyStateWhenInitialStateMissing(t *testing.T) {
	rt := NewRuntime()
	source := `
function render(ctx) {
  ctx.state.seen = true;
  return { schemaVersion: 1, id: "empty-state", title: "Empty", shell: { kind: "bare" }, nodes: [] };
}
`
	_, result, err := rt.StartFlow(context.Background(), "empty", source)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "empty-state" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
}
