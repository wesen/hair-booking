const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");
const preview = require("host/intake-preview");

function initialState() {
  return {
    screen: "dashboard",
    selectedRequestId: null,
    errors: {},
  };
}

function go(ctx, screen) {
  ctx.state.screen = screen;
  ctx.state.selectedRequestId = null;
  ctx.state.errors = {};
  return render(ctx);
}

function render(ctx) {
  switch (ctx.state.screen) {
    case "requests": return requestsScreen(ctx);
    case "config": return configScreen(ctx);
    case "preview": return previewScreen(ctx);
    default: return dashboardScreen(ctx);
  }
}

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

  return admin.pageDashboard("admin-intake-dashboard", "Intake Admin")
    .Shell("dashboard", { active: "dashboard", eyebrow: "Real Admin · Intake" })
    .Description("Manage customer requests, booking availability, and the live intake config.")
    .Content(
      admin.toolbar().Actions(openRequests, openConfig, openPreview),
      admin.cardGrid({ columns: 4 },
        admin.metricCard("New requests", stats.newRequests || 0, { tone: "plum", caption: "Awaiting review" }),
        admin.metricCard("Needs info", stats.needsInfo || 0, { tone: "warn", caption: "Waiting on client" }),
        admin.metricCard("Active config", stats.activeConfigId || "—", { tone: stats.hasDraftConfig ? "warn" : "success", caption: stats.activeConfigLabel || "No active config" }),
        admin.metricCard("Draft", stats.hasDraftConfig ? "Yes" : "No", { tone: stats.hasDraftConfig ? "warn" : "success", caption: "Unpublished config changes" })
      ),
      admin.section("Recent requests", { description: "Latest customer intake submissions persisted from the customer DSL flow." },
        requestList(ctx, stats.recentRequests || [])
      )
    )
    .MustBuild();
}

function requestList(ctx, requests) {
  if (!requests.length) {
    return admin.emptyState("No intake requests yet", { body: "Submit the customer intake flow to create the first request." });
  }
  return admin.resourceList("requests", { state: "idle" },
    ...requests.map(function(request) {
      return admin.resourceRow(request.id, {
        title: (request.customerName || "Anonymous") + " · " + request.serviceValue,
        subtitle: (request.estimateLabel || "Estimate pending") + " · " + (request.dayValue || "TBD") + " " + (request.timeValue || ""),
        badge: request.status,
        tone: request.status === "needs_info" ? "warn" : "success"
      });
    })
  );
}

function requestsScreen(ctx) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return go(ctx, "dashboard"); });
  const requests = intakeAdmin.listRequests({ limit: 50 });
  return admin.pageResource("admin-intake-requests", "Intake Requests")
    .Shell("resource", { active: "requests", eyebrow: "Real Admin · Intake" })
    .Description("Review persisted customer intake submissions.")
    .Content(
      admin.toolbar().Actions(back),
      admin.section("Request queue", { description: "This starts as resource rows; HAIR-041 will promote dense queues to resourceTable." }, requestList(ctx, requests))
    )
    .MustBuild();
}

function configScreen(ctx) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return go(ctx, "dashboard"); });
  const createDraft = ctx.bind(admin.primary("config.createDraft", "Create draft").Placement("toolbar"), function() {
    intakeAdmin.createDraftFromActive("Admin draft");
    return configScreen(ctx);
  });
  const versions = intakeAdmin.listConfigVersions();
  return admin.pageResource("admin-intake-config", "Intake Configuration")
    .Shell("resource", { active: "config", eyebrow: "Real Admin · Intake" })
    .Description("Manage versioned config rows that drive the customer intake flow.")
    .Content(
      admin.toolbar().Actions(back, createDraft),
      admin.section("Config versions", {},
        admin.resourceList("configVersions", { state: "idle" },
          ...versions.map(function(version) {
            return admin.resourceRow(version.id, {
              title: version.label,
              subtitle: version.id,
              badge: version.status,
              tone: version.status === "active" ? "success" : version.status === "draft" ? "warn" : "neutral"
            });
          })
        )
      )
    )
    .MustBuild();
}

function previewScreen(ctx) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return go(ctx, "dashboard"); });
  const result = preview.validateConfig("active");
  return admin.pageResource("admin-intake-preview", "Intake Preview")
    .Shell("resource", { active: "preview", eyebrow: "Real Admin · Intake" })
    .Description("First host/intake-preview spike. Full embedded customer preview is a later HAIR-041 component task.")
    .Content(
      admin.toolbar().Actions(back),
      admin.section("Validation", {},
        admin.summaryCard("Preview bridge", { body: result.ok ? "Preview host module is connected." : "Preview validation failed." }),
        admin.markdown("The next phase should render customer DSL pages for a selected draft config version.")
      )
    )
    .MustBuild();
}
