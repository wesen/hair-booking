package admindsl

import (
	"fmt"
	"sync"

	"github.com/google/uuid"
)

type FlowState string

const (
	FlowStateIdle       FlowState = "idle"
	FlowStateSelected   FlowState = "selected"
	FlowStateDirty      FlowState = "dirty"
	FlowStatePending    FlowState = "pending"
	FlowStateValidation FlowState = "validation"
	FlowStateSaved      FlowState = "saved"
	FlowStateConfirm    FlowState = "confirm"
)

type FlowEvent struct {
	EventID     string
	PageVersion int64
	ActionID    string
	Value       JSONValue
}

type FlowResult struct {
	SessionID   string
	PageVersion int64
	Page        Page
	Effects     []FlowEffect
}

type FlowEffect struct {
	Kind    string `json:"kind"`
	Tone    string `json:"tone,omitempty"`
	Message string `json:"message,omitempty"`
}

type registeredAction struct {
	ID      string
	Target  string
	Version int64
}

// ServicesFlowSession is the Phase 14 backend-driven Admin DSL spike. It uses
// Go-host builders as the page construction authority and models the same core
// runtime invariants as the Goja intake runtime: page versions, opaque action
// ids, stale-action rejection, and render-after-dispatch state transitions.
type ServicesFlowSession struct {
	ID      string
	Version int64
	State   FlowState

	actions map[string]registeredAction
	page    Page
	mu      sync.Mutex
}

func NewServicesFlowSession() *ServicesFlowSession {
	return &ServicesFlowSession{ID: "admin_" + uuid.NewString(), State: FlowStateIdle, actions: map[string]registeredAction{}}
}

func (s *ServicesFlowSession) Start() (*FlowResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.renderLocked(nil)
}

func (s *ServicesFlowSession) Dispatch(event FlowEvent) (*FlowResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if event.PageVersion != s.Version {
		return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: s.page, Effects: []FlowEffect{{Kind: "toast", Tone: "info", Message: "This admin page was already updated."}}}, nil
	}
	action, ok := s.actions[event.ActionID]
	if !ok {
		return nil, fmt.Errorf("unknown admin action %q", event.ActionID)
	}
	s.apply(action.Target, event.Value)
	return s.renderLocked([]FlowEffect{{Kind: "toast", Tone: "success", Message: fmt.Sprintf("Handled %s", action.Target)}})
}

func (s *ServicesFlowSession) apply(target string, value JSONValue) {
	switch target {
	case "service.select", "service.edit":
		s.State = FlowStateSelected
	case "service.field.change":
		s.State = FlowStateDirty
	case "service.save":
		if obj, ok := value.(JSONObject); ok && obj["forceError"] == true {
			s.State = FlowStateValidation
			return
		}
		s.State = FlowStateSaved
	case "service.save.error":
		s.State = FlowStateValidation
	case "service.save.pending":
		s.State = FlowStatePending
	case "service.cancel":
		s.State = FlowStateIdle
	case "service.delete":
		s.State = FlowStateConfirm
	case "service.delete.confirm":
		s.State = FlowStateIdle
	default:
		s.State = FlowStateSelected
	}
}

func (s *ServicesFlowSession) renderLocked(effects []FlowEffect) (*FlowResult, error) {
	s.actions = map[string]registeredAction{}
	nextVersion := s.Version + 1
	page, err := s.buildPage(nextVersion)
	if err != nil {
		return nil, err
	}
	if err := ValidatePage(page); err != nil {
		return nil, fmt.Errorf("admin flow produced invalid page: %w", err)
	}
	s.Version = nextVersion
	s.page = page
	return &FlowResult{SessionID: s.ID, PageVersion: s.Version, Page: page, Effects: effects}, nil
}

func (s *ServicesFlowSession) action(version int64, builder *ActionBuilder, event string) *ActionBuilder {
	ref := builder.Build()
	id := "admin_act_" + uuid.NewString()
	ref.ID = id
	ref.Event = event
	s.actions[id] = registeredAction{ID: id, Target: ref.Target, Version: version}
	return &ActionBuilder{ref: ref}
}

func (s *ServicesFlowSession) buildPage(version int64) (Page, error) {
	state := s.State
	selected := state != FlowStateIdle
	pending := state == FlowStatePending
	validation := state == FlowStateValidation
	builder := PageResource("admin-services", "Services & pricing").
		Shell(ShellResource, JSONObject{"eyebrow": "Backend Admin DSL", "active": "services"}).
		Toolbar(s.action(version, Primary("service.create", "Add service").Placement(PlacementToolbar), "click")).
		Content(
			Section("Service menu", JSONObject{"description": "Backend-built Admin DSL page using Go host builders."},
				ResourceList("services", JSONObject{"state": "idle"},
					ResourceRow("cut", JSONObject{"title": "Cut", "subtitle": "60 min · $80+", "badge": map[bool]string{true: "Selected", false: "Published"}[selected], "tone": map[bool]string{true: "plum", false: "success"}[selected]}).
						Actions(
							s.action(version, Open("service.select", "Open").Placement(PlacementRow).Payload(JSONObject{"id": "cut"}), "click"),
							s.action(version, Danger("service.delete", "Delete").Placement(PlacementRow).Payload(JSONObject{"id": "cut"}), "click"),
						),
					ResourceRow("color", JSONObject{"title": "Color", "subtitle": "90 min · $140+", "badge": "Published", "tone": "success"}).
						Actions(s.action(version, Open("service.edit", "Edit").Placement(PlacementRow).Payload(JSONObject{"id": "color"}), "click")),
				),
			),
		)

	if selected {
		form := Form("serviceForm", JSONObject{"title": "Edit service", "state": string(state), "dirty": state == FlowStateDirty || validation, "pending": pending},
			FieldGroup("Basics",
				TextField("name", JSONObject{"label": "Name", "value": map[bool]string{true: "", false: "Cut"}[validation]}),
				TextField("price", JSONObject{"label": "Price", "value": "$80+"}),
			),
		).
			Values(JSONObject{"name": "Cut", "price": 80}).
			Submit(s.action(version, Primary("service.save", "Save").Placement(PlacementFooter).Loading(pending), "submit")).
			Cancel(s.action(version, Secondary("service.cancel", "Cancel").Placement(PlacementFooter).Disabled(pending), "click"))
		if validation {
			form.Errors(JSONObject{"name": "Name is required"})
		}
		builder.Drawers(Drawer("serviceEditor", JSONObject{"title": "Edit service", "open": true, "selectedId": "cut"}, form))
	}
	if state == FlowStateConfirm {
		builder.Modals(ConfirmDialog("deleteService", JSONObject{"title": "Delete Cut?", "body": "This mocked backend flow will return to the list.", "tone": "danger", "confirmLabel": "Delete"}).Actions(s.action(version, Danger("service.delete.confirm", "Delete").Placement(PlacementFooter), "confirm")))
	}
	return builder.Build()
}
