package dslgoja

import (
	"context"
	"testing"
)

const rerenderFlow = `
var renderCount = 0;
function initialState() { return { value: "one" }; }
function render(ctx) {
  renderCount++;
  if (ctx.state.failRender) {
    throw new Error("render failed intentionally");
  }
  return {
    schemaVersion: 1,
    id: "page-" + renderCount,
    title: "Page " + renderCount,
    shell: { kind: "bare" },
    nodes: [{
      kind: "button",
      meta: { id: "next" },
      props: {
        children: "Next",
        actions: { click: ctx.action("next", function(event) { return render(ctx); }, "click") }
      }
    }]
  };
}
`

func TestRenderTransactionRetiresOldActionsAfterSuccessfulRender(t *testing.T) {
	rt := NewRuntime()
	session, first, err := rt.StartFlow(context.Background(), "rerender", rerenderFlow)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if first.PageVersion != 1 {
		t.Fatalf("first version = %d", first.PageVersion)
	}
	oldIDs := map[string]ActionRegistration{}
	for id, action := range session.CurrentActions {
		oldIDs[id] = action
	}
	if len(oldIDs) != 1 {
		t.Fatalf("old action count = %d", len(oldIDs))
	}

	second, err := session.Render(context.Background())
	if err != nil {
		t.Fatalf("second render: %v", err)
	}
	if second.PageVersion != 2 {
		t.Fatalf("second version = %d", second.PageVersion)
	}
	if len(session.CurrentActions) != 1 {
		t.Fatalf("current action count = %d", len(session.CurrentActions))
	}
	for id := range oldIDs {
		if _, ok := session.CurrentActions[id]; ok {
			t.Fatalf("old action %s still current", id)
		}
		retired, ok := session.RetiredActions[id]
		if !ok {
			t.Fatalf("old action %s not retired", id)
		}
		if retired.Version != 1 {
			t.Fatalf("retired version = %d, want 1", retired.Version)
		}
	}
}

func TestRenderTransactionKeepsOldActionsWhenRenderFails(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "rerender", rerenderFlow)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	oldIDs := map[string]ActionRegistration{}
	for id, action := range session.CurrentActions {
		oldIDs[id] = action
	}
	state := session.state.ToObject(session.VM)
	if err := state.Set("failRender", true); err != nil {
		t.Fatalf("set failRender: %v", err)
	}

	if _, err := session.Render(context.Background()); err == nil {
		t.Fatalf("expected render error")
	}
	if session.Version != 1 {
		t.Fatalf("version after failed render = %d, want 1", session.Version)
	}
	if len(session.CurrentActions) != len(oldIDs) {
		t.Fatalf("current action count = %d, want %d", len(session.CurrentActions), len(oldIDs))
	}
	for id := range oldIDs {
		if _, ok := session.CurrentActions[id]; !ok {
			t.Fatalf("old action %s missing after failed render", id)
		}
		if _, ok := session.RetiredActions[id]; ok {
			t.Fatalf("old action %s retired after failed render", id)
		}
	}
}
