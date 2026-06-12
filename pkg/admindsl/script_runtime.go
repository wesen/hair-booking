package admindsl

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/dop251/goja"
	"github.com/dop251/goja_nodejs/require"
	"github.com/google/uuid"
)

const defaultScriptCallbackTimeout = 2 * time.Second

type NativeModuleLoader func(*goja.Runtime, *goja.Object)

type ScriptRuntime struct {
	callbackTimeout time.Duration
	nativeModules   map[string]NativeModuleLoader
	scriptModules   map[string]string
}

type ScriptRuntimeOption func(*ScriptRuntime)

func WithScriptCallbackTimeout(timeout time.Duration) ScriptRuntimeOption {
	return func(rt *ScriptRuntime) { rt.callbackTimeout = timeout }
}

func WithNativeModule(name string, loader NativeModuleLoader) ScriptRuntimeOption {
	return func(rt *ScriptRuntime) {
		if rt.nativeModules == nil {
			rt.nativeModules = map[string]NativeModuleLoader{}
		}
		rt.nativeModules[name] = loader
	}
}

func WithScriptModule(name string, source string) ScriptRuntimeOption {
	return func(rt *ScriptRuntime) {
		if rt.scriptModules == nil {
			rt.scriptModules = map[string]string{}
		}
		rt.scriptModules[normalizeScriptModulePath(name)] = source
	}
}

func NewScriptRuntime(options ...ScriptRuntimeOption) *ScriptRuntime {
	rt := &ScriptRuntime{callbackTimeout: defaultScriptCallbackTimeout, nativeModules: map[string]NativeModuleLoader{}, scriptModules: map[string]string{}}
	for _, option := range options {
		option(rt)
	}
	return rt
}

type ScriptSession struct {
	ID      string
	FlowID  string
	Version int64

	VM             *goja.Runtime
	flow           *goja.Object
	state          goja.Value
	page           Page
	actions        map[string]scriptActionRegistration
	retiredActions map[string]scriptActionRegistration
	activeTx       *scriptRenderTransaction
	mu             sync.Mutex
	rt             *ScriptRuntime
}

type scriptActionRegistration struct {
	ID       string
	Target   string
	Event    string
	Version  int64
	Callback goja.Callable
}

type scriptRenderTransaction struct {
	NextActions map[string]scriptActionRegistration
}

func (rt *ScriptRuntime) StartFlow(ctx context.Context, flowID, source string) (*ScriptSession, *FlowResult, error) {
	return rt.StartFlowNamed(ctx, flowID, "/flows/"+flowID+".flow.js", source)
}

func (rt *ScriptRuntime) StartFlowNamed(ctx context.Context, flowID, sourceName, source string) (*ScriptSession, *FlowResult, error) {
	session, err := rt.newSession(flowID, "admin_"+uuid.NewString())
	if err != nil {
		return nil, nil, err
	}
	if err := rt.loadFlowSource(session, sourceName, source); err != nil {
		return nil, nil, err
	}
	if initialState, ok := goja.AssertFunction(session.flow.Get("initialState")); ok {
		state, err := rt.callWithTimeout(ctx, session, initialState, goja.Undefined())
		if err != nil {
			return nil, nil, fmt.Errorf("initialState: %w", err)
		}
		session.state = state
	} else {
		session.state = session.VM.NewObject()
	}
	result, err := session.Render(ctx)
	if err != nil {
		return nil, nil, err
	}
	return session, result, nil
}

func (rt *ScriptRuntime) newSession(flowID, sessionID string) (*ScriptSession, error) {
	vm := goja.New()
	registry := require.NewRegistry(require.WithLoader(rt.scriptModuleSource), require.WithPathResolver(resolveScriptModulePath))
	registry.RegisterNativeModule("fringe/admin-dsl", loadAdminDSLModule)
	for name, loader := range rt.nativeModules {
		registry.RegisterNativeModule(name, require.ModuleLoader(loader))
	}
	for name, source := range rt.scriptModules {
		registry.RegisterNativeModule(name, loadScriptModuleSource(name, source))
	}
	registry.Enable(vm)
	return &ScriptSession{
		ID:             sessionID,
		FlowID:         flowID,
		VM:             vm,
		actions:        map[string]scriptActionRegistration{},
		retiredActions: map[string]scriptActionRegistration{},
		rt:             rt,
	}, nil
}

