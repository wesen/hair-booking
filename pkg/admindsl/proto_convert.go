package admindsl

import (
	"fmt"
	"math"

	admindslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/admin_dsl/v1"
	"google.golang.org/protobuf/types/known/structpb"
)

func PageToProto(page Page) (*admindslv1.AdminPage, error) {
	nodes, err := NodesToProto(page.Nodes)
	if err != nil {
		return nil, err
	}
	modals, err := NodesToProto(page.Modals)
	if err != nil {
		return nil, fmt.Errorf("modals: %w", err)
	}
	drawers, err := NodesToProto(page.Drawers)
	if err != nil {
		return nil, fmt.Errorf("drawers: %w", err)
	}
	var meta *structpb.Struct
	if page.Meta.StoryTitle != "" || len(page.Meta.Tags) > 0 || page.Meta.Source != "" || len(page.Meta.Notes) > 0 {
		m := map[string]any{}
		if page.Meta.StoryTitle != "" {
			m["storyTitle"] = page.Meta.StoryTitle
		}
		if len(page.Meta.Tags) > 0 {
			m["tags"] = page.Meta.Tags
		}
		if page.Meta.Source != "" {
			m["source"] = page.Meta.Source
		}
		if len(page.Meta.Notes) > 0 {
			m["notes"] = page.Meta.Notes
		}
		var err error
		meta, err = structpb.NewStruct(m)
		if err != nil {
			return nil, fmt.Errorf("page meta: %w", err)
		}
	}
	shell, err := ShellToProto(page.Shell)
	if err != nil {
		return nil, err
	}
	schemaVersion, err := uint32FromInt("page schemaVersion", page.SchemaVersion)
	if err != nil {
		return nil, err
	}

	return &admindslv1.AdminPage{
		SchemaVersion: schemaVersion,
		Id:            page.ID,
		Title:         page.Title,
		Description:   page.Description,
		Shell:         shell,
		Nodes:         nodes,
		Modals:        modals,
		Drawers:       drawers,
		Meta:          meta,
	}, nil
}

func ShellToProto(shell Shell) (*admindslv1.AdminShell, error) {
	props, err := structFromObject(shell.Props)
	if err != nil {
		return nil, fmt.Errorf("shell props: %w", err)
	}
	return &admindslv1.AdminShell{Kind: string(shell.Kind), Props: props}, nil
}

func NodesToProto(nodes []Node) ([]*admindslv1.AdminNode, error) {
	out := make([]*admindslv1.AdminNode, 0, len(nodes))
	for _, node := range nodes {
		protoNode, err := NodeToProto(node)
		if err != nil {
			return nil, err
		}
		out = append(out, protoNode)
	}
	return out, nil
}

func NodeToProto(node Node) (*admindslv1.AdminNode, error) {
	children, err := NodesToProto(node.Children)
	if err != nil {
		return nil, fmt.Errorf("node %q children: %w", node.Kind, err)
	}
	props, err := structFromObject(node.Props)
	if err != nil {
		return nil, fmt.Errorf("node %q props: %w", node.Kind, err)
	}
	return &admindslv1.AdminNode{Kind: string(node.Kind), Props: props, Children: children, Meta: NodeMetaToProto(node.Meta)}, nil
}

func NodeMetaToProto(meta *NodeMeta) *admindslv1.AdminNodeMeta {
	if meta == nil {
		return nil
	}
	return &admindslv1.AdminNodeMeta{
		Id:            meta.ID,
		Name:          meta.Name,
		DataComponent: meta.DataComponent,
		DataSection:   meta.DataSection,
		DataPart:      meta.DataPart,
		Note:          meta.Note,
		Region:        string(meta.Region),
	}
}

func FlowStateFromResult(result *FlowResult) (*admindslv1.AdminFlowState, error) {
	page, err := PageToProto(result.Page)
	if err != nil {
		return nil, err
	}
	effects := make([]*admindslv1.AdminEffect, 0, len(result.Effects))
	for _, effect := range result.Effects {
		effects = append(effects, &admindslv1.AdminEffect{Kind: effect.Kind, Tone: effect.Tone, Message: effect.Message})
	}
	pageVersion, err := uint32FromInt64("pageVersion", result.PageVersion)
	if err != nil {
		return nil, err
	}
	return &admindslv1.AdminFlowState{SessionId: result.SessionID, PageVersion: pageVersion, Page: page, Effects: effects}, nil
}

func uint32FromInt(field string, value int) (uint32, error) {
	if value < 0 || value > math.MaxUint32 {
		return 0, fmt.Errorf("%s must fit uint32, got %d", field, value)
	}
	return uint32(value), nil
}

func uint32FromInt64(field string, value int64) (uint32, error) {
	if value < 0 || value > math.MaxUint32 {
		return 0, fmt.Errorf("%s must fit uint32, got %d", field, value)
	}
	return uint32(value), nil
}

func InteractionEventFromProto(event *admindslv1.AdminInteractionEvent) FlowEvent {
	if event == nil {
		return FlowEvent{}
	}
	var value any
	if event.Value != nil {
		value = event.Value.AsInterface()
	}
	return FlowEvent{EventID: event.EventId, PageVersion: int64(event.PageVersion), ActionID: event.ActionId, Value: value}
}

func structFromObject(obj JSONObject) (*structpb.Struct, error) {
	if len(obj) == 0 {
		return nil, nil
	}
	return structpb.NewStruct(map[string]any(obj))
}
