package dslgoja

import (
	"context"
	"strings"
	"testing"
)

func dispatchActionByName(t *testing.T, session *FlowSession, eventID, actionName, nodeID, event string, value any) *InteractionResult {
	t.Helper()
	action := findActionByName(t, session, actionName)
	result, err := session.Dispatch(context.Background(), InteractionEvent{
		EventID:     eventID,
		PageVersion: session.Version,
		NodeID:      nodeID,
		NodeKind:    "test",
		ActionID:    action.ID,
		Event:       event,
		Value:       value,
	})
	if err != nil {
		t.Fatalf("dispatch %s: %v", actionName, err)
	}
	return result
}

func assertPage(t *testing.T, result *InteractionResult, pageID string) {
	t.Helper()
	if result.Page.ID != pageID {
		t.Fatalf("page id = %q, want %q", result.Page.ID, pageID)
	}
}

func assertNodeIDs(t *testing.T, page Page) {
	t.Helper()
	seen := map[string]bool{}
	var walk func(nodes []Node)
	walk = func(nodes []Node) {
		for _, node := range nodes {
			if node.Meta == nil || strings.TrimSpace(node.Meta.ID) == "" {
				t.Fatalf("page %s has node without stable meta.id: %#v", page.ID, node)
			}
			if seen[node.Meta.ID] {
				t.Fatalf("page %s has duplicate node id %q", page.ID, node.Meta.ID)
			}
			seen[node.Meta.ID] = true
			walk(node.Children)
		}
	}
	walk(page.Nodes)
}

func TestDemoIntakeFlowPhaseCNavigationAndStableIDs(t *testing.T) {
	rt := newRuntimeWithConfigDB(t)
	session, result, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}

	expected := []string{
		"intake-service",
		"intake-color",
		"intake-photos",
		"intake-budget",
		"intake-estimate",
		"intake-booking",
		"intake-confirm",
	}

	assertPage(t, result, expected[0])
	assertNodeIDs(t, result.Page)
	for i := 1; i < len(expected); i++ {
		result = dispatchActionByName(t, session, "evt_next_phase_c_"+expected[i], "next", "shell.next", "next", nil)
		assertPage(t, result, expected[i])
		assertNodeIDs(t, result.Page)
	}
}

func TestDemoIntakeFlowSummaryEditActionsNavigateToSourceSteps(t *testing.T) {
	rt := newRuntimeWithConfigDB(t)
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}

	for _, eventID := range []string{"evt_edit_to_color", "evt_edit_to_photos", "evt_edit_to_budget", "evt_edit_to_estimate"} {
		dispatchActionByName(t, session, eventID, "next", "shell.next", "next", nil)
	}
	if session.CurrentPage.ID != "intake-estimate" {
		t.Fatalf("current page = %q, want intake-estimate", session.CurrentPage.ID)
	}

	color := dispatchActionByName(t, session, "evt_edit_tones", "editEstimateColor", "estimate-tones", "edit", nil)
	assertPage(t, color, "intake-color")

	// Navigate back to confirm and verify confirm edit actions also route.
	for _, eventID := range []string{"evt_confirm_to_photos", "evt_confirm_to_budget", "evt_confirm_to_estimate", "evt_confirm_to_booking", "evt_confirm_to_confirm"} {
		dispatchActionByName(t, session, eventID, "next", "shell.next", "next", nil)
	}
	if session.CurrentPage.ID != "intake-confirm" {
		t.Fatalf("current page = %q, want intake-confirm", session.CurrentPage.ID)
	}

	booking := dispatchActionByName(t, session, "evt_edit_confirm_time", "editConfirmBookingTime", "confirm-time", "edit", nil)
	assertPage(t, booking, "intake-booking")
}

func TestDemoIntakeFlowPhaseCRepresentativeUpdates(t *testing.T) {
	rt := newRuntimeWithConfigDB(t)
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}

	// Move to photos and toggle a photo tile through its backend action.
	dispatchActionByName(t, session, "evt_to_color", "next", "shell.next", "next", nil)
	dispatchActionByName(t, session, "evt_to_photos", "next", "shell.next", "next", nil)
	photos := dispatchActionByName(t, session, "evt_upload_front", "uploadPhoto:front", "photo-front", "upload", "front")
	assertPage(t, photos, "intake-photos")
	if filled, _ := findNodeProps(t, photos.Page, "photo-front")["filled"].(bool); !filled {
		t.Fatalf("photo-front filled = %v, want true", filled)
	}

	// Move to budget and choose a specific range.
	dispatchActionByName(t, session, "evt_to_budget", "next", "shell.next", "next", nil)
	budget := dispatchActionByName(t, session, "evt_budget", "setBudget", "budget-options", "change", "200-350")
	assertPage(t, budget, "intake-budget")
	if got, _ := findNodeProps(t, budget.Page, "budget-options")["value"].(string); got != "200-350" {
		t.Fatalf("budget value = %q", got)
	}

	// Move to booking and change day/time.
	dispatchActionByName(t, session, "evt_to_estimate", "next", "shell.next", "next", nil)
	dispatchActionByName(t, session, "evt_to_booking", "next", "shell.next", "next", nil)
	bookingDay := dispatchActionByName(t, session, "evt_day", "setDay", "booking-days", "change", "2026-05-21")
	assertPage(t, bookingDay, "intake-booking")
	if got, _ := findNodeProps(t, bookingDay.Page, "booking-days")["value"].(string); got != "2026-05-21" {
		t.Fatalf("day value = %q", got)
	}
	bookingTime := dispatchActionByName(t, session, "evt_time", "setTime", "booking-times", "change", "16:30")
	if got, _ := findNodeProps(t, bookingTime.Page, "booking-times")["value"].(string); got != "16:30" {
		t.Fatalf("time value = %q", got)
	}
}

func findNodeProps(t *testing.T, page Page, nodeID string) map[string]any {
	t.Helper()
	var walk func(nodes []Node) (map[string]any, bool)
	walk = func(nodes []Node) (map[string]any, bool) {
		for _, node := range nodes {
			if node.Meta != nil && node.Meta.ID == nodeID {
				return node.Props, true
			}
			if props, ok := walk(node.Children); ok {
				return props, true
			}
		}
		return nil, false
	}
	if props, ok := walk(page.Nodes); ok {
		return props
	}
	t.Fatalf("node %q not found on page %s", nodeID, page.ID)
	return nil
}
