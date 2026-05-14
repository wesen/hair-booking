package dslgoja

import (
	"context"
	"testing"
)

func TestDemoIntakeFlowStartsOnServiceStep(t *testing.T) {
	rt := NewRuntime()
	session, result, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "intake-service" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if result.Page.Shell.Kind != "intake" {
		t.Fatalf("shell kind = %q", result.Page.Shell.Kind)
	}
	if len(result.Page.Nodes) != 4 {
		t.Fatalf("node count = %d", len(result.Page.Nodes))
	}
	if result.Page.Nodes[1].Meta == nil || result.Page.Nodes[1].Meta.ID != "category-tabs" {
		t.Fatalf("category node meta = %#v", result.Page.Nodes[1].Meta)
	}
	if result.Page.Nodes[2].Meta == nil || result.Page.Nodes[2].Meta.ID != "service-options" {
		t.Fatalf("service node meta = %#v", result.Page.Nodes[2].Meta)
	}
	if result.Page.Nodes[3].Meta == nil || result.Page.Nodes[3].Meta.ID != "stylist-context" || result.Page.Nodes[3].Meta.Region != "context" {
		t.Fatalf("stylist node meta = %#v", result.Page.Nodes[3].Meta)
	}
	if len(session.CurrentActions) != 11 {
		t.Fatalf("registered actions = %d, want 11 (setCategory, setService, next, skip, + 7 goto)", len(session.CurrentActions))
	}
}

func TestDemoIntakeFlowCanStartOnColorStepFromState(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	state := session.state.ToObject(session.VM)
	if err := state.Set("step", "color"); err != nil {
		t.Fatalf("set step: %v", err)
	}
	result, err := session.Render(context.Background())
	if err != nil {
		t.Fatalf("render color: %v", err)
	}
	if result.Page.ID != "intake-color" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if len(result.Page.Nodes) != 4 {
		t.Fatalf("node count = %d", len(result.Page.Nodes))
	}
	if result.Page.Nodes[0].Meta == nil || result.Page.Nodes[0].Meta.ID != "tone-chips" {
		t.Fatalf("tone node meta = %#v", result.Page.Nodes[0].Meta)
	}
	if result.Page.Nodes[1].Meta == nil || result.Page.Nodes[1].Meta.ID != "damage-rating" {
		t.Fatalf("damage node meta = %#v", result.Page.Nodes[1].Meta)
	}
	if result.Page.Nodes[2].Meta == nil || result.Page.Nodes[2].Meta.ID != "stylist-context" || result.Page.Nodes[2].Meta.Region != "context" {
		t.Fatalf("stylist node meta = %#v", result.Page.Nodes[2].Meta)
	}
	if result.Page.Nodes[3].Meta == nil || result.Page.Nodes[3].Meta.ID != "step-summary" || result.Page.Nodes[3].Meta.Region != "context" {
		t.Fatalf("summary node meta = %#v", result.Page.Nodes[3].Meta)
	}
}

func TestDemoIntakeFlowShellStepsIncludeNavigationActions(t *testing.T) {
	 rt := NewRuntime()
	 session, result, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	 if err != nil {
		 t.Fatalf("StartFlow: %v", err)
	 }
	 shellProps := result.Page.Shell.Props
	 if shellProps == nil {
		 t.Fatal("shell props is nil")
	 }
	 stepsRaw, ok := shellProps["steps"]
	 if !ok {
		 t.Fatal("shell.props.steps missing")
	 }
	 steps, ok := stepsRaw.([]any)
	 if !ok {
		 t.Fatalf("shell.props.steps type = %T", stepsRaw)
	 }
	 if len(steps) != 7 {
		 t.Fatalf("steps count = %d, want 7", len(steps))
	 }
	 // First step should be current, have a goto action
	 step0, _ := steps[0].(map[string]any)
	 if step0["current"] != true {
		 t.Fatalf("step[0].current = %v, want true", step0["current"])
	 }
	 if step0["id"] != "service" {
		 t.Fatalf("step[0].id = %v", step0["id"])
	 }
	 // Check every step has actions.select
	 for i, s := range steps {
		 sm, _ := s.(map[string]any)
		 actions, _ := sm["actions"].(map[string]any)
		 if actions == nil || actions["select"] == nil {
			 t.Fatalf("step[%d].actions.select missing", i)
		 }
	 }
	 // Dispatch goto:budget action → page should become intake-budget
	 actionID, _ := steps[3].(map[string]any)["actions"].(map[string]any)["select"].(map[string]any)["id"].(string)
	 if actionID == "" {
		 t.Fatal("step[3] (budget) has no action id")
	 }

	 dispatchResult, err := session.Dispatch(context.Background(), InteractionEvent{
		 EventID:   "test-1",
		 PageVersion: result.PageVersion,
		 NodeID:    "shell.step.budget",
		 NodeKind:  "intakeShell",
		 ActionID:  actionID,
		 Event:     "goto",
		 Value:     "budget",
	 })
	 if err != nil {
		 t.Fatalf("dispatch goto:budget: %v", err)
	 }
	 if dispatchResult.Page.ID != "intake-budget" {
		 t.Fatalf("after goto:budget, page id = %q, want intake-budget", dispatchResult.Page.ID)
	 }
	 // Verify step 4 (budget) is now current in shell.steps
	 dispatchSteps, _ := dispatchResult.Page.Shell.Props["steps"].([]any)
	 budgetStep, _ := dispatchSteps[3].(map[string]any)
	 if budgetStep["current"] != true {
		 t.Fatalf("after goto:budget, step[3].current = %v, want true", budgetStep["current"])
	 }
}


func TestDemoIntakeFlowPhotosStepCreatesUploadIntents(t *testing.T) {
	rt := NewRuntime()
	session, _, err := rt.StartFlow(context.Background(), "fringe.intake.v1", DemoIntakeFlowSource)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	// Navigate to photos step via state
	state := session.state.ToObject(session.VM)
	if err := state.Set("step", "photos"); err != nil {
		t.Fatalf("set step: %v", err)
	}
	result, err := session.Render(context.Background())
	if err != nil {
		t.Fatalf("render photos: %v", err)
	}
	if result.Page.ID != "intake-photos" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	// Find the photo-grid node
	var gridNode *Node
	for i := range result.Page.Nodes {
		if result.Page.Nodes[i].Meta != nil && result.Page.Nodes[i].Meta.ID == "photo-grid" {
			gridNode = &result.Page.Nodes[i]
			break
		}
	}
	if gridNode == nil {
		t.Fatal("photo-grid node not found")
	}
	if len(gridNode.Children) != 3 {
		t.Fatalf("photo-grid children = %d, want 3", len(gridNode.Children))
	}
	for i, child := range gridNode.Children {
		upload, _ := child.Props["upload"].(map[string]any)
		if upload == nil {
			t.Fatalf("photo-grid child[%d] missing upload prop", i)
		}
		if _, ok := upload["url"]; !ok {
			t.Fatalf("photo-grid child[%d] upload missing url", i)
		}
		if _, ok := upload["uploadId"]; !ok {
			t.Fatalf("photo-grid child[%d] upload missing uploadId", i)
		}
		slot, _ := upload["slot"].(string)
		if slot == "" {
			t.Fatalf("photo-grid child[%d] upload missing slot", i)
		}
	}
	// Verify upload intents are registered in the session
	if len(session.UploadIntents) < 3 {
		t.Fatalf("upload intents = %d, want >= 3", len(session.UploadIntents))
	}
}
