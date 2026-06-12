package dslgoja

import (
	"context"
	"testing"
)

const builderFlow = `
const { page, n } = require("fringe/dsl");

function initialState() {
  return { category: "color", tones: ["dimensional"] };
}

function render(ctx) {
  return page("builder-service", "Builder Service")
    .intake({
      step: 1,
      total: 2,
      title: "Build the visit",
      actions: {
        next: ctx.action("next", function(event) { return render(ctx); }, "next")
      }
    })
    .add(
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" }
      ], ctx.state.category, {
        actions: { change: ctx.action("setCategory", function(event) { ctx.state.category = event.value; return render(ctx); }, "change") }
      }).id("category-tabs"),
      n.chipGroup([
        { value: "neutral", label: "Neutral" },
        { value: "dimensional", label: "Dimensional" }
      ], ctx.state.tones, {
        label: "Tone family",
        actions: { change: ctx.action("setTones", function(event) { ctx.state.tones = event.value; return render(ctx); }, "change") }
      }).id("tone-chips")
    )
    .toJSON();
}
`

func TestFringeDSLModuleBuildsFrontendCompatiblePage(t *testing.T) {
	rt := NewRuntime()
	session, result, err := rt.StartFlow(context.Background(), "builder", builderFlow)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}

	if result.Page.ID != "builder-service" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
	if result.Page.Shell.Kind != "intake" {
		t.Fatalf("shell kind = %q", result.Page.Shell.Kind)
	}
	if len(result.Page.Nodes) != 2 {
		t.Fatalf("node count = %d", len(result.Page.Nodes))
	}
	if result.Page.Nodes[0].Meta == nil || result.Page.Nodes[0].Meta.ID != "category-tabs" {
		t.Fatalf("first node meta = %#v", result.Page.Nodes[0].Meta)
	}
	if result.Page.Nodes[1].Kind != "chipGroup" {
		t.Fatalf("second node kind = %q", result.Page.Nodes[1].Kind)
	}
	if len(session.CurrentActions) != 3 {
		t.Fatalf("registered actions = %d, want 3", len(session.CurrentActions))
	}
}

func TestFringeDSLModuleRejectsUnknownRequire(t *testing.T) {
	rt := NewRuntime()
	_, _, err := rt.StartFlow(context.Background(), "bad-require", `
const nope = require("nope");
function render(ctx) { return { schemaVersion: 1, id: "x", title: "x", shell: { kind: "bare" }, nodes: [] }; }
`)
	if err == nil {
		t.Fatalf("expected unknown require error")
	}
}
