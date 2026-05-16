const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");
const preview = require("host/intake-preview");

function auditRows(events) {
  return (events || []).map(function(event) {
    return {
      id: event.id,
      at: event.createdAt || "—",
      actor: event.actorUserId || "system",
      role: event.actorRole || "—",
      entity: event.entityType + " · " + event.entityId,
      action: event.action
    };
  });
}

function auditScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const events = intakeAdmin.listAuditEvents(100);
  return admin.pageResource("admin-intake-audit", "Audit Log")
    .Shell("resource", { active: "audit", eyebrow: "Real Admin · Intake" })
    .Description("Review persisted admin mutation events for requests and config changes.")
    .Content(
      admin.toolbar().Actions(back),
      admin.section("Recent audit events", { description: "Rows are read from the app-owned admin_audit_events table." },
        admin.resourceTable("auditEvents", {
          columns: [
            { id: "at", label: "Created" },
            { id: "actor", label: "Actor" },
            { id: "role", label: "Role" },
            { id: "entity", label: "Entity" },
            { id: "action", label: "Action" }
          ],
          rows: auditRows(events),
          emptyTitle: "No audit events yet"
        })
      )
    )
    .MustBuild();
}

function healthScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const health = intakeAdmin.healthDiagnostics();
  return admin.pageDashboard("admin-intake-health", "Intake Health")
    .Shell("dashboard", { active: "health", eyebrow: "Real Admin · Intake" })
    .Description("Operational diagnostics for the persisted customer intake and Admin DSL backend.")
    .Content(
      admin.toolbar().Actions(back),
      admin.cardGrid({ columns: 4 },
        admin.metricCard("Status", health.ok ? "OK" : "Issue", { tone: health.ok ? "success" : "danger", caption: health.activeConfigId || "No active config" }),
        admin.metricCard("Requests", health.requestCount || 0, { tone: "plum", caption: "Persisted intake requests" }),
        admin.metricCard("Audit events", health.auditEventCount || 0, { tone: "success", caption: health.lastAuditAt || "No events" }),
        admin.metricCard("Draft configs", health.draftConfigCount || 0, { tone: health.draftConfigCount ? "warn" : "success", caption: "Unpublished drafts" })
      ),
      admin.section("Diagnostics", {},
        admin.diffView("healthDiagnostics", {
          title: "Runtime checks",
          body: "These checks are provided by host/intake-admin.healthDiagnostics().",
          changes: [
            { field: "State DB", before: "required", after: health.stateDbConfigured ? "configured" : "missing", tone: health.stateDbConfigured ? "success" : "danger" },
            { field: "Config DB", before: "required", after: health.configDbConfigured ? "configured" : "missing", tone: health.configDbConfigured ? "success" : "danger" },
            { field: "Active config", before: "required", after: health.activeConfigId || "missing", tone: health.activeConfigId ? "success" : "danger" }
          ]
        })
      )
    )
    .MustBuild();
}

function previewScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const result = preview.validateConfig("active");
  return admin.pageResource("admin-intake-preview", "Intake Preview")
    .Shell("resource", { active: "preview", eyebrow: "Real Admin · Intake" })
    .Description("First host/intake-preview spike. Full embedded customer preview is a later HAIR-041 component task.")
    .Content(
      admin.toolbar().Actions(back),
      admin.section("Validation", {},
        admin.summaryCard("Preview bridge", { body: result.ok ? "Preview host module is connected for " + result.configVersionId + "." : "Preview validation failed." }),
        admin.markdown("The next phase should render customer DSL pages for a selected draft config version.", {})
      )
    )
    .MustBuild();
}

module.exports = { auditScreen, healthScreen, previewScreen };
