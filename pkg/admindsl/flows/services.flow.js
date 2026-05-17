const admin = require("fringe/admin-dsl");

function initialState() {
  return {
    mode: "list",
    selectedServiceId: null,
    errors: {},
    draft: {},
    services: [
      { id: "cut", title: "Cut", subtitle: "60 min · $80+", status: "published" },
      { id: "color", title: "Color", subtitle: "90 min · $140+", status: "published" },
      { id: "extensions", title: "Extensions", subtitle: "Consultation required", status: "draftChanges" },
    ],
  };
}

function selectedService(state) {
  return state.services.find((service) => service.id === state.selectedServiceId) || state.services[0];
}

function draftValue(draft, key, fallback) {
  return Object.prototype.hasOwnProperty.call(draft || {}, key) ? draft[key] : fallback;
}

function shellProps(active) {
  return {
    variant: "workbench",
    density: "compact",
    sidebar: {
      active: active || "services",
      items: [
        { id: "overview", label: "Overview", icon: "⌂" },
        { id: "services", label: "Services", icon: "▦" },
        { id: "calendar", label: "Calendar", icon: "□" },
        { id: "drafts", label: "Drafts", icon: "✎" },
        { id: "settings", label: "Settings", icon: "⚙" },
      ],
      user: { name: "Admin User", role: "Administrator", initials: "AD" },
    },
  };
}

function serviceColumns() {
  return [
    { id: "name", kind: "text", label: "Service", primary: true },
    { id: "description", kind: "text", label: "Description", tone: "muted" },
    { id: "status", kind: "badge", label: "Status", map: {
      published: { label: "Published", tone: "success" },
      draftChanges: { label: "Draft Changes", tone: "warning" },
    } },
  ];
}

function serviceRows(state, openService) {
  return state.services.map(function(service) {
    const selected = state.selectedServiceId === service.id;
    return {
      id: service.id,
      name: service.title,
      description: service.subtitle,
      status: selected ? "draftChanges" : service.status,
    };
  });
}

function render(ctx) {
  const state = ctx.state;
  const openService = ctx.bind(admin.open("service.open", "Open").Placement("rowOverflow"), function(event) {
    state.selectedServiceId = event.value && event.value.id || "cut";
    state.mode = "editing";
    state.errors = {};
    return render(ctx);
  });
  const save = ctx.bind(admin.primary("service.save", "Save").Placement("formFooter"), function(event) {
    const values = event.value || {};
    const name = String(values.name || "").trim();
    const price = String(values.price || "").trim();
    state.draft = { name: name, price: price };
    if (!name) {
      state.mode = "validation";
      state.errors = { name: "Name is required" };
      return render(ctx);
    }
    const service = selectedService(state);
    service.title = name;
    service.subtitle = price || service.subtitle;
    state.mode = "saved";
    state.errors = {};
    state.draft = {};
    return render(ctx);
  }, "submit");
  const forceValidation = ctx.bind(admin.danger("service.validate", "Trigger validation").Placement("formFooter"), function(event) {
    const values = event.value || {};
    const name = String(values.name || "").trim();
    state.draft = { name: name, price: String(values.price || "") };
    if (!name) {
      state.mode = "validation";
      state.errors = { name: "Name is required" };
    } else {
      state.mode = "editing";
      state.errors = {};
    }
    return render(ctx);
  });
  const cancel = ctx.bind(admin.secondary("service.cancel", "Cancel").Placement("formFooter"), function() {
    state.mode = "list";
    state.selectedServiceId = null;
    state.errors = {};
    return render(ctx);
  });

  const page = admin.pageAdmin("admin-services", "Services & pricing")
    .SchemaVersion(2)
    .Shell("admin", shellProps("services"))
    .Description("Goja-authored Admin DSL v2 workbench page built through Go-host fluent builders.")
    .Content(
      admin.pageHeader({
        breadcrumbs: ["Real Admin DSL", "Services"],
        title: "Services & pricing",
        description: "Manage service rows through semantic v2 workbench primitives.",
      }).Actions(ctx.bind(admin.primary("service.new", "New Service").Placement("pageHeader"), function() { return render(ctx); })),
      admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact", density: "compact" },
        admin.metricCard("Services", state.services.length, { caption: "Configured service rows", layout: { span: { desktop: 4, mobile: 1 }, order: 10 } }),
        admin.metricCard("Draft rows", state.services.filter(function(service) { return service.status === "draftChanges"; }).length, { tone: "warn", caption: "Need review", layout: { span: { desktop: 4, mobile: 1 }, order: 11 } }),
        admin.metricCard("Editor", state.mode === "list" ? "Closed" : "Open", { tone: state.mode === "validation" ? "danger" : "success", caption: "Drawer state", layout: { span: { desktop: 4, mobile: 1 }, order: 12 } }),
        admin.panel("Service menu", { density: "compact", padding: "none", layout: { span: { desktop: 12, mobile: 1 }, order: 20 } },
          admin.resourceTable("services", { columns: serviceColumns(), rows: serviceRows(state, openService) }).Actions(openService)
        ).FooterActions(ctx.bind(admin.open("service.new", "Add service").Placement("panelFooter"), function() { return render(ctx); }))
      )
    );

  if (state.mode !== "list") {
    const service = selectedService(state);
    const draft = state.draft || {};
    const draftName = draftValue(draft, "name", service.title);
    const draftPrice = draftValue(draft, "price", service.subtitle);
    const form = admin.form("serviceForm", {
      title: "Service form",
      dirty: state.mode === "editing" || state.mode === "validation",
      state: state.mode === "saved" ? "success" : "dirty"
    })
      .Values({ id: service.id, name: draftName, price: draftPrice })
      .Errors(state.errors || {})
      .Children(
        admin.fieldGroup("Basics",
          admin.textField("name", { label: "Name", value: draftName }),
          admin.textField("price", { label: "Price", value: draftPrice })
        )
      )
      .Submit(save)
      .Cancel(cancel)
      .Action("validate", forceValidation);

    page.Drawers(admin.surface.drawer("serviceEditor", { title: "Edit " + service.title, open: true, selectedId: service.id }, form));
  }

  return page.MustBuild();
}
