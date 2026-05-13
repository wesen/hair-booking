package dslgoja

import (
	"encoding/json"
	"testing"
)

func TestPageJSONContractUsesFrontendFieldNames(t *testing.T) {
	page := NewPage("intake-service", "Service")
	page.Shell = Shell{
		Kind: "intake",
		Props: map[string]any{
			"step":  1,
			"total": 6,
			"actions": map[string]any{
				"next": ActionRef{ID: "act_next", Event: "next"},
			},
		},
	}
	page.Nodes = []Node{
		{
			Kind: "segmented",
			Meta: &NodeMeta{ID: "category-tabs"},
			Props: map[string]any{
				"value": "color",
				"options": []map[string]any{
					{"value": "cut", "label": "Cut"},
					{"value": "color", "label": "Color"},
				},
				"actions": map[string]ActionRef{
					"change": {ID: "act_category", Event: "change"},
				},
			},
		},
	}

	b, err := json.Marshal(page)
	if err != nil {
		t.Fatalf("marshal page: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(b, &got); err != nil {
		t.Fatalf("unmarshal page: %v", err)
	}

	if got["schemaVersion"] != float64(1) {
		t.Fatalf("schemaVersion = %#v", got["schemaVersion"])
	}
	if _, ok := got["shell"].(map[string]any)["props"]; !ok {
		t.Fatalf("shell.props missing from %#v", got["shell"])
	}
	nodes := got["nodes"].([]any)
	first := nodes[0].(map[string]any)
	if first["kind"] != "segmented" {
		t.Fatalf("kind = %#v", first["kind"])
	}
	meta := first["meta"].(map[string]any)
	if meta["id"] != "category-tabs" {
		t.Fatalf("meta.id = %#v", meta["id"])
	}
}

func TestInteractionEventJSONContract(t *testing.T) {
	event := InteractionEvent{
		EventID:     "evt_1",
		SessionID:   "flow_1",
		PageVersion: 3,
		NodeID:      "category-tabs",
		NodeKind:    "segmented",
		ActionID:    "act_1",
		Event:       "change",
		Value:       "extensions",
		Meta:        map[string]any{"source": "pointer"},
	}

	b, err := json.Marshal(event)
	if err != nil {
		t.Fatalf("marshal event: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(b, &got); err != nil {
		t.Fatalf("unmarshal event: %v", err)
	}

	for _, key := range []string{"eventId", "sessionId", "pageVersion", "nodeId", "nodeKind", "actionId", "event", "value", "meta"} {
		if _, ok := got[key]; !ok {
			t.Fatalf("expected key %q in %s", key, string(b))
		}
	}
}
