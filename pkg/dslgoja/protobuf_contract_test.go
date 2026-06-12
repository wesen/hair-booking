package dslgoja

import (
	"encoding/json"
	"testing"

	dslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/dsl/v1"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
)

func TestFlowStateProtoConversionUsesCamelCaseAndDynamicProps(t *testing.T) {
	result := &InteractionResult{
		SessionID:   "flow_1",
		PageVersion: 3,
		Page: Page{
			SchemaVersion: 1,
			ID:            "intake-service",
			Title:         "Service",
			Shell: Shell{Kind: "intake", Props: map[string]any{
				"step": float64(1),
				"actions": map[string]any{
					"next": map[string]any{"id": "act_next", "event": "next"},
				},
			}},
			Nodes: []Node{{
				Kind: "segmented",
				Props: map[string]any{
					"value": "color",
					"actions": map[string]any{
						"change": map[string]any{"id": "act_category", "event": "change"},
					},
				},
				Meta: &NodeMeta{ID: "category-tabs"},
			}},
		},
	}

	state, err := FlowStateFromResult(result)
	if err != nil {
		t.Fatalf("FlowStateFromResult: %v", err)
	}
	encoded, err := protojson.Marshal(state)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var decoded map[string]any
	if err := json.Unmarshal(encoded, &decoded); err != nil {
		t.Fatalf("json decode: %v", err)
	}
	if decoded["sessionId"] != "flow_1" {
		t.Fatalf("sessionId = %#v", decoded["sessionId"])
	}
	if decoded["pageVersion"] != float64(3) {
		t.Fatalf("pageVersion = %#v", decoded["pageVersion"])
	}
	page := decoded["page"].(map[string]any)
	if page["schemaVersion"] != float64(1) {
		t.Fatalf("schemaVersion = %#v", page["schemaVersion"])
	}
	nodes := page["nodes"].([]any)
	node := nodes[0].(map[string]any)
	meta := node["meta"].(map[string]any)
	if meta["id"] != "category-tabs" {
		t.Fatalf("node meta id = %#v", meta["id"])
	}
	propsJSON := node["props"].(map[string]any)
	if propsJSON["value"] != "color" {
		t.Fatalf("props value = %#v", propsJSON["value"])
	}
}

func TestInteractionEventFromProtoConvertsDynamicValue(t *testing.T) {
	var protoEvent dslv1.InteractionEvent
	if err := protojson.Unmarshal([]byte(`{
		"eventId":"evt_1",
		"sessionId":"flow_1",
		"pageVersion":4,
		"nodeId":"tone-chips",
		"nodeKind":"chipGroup",
		"actionId":"act_tones",
		"event":"change",
		"value":["warm","dimensional"],
		"meta":{"source":"test"}
	}`), &protoEvent); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	event := InteractionEventFromProto(&protoEvent)
	if event.EventID != "evt_1" || event.PageVersion != 4 || event.NodeID != "tone-chips" {
		t.Fatalf("event = %#v", event)
	}
	values := event.Value.([]any)
	if values[0] != "warm" || values[1] != "dimensional" {
		t.Fatalf("value = %#v", event.Value)
	}
	if event.Meta["source"] != "test" {
		t.Fatalf("meta = %#v", event.Meta)
	}
}

func TestDSLProtoJSONContractUsesCamelCaseAndDynamicProps(t *testing.T) {
	props, err := structpb.NewStruct(map[string]any{
		"value": "color",
		"actions": map[string]any{
			"change": map[string]any{"id": "act_category", "event": "change"},
		},
	})
	if err != nil {
		t.Fatalf("props struct: %v", err)
	}

	page := &dslv1.Page{
		SchemaVersion: 1,
		Id:            "intake-service",
		Title:         "Service",
		Shell: &dslv1.Shell{
			Kind: "intake",
		},
		Nodes: []*dslv1.Node{{
			Kind:  "segmented",
			Props: props,
			Meta:  &dslv1.NodeMeta{Id: "category-tabs"},
		}},
	}

	encoded, err := protojson.Marshal(page)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var decoded map[string]any
	if err := json.Unmarshal(encoded, &decoded); err != nil {
		t.Fatalf("json decode: %v", err)
	}
	if decoded["schemaVersion"] != float64(1) {
		t.Fatalf("schemaVersion = %#v", decoded["schemaVersion"])
	}
	nodes := decoded["nodes"].([]any)
	node := nodes[0].(map[string]any)
	meta := node["meta"].(map[string]any)
	if meta["id"] != "category-tabs" {
		t.Fatalf("node meta id = %#v", meta["id"])
	}
	propsJSON := node["props"].(map[string]any)
	if propsJSON["value"] != "color" {
		t.Fatalf("props value = %#v", propsJSON["value"])
	}
}
