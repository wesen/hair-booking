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
  const openRequests = ctx.bind(admin.open("nav.requests", "Review requests").Placement("toolbar"), function() {
    return go(ctx, "requests");
  });
  const openConfig = ctx.bind(admin.open("nav.config", "Config versions").Placement("toolbar"), function() {
    return go(ctx, "config");
  });
  const openPreview = ctx.bind(admin.open("nav.preview", "Preview intake").Placement("toolbar"), function() {
    return go(ctx, "preview");
  });
  const openAudit = ctx.bind(admin.open("nav.audit", "Audit log").Placement("toolbar"), function() {
    return go(ctx, "audit");
  });
  const openHealth = ctx.bind(admin.open("nav.health", "Health").Placement("toolbar"), function() {
    return go(ctx, "health");
  });

  return admin.pageDashboard("admin-intake-dashboard", "Intake Admin")
    .Shell("dashboard", { active: "dashboard", eyebrow: "Real Admin · Intake" })
    .Description("Manage customer requests, booking availability, and the live intake config.")
    .Content(
      admin.toolbar().Actions(openRequests, openConfig, openPreview, openAudit, openHealth),
      admin.cardGrid({ columns: 4 },
        admin.metricCard("New requests", stats.newRequests || 0, { tone: "plum", caption: "Awaiting review" }),
        admin.metricCard("Needs info", stats.needsInfo || 0, { tone: "warn", caption: "Waiting on client" }),
        admin.metricCard("Active config", stats.activeConfigId || "—", { tone: stats.hasDraftConfig ? "warn" : "success", caption: stats.activeConfigLabel || "No active config" }),
        admin.metricCard("Draft", stats.hasDraftConfig ? "Yes" : "No", { tone: stats.hasDraftConfig ? "warn" : "success", caption: "Unpublished config changes" })
      ),
      admin.section("Recent requests", { description: "Latest customer intake submissions persisted from the customer DSL flow." },
        requestFlow.requestTable(ctx, stats.recentRequests || [], "No intake requests yet", { render: render })
      )
    )
    .MustBuild();
}
