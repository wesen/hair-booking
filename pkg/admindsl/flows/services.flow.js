const admin = require("fringe/admin-dsl");

function initialState() {
  return {
    mode: "list",
    selectedServiceId: null,
    errors: {},
    services: [
      { id: "cut", title: "Cut", subtitle: "60 min · $80+", badge: "Published", tone: "success" },
      { id: "color", title: "Color", subtitle: "90 min · $140+", badge: "Published", tone: "success" },
      { id: "extensions", title: "Extensions", subtitle: "Consultation required", badge: "Draft", tone: "warn" },
    ],
  };
}

function selectedService(state) {
  return state.services.find((service) => service.id === state.selectedServiceId) || state.services[0];
}

function render(ctx) {
  const state = ctx.state;
  const openCut = ctx.bind(admin.open("service.open", "Open").Placement("row").Payload({ id: "cut" }), function(event) {
    state.selectedServiceId = event.value && event.value.id || "cut";
    state.mode = "editing";
    state.errors = {};
    return render(ctx);
  });
  const openColor = ctx.bind(admin.open("service.open", "Open").Placement("row").Payload({ id: "color" }), function(event) {
    state.selectedServiceId = event.value && event.value.id || "color";
    state.mode = "editing";
    state.errors = {};
    return render(ctx);
  });
  const save = ctx.bind(admin.primary("service.save", "Save").Placement("footer"), function(event) {
    if (state.mode === "validation") {
      state.errors = { name: "Name is required" };
      return render(ctx);
    }
    state.mode = "saved";
    state.errors = {};
    return render(ctx);
  }, "submit");
  const forceValidation = ctx.bind(admin.danger("service.validate", "Trigger validation").Placement("footer"), function() {
    state.mode = "validation";
    state.errors = { name: "Name is required" };
    return render(ctx);
  });
  const cancel = ctx.bind(admin.secondary("service.cancel", "Cancel").Placement("footer"), function() {
    state.mode = "list";
    state.selectedServiceId = null;
    state.errors = {};
    return render(ctx);
  });

  const page = admin.pageResource("admin-services", "Services & pricing")
    .Shell("resource", { active: "services", eyebrow: "Real Admin DSL" })
    .Description("Goja-authored Admin DSL page built through Go-host fluent builders.")
    .Content(
      admin.section("Service menu", { description: "This page is rendered by pkg/admindsl/flows/services.flow.js." },
        admin.resourceList("services", { state: "idle" },
          admin.resourceRow("cut", { title: "Cut", subtitle: "60 min · $80+", badge: state.selectedServiceId === "cut" ? "Selected" : "Published", tone: state.selectedServiceId === "cut" ? "plum" : "success" }).Actions(openCut),
          admin.resourceRow("color", { title: "Color", subtitle: "90 min · $140+", badge: state.selectedServiceId === "color" ? "Selected" : "Published", tone: state.selectedServiceId === "color" ? "plum" : "success" }).Actions(openColor),
          admin.resourceRow("extensions", { title: "Extensions", subtitle: "Consultation required", badge: "Draft", tone: "warn" })
        )
      )
    );

  if (state.mode !== "list") {
    const service = selectedService(state);
    const form = admin.form("serviceForm", {
      title: "Service form",
      dirty: state.mode === "editing" || state.mode === "validation",
      state: state.mode === "saved" ? "success" : "dirty"
    })
      .Values({ id: service.id, name: service.title })
      .Errors(state.errors || {})
      .Children(
        admin.fieldGroup("Basics",
          admin.textField("name", { label: "Name", value: state.mode === "validation" ? "" : service.title }),
          admin.textField("price", { label: "Price", value: service.subtitle })
        )
      )
      .Submit(save)
      .Cancel(cancel)
      .Actions(forceValidation);

    page.Drawers(admin.surface.drawer("serviceEditor", { title: "Edit " + service.title, open: true, selectedId: service.id }, form));
  }

  return page.MustBuild();
}
