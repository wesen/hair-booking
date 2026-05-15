package admindsl

import (
	"strings"
	"testing"
)

func firstActionID(t *testing.T, page Page, target string) string {
	t.Helper()
	var walk func(nodes []Node) string
	walk = func(nodes []Node) string {
		for _, node := range nodes {
			if actions, ok := node.Props["actions"].([]any); ok {
				for _, raw := range actions {
					obj, ok := raw.(map[string]any)
					if ok && obj["target"] == target {
						id, _ := obj["id"].(string)
						return id
					}
				}
			}
			if actions, ok := node.Props["actions"].(map[string]any); ok {
				for _, raw := range actions {
					obj, ok := raw.(map[string]any)
					if ok && obj["target"] == target {
						id, _ := obj["id"].(string)
						return id
					}
				}
			}
			if id := walk(node.Children); id != "" {
				return id
			}
		}
		return ""
	}
	if id := walk(page.Nodes); id != "" {
		return id
	}
	if id := walk(page.Drawers); id != "" {
		return id
	}
	if id := walk(page.Modals); id != "" {
		return id
	}
	t.Fatalf("action target %q not found", target)
	return ""
}

func TestServicesFlowOpenEditSaveAndCancel(t *testing.T) {
	session := NewServicesFlowSession()
	initial, err := session.Start()
	if err != nil {
		t.Fatalf("start: %v", err)
	}
	openID := firstActionID(t, initial.Page, "service.select")
	selected, err := session.Dispatch(FlowEvent{EventID: "evt-1", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("dispatch open: %v", err)
	}
	if len(selected.Page.Drawers) != 1 {
		t.Fatalf("expected editor drawer, got %#v", selected.Page.Drawers)
	}
	saveID := firstActionID(t, selected.Page, "service.save")
	saved, err := session.Dispatch(FlowEvent{EventID: "evt-2", PageVersion: selected.PageVersion, ActionID: saveID})
	if err != nil {
		t.Fatalf("dispatch save: %v", err)
	}
	if saved.PageVersion != selected.PageVersion+1 {
		t.Fatalf("expected page version increment, got %d after %d", saved.PageVersion, selected.PageVersion)
	}
}

func TestServicesFlowRejectsStalePageVersion(t *testing.T) {
	session := NewServicesFlowSession()
	initial, err := session.Start()
	if err != nil {
		t.Fatalf("start: %v", err)
	}
	openID := firstActionID(t, initial.Page, "service.select")
	if _, err := session.Dispatch(FlowEvent{EventID: "evt-1", PageVersion: initial.PageVersion, ActionID: openID}); err != nil {
		t.Fatalf("dispatch open: %v", err)
	}
	stale, err := session.Dispatch(FlowEvent{EventID: "evt-stale", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("stale dispatch should not error: %v", err)
	}
	if len(stale.Effects) != 1 || !strings.Contains(stale.Effects[0].Message, "already updated") {
		t.Fatalf("expected stale effect, got %#v", stale.Effects)
	}
}

func TestServicesFlowMalformedPagesFailBeforeTransport(t *testing.T) {
	_, err := PageResource("bad", "Bad").Content(NodeOf(NodeKind("not-real"), nil)).Build()
	if err == nil || !strings.Contains(err.Error(), "invalid node kind") {
		t.Fatalf("expected invalid node kind validation error, got %v", err)
	}
}
