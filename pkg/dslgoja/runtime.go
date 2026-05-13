package dslgoja

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/dop251/goja"
	"github.com/google/uuid"
)

const defaultCallbackTimeout = 2 * time.Second

type Runtime struct {
	callbackTimeout time.Duration
}

type RuntimeOption func(*Runtime)

func WithCallbackTimeout(timeout time.Duration) RuntimeOption {
	return func(rt *Runtime) {
		rt.callbackTimeout = timeout
	}
}

func NewRuntime(options ...RuntimeOption) *Runtime {
	rt := &Runtime{callbackTimeout: defaultCallbackTimeout}
	for _, option := range options {
		option(rt)
	}
	return rt
}

type FlowSession struct {
	ID      string
	FlowID  string
	Version int64

	VM          *goja.Runtime
	flow        *goja.Object
	state       goja.Value
	CurrentPage Page

	CurrentActions  map[string]ActionRegistration
	RetiredActions  map[string]RetiredActionInfo
	ProcessedEvents map[string]InteractionResult

	mu sync.Mutex
	rt *Runtime
}

type ActionRegistration struct {
	ID       string
	Name     string
	Event    string
	NodeID   string
	Version  int64
	Callback goja.Callable
}

type RetiredActionInfo struct {
	ID        string
	Name      string
	Event     string
	NodeID    string
	Version   int64
	RetiredAt time.Time
}

type renderTransaction struct {
	NextActions map[string]ActionRegistration
}

func (rt *Runtime) StartFlow(ctx context.Context, flowID, source string) (*FlowSession, *InteractionResult, error) {
	vm := goja.New()
	if err := installDSLModule(vm); err != nil {
		return nil, nil, fmt.Errorf("install DSL module: %w", err)
	}
	value, err := vm.RunString(wrapFlowSource(source))
	if err != nil {
		return nil, nil, fmt.Errorf("load flow %q: %w", flowID, err)
	}
	flow := value.ToObject(vm)

	session := &FlowSession{
		ID:             "flow_" + uuid.NewString(),
		FlowID:         flowID,
		VM:             vm,
		flow:           flow,
		CurrentActions:  map[string]ActionRegistration{},
		RetiredActions:  map[string]RetiredActionInfo{},
		ProcessedEvents: map[string]InteractionResult{},
		rt:              rt,
	}

	initialState, ok := goja.AssertFunction(flow.Get("initialState"))
	if ok {
		state, err := rt.callWithTimeout(ctx, session, initialState, goja.Undefined())
		if err != nil {
			return nil, nil, fmt.Errorf("initialState: %w", err)
		}
		session.state = state
	} else {
		session.state = vm.NewObject()
	}

	result, err := session.Render(ctx)
	if err != nil {
		return nil, nil, err
	}
	return session, result, nil
}

func (s *FlowSession) Render(ctx context.Context) (*InteractionResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.renderLocked(ctx)
}

func (s *FlowSession) renderLocked(ctx context.Context) (*InteractionResult, error) {
	render, ok := goja.AssertFunction(s.flow.Get("render"))
	if !ok {
		return nil, fmt.Errorf("flow %q does not export render(ctx)", s.FlowID)
	}

	tx := &renderTransaction{NextActions: map[string]ActionRegistration{}}
	ctxObj := s.newContextObject(tx)
	value, err := s.rt.callWithTimeout(ctx, s, render, goja.Undefined(), ctxObj)
	if err != nil {
		return nil, fmt.Errorf("render: %w", err)
	}

	page, err := exportPageValue(value)
	if err != nil {
		return nil, fmt.Errorf("export rendered page: %w", err)
	}
	if page.SchemaVersion == 0 {
		page.SchemaVersion = 1
	}
	if page.Shell.Kind == "" {
		page.Shell.Kind = "bare"
	}
	if page.Nodes == nil {
		page.Nodes = []Node{}
	}

	return s.commitRenderTransaction(tx, page, nil), nil
}

func (s *FlowSession) commitRenderTransaction(tx *renderTransaction, page Page, effects []Effect) *InteractionResult {
	now := time.Now()
	for id, action := range s.CurrentActions {
		s.RetiredActions[id] = RetiredActionInfo{
			ID:        action.ID,
			Name:      action.Name,
			Event:     action.Event,
			NodeID:    action.NodeID,
			Version:   action.Version,
			RetiredAt: now,
		}
	}

	s.Version++
	s.CurrentPage = page
	s.CurrentActions = tx.NextActions
	return &InteractionResult{SessionID: s.ID, PageVersion: s.Version, Page: page, Effects: effects}
}

func (s *FlowSession) newContextObject(tx *renderTransaction) *goja.Object {
	obj := s.VM.NewObject()
	_ = obj.Set("sessionId", s.ID)
	_ = obj.Set("flowId", s.FlowID)
	_ = obj.Set("state", s.state)
	_ = obj.Set("action", func(call goja.FunctionCall) goja.Value {
		name := call.Argument(0).String()
		callback, ok := goja.AssertFunction(call.Argument(1))
		if !ok {
			panic(s.VM.ToValue("ctx.action(name, callback[, event]) requires a function callback"))
		}
		event := name
		if len(call.Arguments) >= 3 && !goja.IsUndefined(call.Argument(2)) && !goja.IsNull(call.Argument(2)) {
			event = call.Argument(2).String()
		}
		id := "act_" + uuid.NewString()
		tx.NextActions[id] = ActionRegistration{ID: id, Name: name, Event: event, Version: s.Version + 1, Callback: callback}

		ref := s.VM.NewObject()
		_ = ref.Set("id", id)
		_ = ref.Set("event", event)
		return ref
	})
	return obj
}

func (rt *Runtime) callWithTimeout(ctx context.Context, session *FlowSession, fn goja.Callable, this goja.Value, args ...goja.Value) (goja.Value, error) {
	if rt.callbackTimeout <= 0 {
		return fn(this, args...)
	}

	timer := time.AfterFunc(rt.callbackTimeout, func() {
		session.VM.Interrupt("goja callback timeout")
	})
	defer timer.Stop()

	select {
	case <-ctx.Done():
		session.VM.Interrupt(ctx.Err().Error())
	default:
	}

	value, err := fn(this, args...)
	if err != nil {
		return nil, err
	}
	return value, nil
}

func exportPageValue(value goja.Value) (Page, error) {
	exported := value.Export()
	b, err := json.Marshal(exported)
	if err != nil {
		return Page{}, err
	}
	var page Page
	if err := json.Unmarshal(b, &page); err != nil {
		return Page{}, err
	}
	return page, nil
}

func wrapFlowSource(source string) string {
	return "(function(){\n" + source + "\n; return { initialState: (typeof initialState === 'function' ? initialState : undefined), render: render };\n})()"
}
