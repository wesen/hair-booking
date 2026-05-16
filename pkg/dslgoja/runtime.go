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
	host            RuntimeHost
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
	UploadIntents   map[string]UploadIntent
	Uploads         map[string]UploadedImage
	User            UserSnapshot
	activeTx        *renderTransaction

	mu sync.Mutex
	rt *Runtime
}

func (s *FlowSession) Snapshot() (int64, Page) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.Version, s.CurrentPage
}

func (s *FlowSession) StateJSON() ([]byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.stateJSONLocked()
}

func (s *FlowSession) stateJSONLocked() ([]byte, error) {
	if s.state == nil || goja.IsUndefined(s.state) || goja.IsNull(s.state) {
		return []byte("{}"), nil
	}
	return json.Marshal(s.state.Export())
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

func (rt *Runtime) StartFlow(ctx context.Context, flowID, source string, options ...StartFlowOption) (*FlowSession, *InteractionResult, error) {
	startOptions := StartFlowOptions{}
	for _, option := range options {
		if option != nil {
			option(&startOptions)
		}
	}

	session, err := rt.newFlowSession(flowID, "flow_"+uuid.NewString(), startOptions.User)
	if err != nil {
		return nil, nil, err
	}
	if err := rt.loadFlowSource(session, source); err != nil {
		return nil, nil, err
	}

	initialState, ok := goja.AssertFunction(session.flow.Get("initialState"))
	if ok {
		state, err := rt.callWithTimeout(ctx, session, initialState, goja.Undefined())
		if err != nil {
			return nil, nil, fmt.Errorf("initialState: %w", err)
		}
		session.state = state
	} else {
		session.state = session.VM.NewObject()
	}
	if len(startOptions.InitialState) > 0 {
		mergeStateObject(session.VM, session.state, startOptions.InitialState)
	}

	result, err := session.Render(ctx)
	if err != nil {
		return nil, nil, err
	}
	return session, result, nil
}

func (rt *Runtime) ResumeFlow(ctx context.Context, flowID, source string, options ResumeFlowOptions) (*FlowSession, *InteractionResult, error) {
	if options.SessionID == "" {
		return nil, nil, fmt.Errorf("resume flow %q: session id is required", flowID)
	}
	session, err := rt.newFlowSession(flowID, options.SessionID, options.User)
	if err != nil {
		return nil, nil, err
	}
	session.Version = options.PreviousPageVersion
	if err := rt.loadFlowSource(session, source); err != nil {
		return nil, nil, err
	}

	if len(options.StateJSON) > 0 {
		var state any
		if err := json.Unmarshal(options.StateJSON, &state); err != nil {
			return nil, nil, fmt.Errorf("resume flow %q: decode state JSON: %w", flowID, err)
		}
		session.state = session.VM.ToValue(state)
	} else {
		session.state = session.VM.NewObject()
	}

	result, err := session.Render(ctx)
	if err != nil {
		return nil, nil, err
	}
	return session, result, nil
}

func (rt *Runtime) newFlowSession(flowID, sessionID string, user UserSnapshot) (*FlowSession, error) {
	vm := goja.New()
	session := &FlowSession{
		ID:              sessionID,
		FlowID:          flowID,
		VM:              vm,
		CurrentActions:  map[string]ActionRegistration{},
		RetiredActions:  map[string]RetiredActionInfo{},
		ProcessedEvents: map[string]InteractionResult{},
		UploadIntents:   map[string]UploadIntent{},
		Uploads:         map[string]UploadedImage{},
		User:            user,
		rt:              rt,
	}
	session.User = session.User.WithSessionID(session.ID)
	if err := rt.installModules(vm, session); err != nil {
		return nil, fmt.Errorf("install DSL modules: %w", err)
	}
	return session, nil
}

func mergeStateObject(vm *goja.Runtime, state goja.Value, values map[string]any) {
	obj := state.ToObject(vm)
	for key, value := range values {
		_ = obj.Set(key, value)
	}
}

func (rt *Runtime) loadFlowSource(session *FlowSession, source string) error {
	value, err := session.VM.RunString(wrapFlowSource(source))
	if err != nil {
		return fmt.Errorf("load flow %q: %w", session.FlowID, err)
	}
	session.flow = value.ToObject(session.VM)
	return nil
}

func (s *FlowSession) Render(ctx context.Context) (*InteractionResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.renderLocked(ctx)
}

func (s *FlowSession) Dispatch(ctx context.Context, event InteractionEvent) (*InteractionResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if cached, ok := s.ProcessedEvents[event.EventID]; ok {
		return &cached, nil
	}
	if event.PageVersion != s.Version {
		return s.stalePageResult("This page was already updated."), nil
	}
	action, ok := s.CurrentActions[event.ActionID]
	if !ok {
		if _, retired := s.RetiredActions[event.ActionID]; retired {
			return s.stalePageResult("This action is no longer active."), nil
		}
		return nil, fmt.Errorf("unknown action %q", event.ActionID)
	}
	if action.NodeID != "" && event.NodeID != "" && action.NodeID != event.NodeID {
		return nil, fmt.Errorf("action %q belongs to node %q, got %q", action.ID, action.NodeID, event.NodeID)
	}

	tx := &renderTransaction{NextActions: map[string]ActionRegistration{}}
	s.activeTx = tx
	defer func() { s.activeTx = nil }()

	jsEvent := s.VM.ToValue(interactionEventObject(event))
	value, err := s.rt.callWithTimeout(ctx, s, action.Callback, goja.Undefined(), jsEvent)
	if err != nil {
		return s.errorResult(err), nil
	}
	page, err := exportPageValue(s.VM, value)
	if err != nil {
		return s.errorResult(fmt.Errorf("export callback page: %w", err)), nil
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

	result := s.commitRenderTransaction(tx, page, nil)
	if event.EventID != "" {
		s.ProcessedEvents[event.EventID] = *result
	}
	return result, nil
}

func (s *FlowSession) renderLocked(ctx context.Context) (*InteractionResult, error) {
	render, ok := goja.AssertFunction(s.flow.Get("render"))
	if !ok {
		return nil, fmt.Errorf("flow %q does not export render(ctx)", s.FlowID)
	}

	tx := &renderTransaction{NextActions: map[string]ActionRegistration{}}
	s.activeTx = tx
	defer func() { s.activeTx = nil }()
	ctxObj := s.newContextObject()
	value, err := s.rt.callWithTimeout(ctx, s, render, goja.Undefined(), ctxObj)
	if err != nil {
		return nil, fmt.Errorf("render: %w", err)
	}

	page, err := exportPageValue(s.VM, value)
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

func (s *FlowSession) stalePageResult(message string) *InteractionResult {
	return &InteractionResult{
		SessionID:   s.ID,
		PageVersion: s.Version,
		Page:        s.CurrentPage,
		Effects: []Effect{{
			Kind:    "toast",
			Tone:    "info",
			Message: message,
		}},
	}
}

func (s *FlowSession) errorResult(err error) *InteractionResult {
	return &InteractionResult{
		SessionID:   s.ID,
		PageVersion: s.Version,
		Page:        s.CurrentPage,
		Effects: []Effect{{
			Kind:    "toast",
			Tone:    "danger",
			Message: err.Error(),
		}},
	}
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

func (s *FlowSession) newContextObject() *goja.Object {
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
		if s.activeTx == nil {
			panic(s.VM.ToValue("ctx.action called outside render transaction"))
		}
		id := "act_" + uuid.NewString()
		s.activeTx.NextActions[id] = ActionRegistration{ID: id, Name: name, Event: event, Version: s.Version + 1, Callback: callback}

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

func interactionEventObject(event InteractionEvent) map[string]any {
	return map[string]any{
		"eventId":     event.EventID,
		"sessionId":   event.SessionID,
		"pageVersion": event.PageVersion,
		"nodeId":      event.NodeID,
		"nodeKind":    event.NodeKind,
		"actionId":    event.ActionID,
		"event":       event.Event,
		"value":       event.Value,
		"meta":        event.Meta,
	}
}

func exportPageValue(vm *goja.Runtime, value goja.Value) (Page, error) {
	if value != nil && !goja.IsNull(value) && !goja.IsUndefined(value) {
		obj := value.ToObject(vm)
		if toJSON, ok := goja.AssertFunction(obj.Get("toJSON")); ok {
			jsonValue, err := toJSON(value)
			if err != nil {
				return Page{}, err
			}
			value = jsonValue
		}
	}
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
