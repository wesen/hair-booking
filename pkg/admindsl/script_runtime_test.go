package admindsl

import (
	"context"
	"strings"
	"testing"
)

const testAdminFlowSource = `
const admin = require("fringe/admin-dsl");

function initialState() {
  return { mode: "list" };
}

function render(ctx) {
  const state = ctx.state;
  const open = ctx.bind(admin.open("service.open", "Open").Placement("row"), function(event) {
    state.mode = "editing";
    return render(ctx);
  });
  const save = ctx.bind(admin.primary("service.save", "Save").Placement("formFooter"), function(event) {
    state.mode = "saved";
    return render(ctx);
  }, "submit");

  const page = admin.pageAdmin("services", "Services")
    .SchemaVersion(2)
    .Shell("admin", { eyebrow: "Test Admin" })
    .Content(
      admin.pageHeader({ title: "Services", description: "Test Admin" }),
      admin.dashboardGrid({ columns: { desktop: 12 } },
        admin.panel("Rows", { padding: "none", layout: { span: { desktop: 12 } } },
          admin.resourceTable("services", {
            columns: [{ id: "title", label: "Service" }],
            rows: [{ id: "cut", title: "Cut" }]
          }).Actions(open)
        )
      )
    );
  if (state.mode !== "list") {
    page.Drawers(admin.surface.drawer("editor", { title: "Editor", open: true },
      admin.form("serviceForm", { title: "Service" }).Submit(save)
    ));
  }
  return page.MustBuild();
}
`

func TestScriptRuntimeRenderDispatchAndStale(t *testing.T) {
	rt := NewScriptRuntime()
	session, initial, err := rt.StartFlow(context.Background(), "test.admin", testAdminFlowSource)
	if err != nil {
		t.Fatalf("start flow: %v", err)
	}
	if initial.Page.ID != "services" || len(initial.Page.Nodes) != 2 {
		t.Fatalf("unexpected initial page: %#v", initial.Page)
	}
	openID := firstActionID(t, initial.Page, "service.open")
	selected, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-open", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("dispatch open: %v", err)
	}
	if len(selected.Page.Drawers) != 1 {
		t.Fatalf("expected drawer after dispatch, got %#v", selected.Page.Drawers)
	}
	stale, err := session.Dispatch(context.Background(), FlowEvent{EventID: "evt-stale", PageVersion: initial.PageVersion, ActionID: openID})
	if err != nil {
		t.Fatalf("stale dispatch: %v", err)
	}
	if len(stale.Effects) != 1 || !strings.Contains(stale.Effects[0].Message, "already updated") {
		t.Fatalf("expected stale effect, got %#v", stale.Effects)
	}
}

func TestScriptRuntimeRejectsInvalidRenderedPage(t *testing.T) {
	rt := NewScriptRuntime()
	_, _, err := rt.StartFlow(context.Background(), "bad.admin", `function render(ctx) { return { schemaVersion: 2, id: "bad", title: "Bad", shell: { kind: "resource" }, nodes: [{ kind: "notReal" }] }; }`)
	if err == nil || !strings.Contains(err.Error(), "invalid node kind") {
		t.Fatalf("expected invalid node kind error, got %v", err)
	}
}

func TestScriptRuntimeLoadsScriptModules(t *testing.T) {
	rt := NewScriptRuntime(WithScriptModule("/flows/admin-helper.js", `
const admin = require("fringe/admin-dsl");
function helperPage() {
  return admin.pageAdmin("helper-page", "Helper Page")
    .SchemaVersion(2)
    .Content(
      admin.pageHeader({ title: "Helper Page" }),
      admin.dashboardGrid({ columns: { desktop: 12 } },
        admin.panel("From helper", { layout: { span: { desktop: 12 } } })
      )
    )
    .MustBuild();
}
module.exports = { helperPage };
`))
	_, result, err := rt.StartFlowNamed(context.Background(), "module.admin", "/flows/root.flow.js", `
const helper = require("./admin-helper.js");
function render(ctx) { return helper.helperPage(); }
`)
	if err != nil {
		t.Fatalf("start flow with helper module: %v", err)
	}
	if result.Page.ID != "helper-page" || len(result.Page.Nodes) != 2 {
		t.Fatalf("unexpected helper page: %#v", result.Page)
	}
}