func loadAdminDSLModule(vm *goja.Runtime, moduleObj *goja.Object) {
	exports := moduleObj.Get("exports").(*goja.Object)
	for name, value := range GojaModule() {
		_ = exports.Set(name, value)
	}
}

func loadScriptModuleSource(name, source string) require.ModuleLoader {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		value, err := vm.RunScript(normalizeScriptModulePath(name), "(function(module, exports){\n"+source+"\n})")
		if err != nil {
			panic(vm.ToValue(fmt.Sprintf("load admin script module %q: %v", name, err)))
		}
		fn, ok := goja.AssertFunction(value)
		if !ok {
			panic(vm.ToValue(fmt.Sprintf("admin script module %q did not compile to a function", name)))
		}
		if _, err := fn(goja.Undefined(), moduleObj, moduleObj.Get("exports")); err != nil {
			panic(vm.ToValue(fmt.Sprintf("execute admin script module %q: %v", name, err)))
		}
	}
}

func (rt *ScriptRuntime) scriptModuleSource(name string) ([]byte, error) {
	if rt == nil || rt.scriptModules == nil {
		return nil, require.ModuleFileDoesNotExistError
	}
	if source, ok := rt.scriptModules[normalizeScriptModulePath(name)]; ok {
		return []byte(source), nil
	}
	return nil, require.ModuleFileDoesNotExistError
}

func normalizeScriptModulePath(name string) string {
	name = strings.TrimSpace(name)
	if name == "" || name == "." {
		return "."
	}
	name = path.Clean(strings.ReplaceAll(name, "\\", "/"))
	return name
}

func resolveScriptModulePath(base, request string) string {
	request = strings.ReplaceAll(request, "\\", "/")
	if strings.HasPrefix(request, ".") || strings.HasPrefix(request, "/") {
		return normalizeScriptModulePath(path.Join(base, request))
	}
	return normalizeScriptModulePath(request)
}

func (rt *ScriptRuntime) loadFlowSource(session *ScriptSession, sourceName, source string) error {
	value, err := session.VM.RunScript(normalizeScriptModulePath(sourceName), "(function(){\n"+source+"\n; return { initialState: (typeof initialState === 'function' ? initialState : undefined), render: render };\n})()")
	if err != nil {
		return fmt.Errorf("load admin flow %q: %w", session.FlowID, err)
	}
	session.flow = value.ToObject(session.VM)
	return nil
}

func (s *ScriptSession) Render(ctx context.Context) (*FlowResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.renderLocked(ctx, nil)
}

func (s *ScriptSession) Dispatch(ctx context.Context, event FlowEvent) (*FlowResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if event.PageVersion != s.Version {
		return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: s.page, Effects: []FlowEffect{{Kind: "toast", Tone: "info", Message: "This admin page was already updated."}}}, nil
	}
	action, ok := s.actions[event.ActionID]
	if !ok {
		if _, retired := s.retiredActions[event.ActionID]; retired {
			return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: s.page, Effects: []FlowEffect{{Kind: "toast", Tone: "info", Message: "This admin action is no longer active."}}}, nil
		}
		return nil, fmt.Errorf("unknown admin action %q", event.ActionID)
	}
	tx := &scriptRenderTransaction{NextActions: map[string]scriptActionRegistration{}}
	s.activeTx = tx
	defer func() { s.activeTx = nil }()
	value, err := s.rt.callWithTimeout(ctx, s, action.Callback, goja.Undefined(), s.VM.ToValue(eventObject(s.ID, event)))
	if err != nil {
		return s.errorResult(err), nil
	}
	page, err := exportScriptPage(s.VM, value)
	if err != nil {
		return s.errorResult(fmt.Errorf("export callback page: %w", err)), nil
	}
	return s.commitRenderTransaction(tx, page, nil)
}

func (s *ScriptSession) Snapshot() (int64, Page) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.Version, s.page
}

