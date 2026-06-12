package dslgoja

import (
	"fmt"
	"math"

	dslv1 "github.com/go-go-golems/hair-booking/gen/proto/fringe/dsl/v1"
	"google.golang.org/protobuf/types/known/structpb"
)

func PageToProto(page Page) (*dslv1.Page, error) {
	nodes := make([]*dslv1.Node, 0, len(page.Nodes))
	for _, node := range page.Nodes {
		protoNode, err := NodeToProto(node)
		if err != nil {
			return nil, err
		}
		nodes = append(nodes, protoNode)
	}

	var meta *structpb.Struct
	if len(page.Meta) > 0 {
		var err error
		meta, err = structpb.NewStruct(page.Meta)
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

	return &dslv1.Page{
		SchemaVersion: schemaVersion,
		Id:            page.ID,
		Title:         page.Title,
		Description:   page.Description,
		Shell:         shell,
		Nodes:         nodes,
		Meta:          meta,
	}, nil
}

func ShellToProto(shell Shell) (*dslv1.Shell, error) {
	var props *structpb.Struct
	if len(shell.Props) > 0 {
		var err error
		props, err = structpb.NewStruct(shell.Props)
		if err != nil {
			return nil, fmt.Errorf("shell props: %w", err)
		}
	}
	return &dslv1.Shell{Kind: shell.Kind, Props: props}, nil
}

func NodeToProto(node Node) (*dslv1.Node, error) {
	children := make([]*dslv1.Node, 0, len(node.Children))
	for _, child := range node.Children {
		protoChild, err := NodeToProto(child)
		if err != nil {
			return nil, err
		}
		children = append(children, protoChild)
	}

	var props *structpb.Struct
	if len(node.Props) > 0 {
		var err error
		props, err = structpb.NewStruct(node.Props)
		if err != nil {
			return nil, fmt.Errorf("node %q props: %w", node.Kind, err)
		}
	}

	return &dslv1.Node{
		Kind:     node.Kind,
		Props:    props,
		Children: children,
		Meta:     NodeMetaToProto(node.Meta),
	}, nil
}

func NodeMetaToProto(meta *NodeMeta) *dslv1.NodeMeta {
	if meta == nil {
		return nil
	}
	return &dslv1.NodeMeta{
		Id:            meta.ID,
		Name:          meta.Name,
		DataComponent: meta.DataComponent,
		DataSection:   meta.DataSection,
		DataPart:      meta.DataPart,
		Note:          meta.Note,
		Region:        meta.Region,
	}
}

func EffectToProto(effect Effect) (*dslv1.Effect, error) {
	var payload *structpb.Struct
	if len(effect.Payload) > 0 {
		var err error
		payload, err = structpb.NewStruct(effect.Payload)
		if err != nil {
			return nil, fmt.Errorf("effect payload: %w", err)
		}
	}
	return &dslv1.Effect{
		Kind:    effect.Kind,
		Tone:    effect.Tone,
		Message: effect.Message,
		Payload: payload,
	}, nil
}

func FlowStateFromResult(result *InteractionResult) (*dslv1.FlowState, error) {
	page, err := PageToProto(result.Page)
	if err != nil {
		return nil, err
	}
	effects, err := EffectsToProto(result.Effects)
	if err != nil {
		return nil, err
	}
	pageVersion, err := uint32FromInt64("pageVersion", result.PageVersion)
	if err != nil {
		return nil, err
	}
	return &dslv1.FlowState{
		SessionId:   result.SessionID,
		PageVersion: pageVersion,
		Page:        page,
		Effects:     effects,
	}, nil
}

func FlowStateFromSnapshot(sessionID string, pageVersion int64, page Page) (*dslv1.FlowState, error) {
	protoPage, err := PageToProto(page)
	if err != nil {
		return nil, err
	}
	protoPageVersion, err := uint32FromInt64("pageVersion", pageVersion)
	if err != nil {
		return nil, err
	}
	return &dslv1.FlowState{
		SessionId:   sessionID,
		PageVersion: protoPageVersion,
		Page:        protoPage,
	}, nil
}

func EffectsToProto(effects []Effect) ([]*dslv1.Effect, error) {
	protoEffects := make([]*dslv1.Effect, 0, len(effects))
	for _, effect := range effects {
		protoEffect, err := EffectToProto(effect)
		if err != nil {
			return nil, err
		}
		protoEffects = append(protoEffects, protoEffect)
	}
	return protoEffects, nil
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

func InteractionEventFromProto(event *dslv1.InteractionEvent) InteractionEvent {
	if event == nil {
		return InteractionEvent{}
	}
	var value any
	if event.Value != nil {
		value = event.Value.AsInterface()
	}
	var meta map[string]any
	if event.Meta != nil {
		meta = event.Meta.AsMap()
	}
	return InteractionEvent{
		EventID:     event.EventId,
		SessionID:   event.SessionId,
		PageVersion: int64(event.PageVersion),
		NodeID:      event.NodeId,
		NodeKind:    event.NodeKind,
		ActionID:    event.ActionId,
		Event:       event.Event,
		Value:       value,
		Meta:        meta,
	}
}
