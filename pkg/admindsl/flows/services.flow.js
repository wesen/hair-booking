const admin = require("fringe/admin-dsl");

function initialState() {
  return {
    mode: "list",
    selectedServiceId: null,
    errors: {},
    draft: {},
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

function draftValue(draft, key, fallback) {
  return Object.prototype.hasOwnProperty.call(draft || {}, key) ? draft[key] : fallback;
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
  const forceValidation = ctx.bind(admin.danger("service.validate", "Trigger validation").Placement("footer"), function(event) {
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
          admin.resourceRow("cut", { title: state.services[0].title, subtitle: state.services[0].subtitle, badge: state.selectedServiceId === "cut" ? "Selected" : state.services[0].badge, tone: state.selectedServiceId === "cut" ? "plum" : state.services[0].tone }).Actions(openCut),
          admin.resourceRow("color", { title: state.services[1].title, subtitle: state.services[1].subtitle, badge: state.selectedServiceId === "color" ? "Selected" : state.services[1].badge, tone: state.selectedServiceId === "color" ? "plum" : state.services[1].tone }).Actions(openColor),
          admin.resourceRow("extensions", { title: state.services[2].title, subtitle: state.services[2].subtitle, badge: state.services[2].badge, tone: state.services[2].tone })
        )
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
