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
  return admin.pageAdmin("admin-intake-audit", "Audit Log")
    .SchemaVersion(2)
    .Shell("admin", { active: "audit", eyebrow: "Real Admin · Intake" })
    .Description("Review persisted admin mutation events for requests and config changes.")
    .Content(
      admin.pageHeader({ breadcrumbs: ["Real Admin", "Operations"], title: "Audit Log", description: "Review persisted admin mutation events for requests and config changes." }).Actions(back),
      admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
        admin.panel("Recent audit events", { description: "Rows are read from the app-owned admin_audit_events table.", density: "compact", padding: "none", layout: { span: { desktop: 12, tablet: 8, mobile: 1 }, order: 10 } },
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
    )
    .MustBuild();
}

function healthScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const health = intakeAdmin.healthDiagnostics();
  return admin.pageAdmin("admin-intake-health", "Intake Health")
    .SchemaVersion(2)
    .Shell("admin", { active: "health", eyebrow: "Real Admin · Intake" })
    .Description("Operational diagnostics for the persisted customer intake and Admin DSL backend.")
    .Content(
      admin.pageHeader({ breadcrumbs: ["Real Admin", "Operations"], title: "Intake Health", description: "Operational diagnostics for the persisted customer intake and Admin DSL backend." }).Actions(back),
      admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
        admin.metricCard("Status", health.ok ? "OK" : "Issue", { tone: health.ok ? "success" : "danger", caption: health.activeConfigId || "No active config", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 10 } }),
        admin.metricCard("Requests", health.requestCount || 0, { tone: "plum", caption: "Persisted intake requests", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 11 } }),
        admin.metricCard("Audit events", health.auditEventCount || 0, { tone: "success", caption: health.lastAuditAt || "No events", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 12 } }),
        admin.metricCard("Draft configs", health.draftConfigCount || 0, { tone: health.draftConfigCount ? "warn" : "success", caption: "Unpublished drafts", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 13 } }),
        admin.panel("Diagnostics", { density: "compact", padding: "none", layout: { span: { desktop: 12, tablet: 8, mobile: 1 }, order: 20 } },
          admin.comparisonTable("healthDiagnostics", { rows: [
            { id: "state-db", field: "State DB", current: "required", draft: health.stateDbConfigured ? "configured" : "missing", scheduled: health.stateDbConfigured ? "success" : "danger" },
            { id: "config-db", field: "Config DB", current: "required", draft: health.configDbConfigured ? "configured" : "missing", scheduled: health.configDbConfigured ? "success" : "danger" },
            { id: "active-config", field: "Active config", current: "required", draft: health.activeConfigId || "missing", scheduled: health.activeConfigId ? "success" : "danger" }
          ] })
        )
      )
    )
    .MustBuild();
}

function previewScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return deps.go(ctx, "dashboard"); });
  const editor = intakeAdmin.getConfigEditor(ctx.state.configVersionId || "");
  ctx.state.configVersionId = editor.version.id;
  const result = preview.validateConfig(editor.version.id);
  const url = "/dsl-goja-demo/service?previewConfigVersionId=" + encodeURIComponent(editor.version.id);
  return admin.pageAdmin("admin-intake-preview", "Intake Preview")
    .SchemaVersion(2)
    .Shell("admin", { active: "preview", eyebrow: "Real Admin · Intake" })
    .Description("Preview the customer intake flow against the selected draft or active config version.")
    .Content(
      admin.pageHeader({ breadcrumbs: ["Real Admin", "Operations"], title: "Intake Preview", description: "Preview the customer intake flow against the selected draft or active config version." }).Actions(back),
      admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
        admin.metricCard("Preview config", editor.version.label, { tone: editor.version.status === "draft" ? "warn" : "success", caption: editor.version.id, layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 10 } }),
        admin.metricCard("Status", editor.version.status, { tone: editor.version.status === "active" ? "success" : "warn", caption: result.ok ? "Valid for preview" : "Validation failed", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 11 } }),
        admin.metricCard("Services", result.serviceOptionCount || 0, { tone: result.ok ? "success" : "danger", caption: "Enabled options", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 12 } }),
        admin.panel("Customer intake preview", { description: "The iframe starts a customer DSL session with previewConfigVersionId in the start request.", density: "compact", layout: { span: { desktop: 12, tablet: 8, mobile: 1 }, order: 20 } },
          admin.previewFrame("customerIntakePreview", {
            title: "Customer intake · " + editor.version.label,
            body: "Rendered by the real customer DSL route using config version " + editor.version.id + ".",
            url: url,
            height: 720,
            placeholder: "Customer preview route is not available."
          })
        )
      )
    )
    .MustBuild();
}

module.exports = { auditScreen, healthScreen, previewScreen };
