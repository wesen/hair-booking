package admindsl

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestGoHostBuilderEmitsStableAdminPageJSON(t *testing.T) {
	page, err := PageResource("services", "Services & pricing").
		Shell(ShellResource, JSONObject{"active": "services"}).
		Content(
			Section("Service menu", nil,
				ResourceList("services", JSONObject{"density": "comfortable"},
					ResourceRow("cut", JSONObject{"title": "Cut", "subtitle": "60 min · $80+"}).
						Actions(Open("service.edit", "Edit").Payload(JSONObject{"id": "cut"}).Placement(PlacementRow)),
				),
			),
		).
		Toolbar(Open("service.new", "Add service").Intent(IntentPrimary).Priority(PriorityPrimary).Placement(PlacementToolbar)).
		Drawers(
			Drawer("serviceEditor", JSONObject{"title": "Edit service", "open": true},
				Form("serviceForm", JSONObject{"dirty": true},
					FieldGroup("Basics", TextField("name", JSONObject{"label": "Name", "value": "Cut"})),
				).Actions(
					Primary("service.save", "Save").Placement(PlacementFooter),
					Secondary("service.cancel", "Cancel").Placement(PlacementFooter),
				),
			),
		).
		Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}

	data, err := json.MarshalIndent(page, "", "  ")
	if err != nil {
		t.Fatalf("marshal page: %v", err)
	}
	got := string(data)
	for _, want := range []string{
		`"schemaVersion": 1`,
		`"kind": "resource"`,
		`"kind": "toolbar"`,
		`"target": "service.edit"`,
		`"placement": "row"`,
		`"kind": "drawer"`,
		`"dirty": true`,
		`"target": "service.save"`,
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("expected JSON to contain %s\n%s", want, got)
		}
	}

	var roundTrip Page
	if err := json.Unmarshal(data, &roundTrip); err != nil {
		t.Fatalf("round trip JSON: %v", err)
	}
	if err := ValidatePage(roundTrip); err != nil {
		t.Fatalf("validate round trip: %v", err)
	}
}

func TestGoHostBuilderRejectsInvalidSchema(t *testing.T) {
	_, err := NewPage("broken", "Broken", ShellKind("unknown")).Build()
	if err == nil || !strings.Contains(err.Error(), "invalid shell kind") {
		t.Fatalf("expected invalid shell kind error, got %v", err)
	}

	_, err = PageAdmin("bad-action", "Bad action").Content(
		ResourceRow("row-1", nil).Actions(Action(ActionType("explode"), "thing", "Explode")),
	).Build()
	if err == nil || !strings.Contains(err.Error(), "invalid action type") {
		t.Fatalf("expected invalid action type error, got %v", err)
	}

	_, err = PageAdmin("bad-json", "Bad JSON").Content(
		Section("Bad", JSONObject{"callback": func() {}}),
	).Build()
	if err == nil || !strings.Contains(err.Error(), "non-json value") {
		t.Fatalf("expected non-json value error, got %v", err)
	}
}

func TestGoHostBuilderSupportsResourceAndFormLifecycle(t *testing.T) {
	page, err := PageResource("lifecycle", "Lifecycle").Content(
		ResourceList("services", JSONObject{"state": "empty", "emptyTitle": "No services"}),
		Form("serviceForm", JSONObject{"title": "Service"}, TextField("name", JSONObject{"label": "Name", "value": "Cut"})).
			State("dirty").Dirty(true).Values(JSONObject{"name": "Cut"}).Errors(JSONObject{"price": "Required"}).
			Submit(Primary("service.save", "Save")).Cancel(Secondary("service.cancel", "Cancel")),
	).Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	if page.Nodes[0].Props["state"] != "empty" {
		t.Fatalf("expected empty resource state, got %#v", page.Nodes[0].Props)
	}
	actions, ok := page.Nodes[1].Props["actions"].(map[string]any)
	if !ok {
		t.Fatalf("expected keyed form actions, got %T", page.Nodes[1].Props["actions"])
	}
	if actions["submit"].(map[string]any)["target"] != "service.save" {
		t.Fatalf("unexpected submit action: %#v", actions["submit"])
	}
}

func TestGoHostBuilderSupportsSurfaceNodes(t *testing.T) {
	page, err := PageAdmin("surfaces", "Surfaces").
		Content(InlinePanel("inline-help", JSONObject{"title": "Inline help"}, TextField("name", JSONObject{"label": "Name"}))).
		Drawers(Sheet("mobile-editor", JSONObject{"title": "Mobile editor", "open": true})).
		Modals(ConfirmDialog("delete-service", JSONObject{"title": "Delete service?", "tone": "danger"})).
		Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	if page.Nodes[0].Kind != NodeInlinePanel {
		t.Fatalf("expected inline panel, got %s", page.Nodes[0].Kind)
	}
	if page.Drawers[0].Kind != NodeSheet || page.Drawers[0].Props["presentation"] != "sheet" {
		t.Fatalf("expected sheet drawer, got %#v", page.Drawers[0])
	}
	if page.Modals[0].Kind != NodeConfirmDialog || page.Modals[0].Props["presentation"] != "confirm" {
		t.Fatalf("expected confirm modal, got %#v", page.Modals[0])
	}
}

func TestGoHostBuilderRejectsDuplicateSurfaceIDs(t *testing.T) {
	_, err := PageAdmin("duplicate-surfaces", "Duplicate surfaces").
		Drawers(Drawer("editor", nil), Sheet("editor", nil)).
		Build()
	if err == nil || !strings.Contains(err.Error(), "duplicate surface id") {
		t.Fatalf("expected duplicate surface id error, got %v", err)
	}
}

func TestGoHostBuilderSupportsKeyedActionMaps(t *testing.T) {
	page, err := PageCalendar("calendar", "Calendar").Content(
		NodeOf(NodeAppointmentBlock, JSONObject{"id": "appt-1"}).Action("open", Open("appointment.open", "Open")),
	).Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	actions, ok := page.Nodes[0].Props["actions"].(map[string]any)
	if !ok {
		t.Fatalf("expected cloned action map, got %T", page.Nodes[0].Props["actions"])
	}
	open, ok := actions["open"].(map[string]any)
	if !ok {
		t.Fatalf("expected open action object, got %T", actions["open"])
	}
	if open["target"] != "appointment.open" {
		t.Fatalf("unexpected target: %#v", open["target"])
	}
}
