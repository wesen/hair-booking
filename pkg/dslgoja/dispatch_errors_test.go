package dslgoja

import (
	"context"
	"strings"
	"testing"
)

const throwingFlow = `
const { page, n } = require("fringe/dsl");
function initialState() { return {}; }
function render(ctx) {
  return page("throwing", "Throwing")
    .bare()
    .add(n.button("Boom", { actions: { click: ctx.action("boom", function(event) { throw new Error("boom"); }, "click") } }).id("boom-button"))
    .toJSON();
}
`

func TestDispatchUnknownActionReturnsError(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	_, err = session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_unknown",
		PageVersion: session.Version,
		NodeID:      "missing",
		ActionID:    "act_missing",
		Event:       "change",
	})
	if err == nil || !strings.Contains(err.Error(), "unknown action") {
		t.Fatalf("expected unknown action error, got %v", err)
	}
}

func TestDispatchCallbackErrorReturnsCurrentPageWithDangerEffect(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "throwing", throwingFlow)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	boom := findActionByName(t, session, "boom")
	result, err := session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_boom",
		PageVersion: session.Version,
		NodeID:      "boom-button",
		ActionID:    boom.ID,
		Event:       "click",
	})
	if err != nil {
		t.Fatalf("Dispatch: %v", err)
	}
	if result.PageVersion != session.Version {
		t.Fatalf("error result version = %d, want %d", result.PageVersion, session.Version)
	}
	if result.Page.ID != "throwing" {
		t.Fatalf("error result page = %q", result.Page.ID)
	}
	if len(result.Effects) == 0 || result.Effects[0].Tone != "danger" || !strings.Contains(result.Effects[0].Message, "boom") {
		t.Fatalf("effects = %#v", result.Effects)
	}
}
