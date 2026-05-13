package dslgoja

import (
	"encoding/json"
	"testing"

	dslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/dsl/v1"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
)

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
