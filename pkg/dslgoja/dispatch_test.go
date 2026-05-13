package dslgoja

import (
	"context"
	"testing"
)

func findActionByName(t *testing.T, session *FlowSession, name string) ActionRegistration {
	t.Helper()
	for _, action := range session.CurrentActions {
		if action.Name == name {
			return action
		}
	}
	t.Fatalf("action %q not found in %#v", name, session.CurrentActions)
	return ActionRegistration{}
}

func segmentedValue(t *testing.T, page Page, nodeID string) string {
	t.Helper()
	for _, node := range page.Nodes {
		if node.Meta != nil && node.Meta.ID == nodeID {
			value, _ := node.Props["value"].(string)
			return value
		}
	}
	t.Fatalf("node %q not found", nodeID)
	return ""
}

func TestDispatchInvokesGojaCallbackAndCommitsNextPage(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	setCategory := findActionByName(t, session, "setCategory")

	result, err := session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_set_category",
		PageVersion: session.Version,
		NodeID:      "category-tabs",
		NodeKind:    "segmented",
		ActionID:    setCategory.ID,
		Event:       "change",
		Value:       "extensions",
	})
	if err != nil {
		t.Fatalf("Dispatch: %v", err)
	}
	if result.PageVersion != 2 {
		t.Fatalf("page version = %d", result.PageVersion)
	}
	if got := segmentedValue(t, result.Page, "category-tabs"); got != "extensions" {
		t.Fatalf("category value = %q", got)
	}
	if _, ok := session.RetiredActions[setCategory.ID]; !ok {
		t.Fatalf("old setCategory action was not retired")
	}
}

func TestDispatchNavigationActionMovesToColorStep(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	next := findActionByName(t, session, "next")

	result, err := session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_next",
		PageVersion: session.Version,
		NodeID:      "shell.next",
		ActionID:    next.ID,
		Event:       "next",
	})
	if err != nil {
		t.Fatalf("Dispatch: %v", err)
	}
	if result.Page.ID != "intake-color" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
}

func TestDispatchStaleActionReturnsCurrentPage(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	oldAction := findActionByName(t, session, "setCategory")
	_, err = session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_first",
		PageVersion: session.Version,
		NodeID:      "category-tabs",
		ActionID:    oldAction.ID,
		Event:       "change",
		Value:       "extensions",
	})
	if err != nil {
		t.Fatalf("first dispatch: %v", err)
	}

	stale, err := session.Dispatch(context.Background(), InteractionEvent{
		EventID:     "evt_stale",
		PageVersion: 1,
		NodeID:      "category-tabs",
		ActionID:    oldAction.ID,
		Event:       "change",
		Value:       "cut",
	})
	if err != nil {
		t.Fatalf("stale dispatch: %v", err)
	}
	if stale.PageVersion != session.Version {
		t.Fatalf("stale result version = %d, want %d", stale.PageVersion, session.Version)
	}
	if len(stale.Effects) == 0 || stale.Effects[0].Tone != "info" {
		t.Fatalf("stale effects = %#v", stale.Effects)
	}
}

func TestDispatchDuplicateEventReturnsCachedResult(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	next := findActionByName(t, session, "next")
	event := InteractionEvent{
		EventID:     "evt_duplicate_next",
		PageVersion: session.Version,
		NodeID:      "shell.next",
		ActionID:    next.ID,
		Event:       "next",
	}
	first, err := session.Dispatch(context.Background(), event)
	if err != nil {
		t.Fatalf("first dispatch: %v", err)
	}
	second, err := session.Dispatch(context.Background(), event)
	if err != nil {
		t.Fatalf("second dispatch: %v", err)
	}
	if second.PageVersion != first.PageVersion {
		t.Fatalf("duplicate version = %d, want %d", second.PageVersion, first.PageVersion)
	}
	if session.Version != first.PageVersion {
		t.Fatalf("session version changed after duplicate: %d", session.Version)
	}
}
