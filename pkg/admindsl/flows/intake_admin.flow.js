const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");

function initialState() {
  return {
    screen: "dashboard",
    selectedRequestId: null,
    statusFilter: "new",
    searchQuery: "",
    errors: {},
  };
}

function go(ctx, screen) {
  ctx.state.screen = screen;
  ctx.state.errors = {};
  return render(ctx);
}

function render(ctx) {
  switch (ctx.state.screen) {
    case "requests": return requestFlow.requestsScreen(ctx, { render: render, go: go });
    case "requestDetail": return requestFlow.requestDetailScreen(ctx, { render: render, go: go });
    case "config": return configFlow.configScreen(ctx, { render: render, go: go });
    case "preview": return opsFlow.previewScreen(ctx, { go: go });
    case "audit": return opsFlow.auditScreen(ctx, { go: go });
    case "health": return opsFlow.healthScreen(ctx, { go: go });
    default: return dashboardScreen(ctx);
  }
}

const requestFlow = require("./intake_requests.flow.js");
const configFlow = require("./intake_config.flow.js");
const opsFlow = require("./intake_ops.flow.js");

function dashboardScreen(ctx) {
  const stats = intakeAdmin.dashboardStats();
  const openRequests = ctx.bind(admin.open("nav.requests", "Review requests").Placement("pageHeader"), function() {
    return go(ctx, "requests");
  });
  const openConfig = ctx.bind(admin.open("nav.config", "Config versions").Placement("panelFooter"), function() {
    return go(ctx, "config");
  });
  const openPreview = ctx.bind(admin.open("nav.preview", "Preview intake").Placement("panelFooter"), function() {
    return go(ctx, "preview");
  });
  const openAudit = ctx.bind(admin.open("nav.audit", "Audit log").Placement("panelFooter"), function() {
    return go(ctx, "audit");
  });
  const openHealth = ctx.bind(admin.open("nav.health", "Health").Placement("panelFooter"), function() {
    return go(ctx, "health");
  });

  return admin.pageAdmin("admin-intake-dashboard", "Intake Admin")
    .SchemaVersion(2)
    .Shell("admin", { active: "dashboard", eyebrow: "Real Admin · Intake" })
    .Description("Manage customer requests, booking availability, and the live intake config.")
    .Content(
      admin.pageHeader({
        breadcrumbs: ["Real Admin", "Intake"],
        title: "Intake Admin",
        description: "Manage customer requests, booking availability, and the live intake config."
      }).Actions(openRequests),
      admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
        admin.metricCard("New requests", stats.newRequests || 0, { tone: "plum", caption: "Awaiting review", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 10 } }),
        admin.metricCard("Needs info", stats.needsInfo || 0, { tone: "warn", caption: "Waiting on client", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 11 } }),
        admin.metricCard("Active config", stats.activeConfigId || "—", { tone: stats.hasDraftConfig ? "warn" : "success", caption: stats.activeConfigLabel || "No active config", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 12 } }),
        admin.metricCard("Draft", stats.hasDraftConfig ? "Yes" : "No", { tone: stats.hasDraftConfig ? "warn" : "success", caption: "Unpublished config changes", layout: { span: { desktop: 3, tablet: 4, mobile: 1 }, order: 13 } }),
        admin.panel("Recent requests", { description: "Latest customer intake submissions persisted from the customer DSL flow.", density: "compact", padding: "none", layout: { span: { desktop: 8, tablet: 8, mobile: 1 }, order: 20 } },
          requestFlow.requestTable(ctx, stats.recentRequests || [], "No intake requests yet", { render: render })
        ).FooterActions(openRequests),
        admin.panel("Admin operations", { description: "Jump into config, preview, audit, or diagnostics.", density: "compact", layout: { span: { desktop: 4, tablet: 8, mobile: 1 }, order: 30 } },
          admin.metricCard("Open surfaces", "4", { caption: "Config · Preview · Audit · Health", tone: "success" })
        ).FooterActions(openConfig, openPreview, openAudit, openHealth)
      )
    )
    .MustBuild();
}
