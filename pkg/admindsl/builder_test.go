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