func (s *ScriptSession) renderLocked(ctx context.Context, effects []FlowEffect) (*FlowResult, error) {
	render, ok := goja.AssertFunction(s.flow.Get("render"))
	if !ok {
		return nil, fmt.Errorf("admin flow %q does not export render(ctx)", s.FlowID)
	}
	tx := &scriptRenderTransaction{NextActions: map[string]scriptActionRegistration{}}
	s.activeTx = tx
	defer func() { s.activeTx = nil }()
	value, err := s.rt.callWithTimeout(ctx, s, render, goja.Undefined(), s.contextObject())
	if err != nil {
		return nil, fmt.Errorf("render: %w", err)
	}
	page, err := exportScriptPage(s.VM, value)
	if err != nil {
		return nil, fmt.Errorf("export rendered page: %w", err)
	}
	return s.commitRenderTransaction(tx, page, effects)
}

func (s *ScriptSession) contextObject() *goja.Object {
	obj := s.VM.NewObject()
	_ = obj.Set("sessionId", s.ID)
	_ = obj.Set("flowId", s.FlowID)
	_ = obj.Set("state", s.state)
	_ = obj.Set("bind", func(call goja.FunctionCall) goja.Value {
		if s.activeTx == nil {
			panic(s.VM.ToValue("ctx.bind called outside render transaction"))
		}
		builder, ok := call.Argument(0).Export().(*ActionBuilder)
		if !ok || builder == nil {
			panic(s.VM.ToValue("ctx.bind(actionBuilder, callback[, event]) requires an Admin DSL action builder"))
		}
		callback, ok := goja.AssertFunction(call.Argument(1))
		if !ok {
			panic(s.VM.ToValue("ctx.bind(actionBuilder, callback[, event]) requires a callback"))
		}
		event := "click"
		if len(call.Arguments) >= 3 && !goja.IsUndefined(call.Argument(2)) && !goja.IsNull(call.Argument(2)) {
			event = call.Argument(2).String()
		}
		ref := builder.Build()
		id := "admin_act_" + uuid.NewString()
		ref.ID = id
		ref.Event = event
		s.activeTx.NextActions[id] = scriptActionRegistration{ID: id, Target: ref.Target, Event: event, Version: s.Version + 1, Callback: callback}
		return s.VM.ToValue(&ActionBuilder{ref: ref})
	})
	return obj
}

func (s *ScriptSession) commitRenderTransaction(tx *scriptRenderTransaction, page Page, effects []FlowEffect) (*FlowResult, error) {
	if page.SchemaVersion == 0 {
		page.SchemaVersion = 1
	}
	if page.Shell.Kind == "" {
		page.Shell.Kind = ShellAdmin
	}
	if page.Nodes == nil {
		page.Nodes = []Node{}
	}
	if err := ValidatePage(page); err != nil {
		return nil, fmt.Errorf("admin flow produced invalid page: %w", err)
	}
	for id, action := range s.actions {
		s.retiredActions[id] = action
	}
	s.Version++
	s.page = page
	s.actions = tx.NextActions
	return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: page, Effects: effects}, nil
}

func (s *ScriptSession) errorResult(err error) *FlowResult {
	return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: s.page, Effects: []FlowEffect{{Kind: "toast", Tone: "danger", Message: err.Error()}}}
}

func (rt *ScriptRuntime) callWithTimeout(ctx context.Context, session *ScriptSession, fn goja.Callable, this goja.Value, args ...goja.Value) (goja.Value, error) {
	if rt.callbackTimeout <= 0 {
		return fn(this, args...)
	}
	timer := time.AfterFunc(rt.callbackTimeout, func() { session.VM.Interrupt("admin goja callback timeout") })
	defer timer.Stop()
	select {
	case <-ctx.Done():
		session.VM.Interrupt(ctx.Err().Error())
	default:
	}
	return fn(this, args...)
}

func exportScriptPage(vm *goja.Runtime, value goja.Value) (Page, error) {
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
	b, err := json.Marshal(value.Export())
	if err != nil {
		return Page{}, err
	}
	var page Page
	if err := json.Unmarshal(b, &page); err != nil {
		return Page{}, err
	}
	return page, nil
}

func eventObject(sessionID string, event FlowEvent) map[string]any {
	return map[string]any{"eventId": event.EventID, "sessionId": sessionID, "pageVersion": event.PageVersion, "actionId": event.ActionID, "value": event.Value}
}
