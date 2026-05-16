const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");
const preview = require("host/intake-preview");

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
    case "requests": return requestsScreen(ctx);
    case "requestDetail": return requestDetailScreen(ctx);
    case "config": return configScreen(ctx);
    case "preview": return previewScreen(ctx);
    default: return dashboardScreen(ctx);
  }
}

function requestTitle(request) {
  return (request.customerName || "Anonymous") + " · " + request.serviceValue;
}

function bookingLabel(request) {
  if (!request.dayValue && !request.timeValue) return "TBD";
  return (request.dayValue || "TBD") + (request.timeValue ? " " + request.timeValue : "");
}

function requestRows(requests) {
  return (requests || []).map(function(request) {
    return {
      id: request.id,
      status: request.status,
      customer: request.customerName || "Anonymous",
      service: request.serviceValue,
      estimate: request.estimateLabel || "Pending",
      booking: bookingLabel(request),
      photos: String(Object.keys(request.photos || {}).filter(function(key) { return !!request.photos[key]; }).length),
    };
  });
}

function requestTable(ctx, requests, emptyTitle) {
  const openRequest = ctx.bind(admin.open("request.open", "Open").Placement("row"), function(event) {
    ctx.state.selectedRequestId = event.value && event.value.id;
    ctx.state.screen = "requestDetail";
    return render(ctx);
  });
  return admin.resourceTable("requests", {
    columns: [
      { id: "status", label: "Status" },
      { id: "customer", label: "Customer" },
      { id: "service", label: "Service" },
      { id: "estimate", label: "Estimate" },
      { id: "booking", label: "Booking" },
      { id: "photos", label: "Photos" }
    ],
    rows: requestRows(requests),
    emptyTitle: emptyTitle || "No intake requests"
  }).Actions(openRequest);
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
        requestTable(ctx, stats.recentRequests || [], "No intake requests yet")
      )
    )
    .MustBuild();
}

function requestsScreen(ctx) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { return go(ctx, "dashboard"); });
  const setFilter = ctx.bind(admin.secondary("filter.status", "Filter").Placement("toolbar"), function(event) { ctx.state.statusFilter = event.value && event.value.id || ""; return render(ctx); });
  const search = ctx.bind(admin.secondary("filter.search", "Search").Placement("toolbar"), function(event) { ctx.state.searchQuery = event.value && event.value.query || ""; return render(ctx); });
  const requests = intakeAdmin.listRequests({ status: ctx.state.statusFilter || "", limit: 50 });
  return admin.pageResource("admin-intake-requests", "Intake Requests")
    .Shell("resource", { active: "requests", eyebrow: "Real Admin · Intake" })
    .Description("Review persisted customer intake submissions.")
    .Content(
      admin.toolbar().Actions(back),
      admin.filterBar("requestStatusFilters", { filters: [
        { id: "new", label: "New" },
        { id: "reviewing", label: "Reviewing" },
        { id: "needs_info", label: "Needs info" },
        { id: "booked", label: "Booked" },
        { id: "", label: "All" }
      ], value: ctx.state.statusFilter || "" }).Actions(setFilter),
      admin.searchBox("requestSearch", { placeholder: "Search customer or service", value: ctx.state.searchQuery || "" }).Actions(search),
      admin.section("Request queue", { description: "Dense queue rendered with the HAIR-041 resourceTable primitive." }, requestTable(ctx, requests, "No requests match this filter"))
    )
    .MustBuild();
}

function photosForGallery(request) {
  const photos = request.photos || {};
  return Object.keys(photos).map(function(slot) {
    const photo = photos[slot] || {};
    return {
      id: photo.uploadId || slot,
      slot: slot,
      title: slot,
      subtitle: photo.originalFilename || photo.publicUrl || "Uploaded reference",
      url: photo.publicUrl || photo.url || "",
      status: photo.publicUrl || photo.url ? "Stored" : "Missing blob",
      tone: photo.publicUrl || photo.url ? "success" : "danger"
    };
  });
}

function requestDetailScreen(ctx) {
  const request = intakeAdmin.getRequest(ctx.state.selectedRequestId);
  const back = ctx.bind(admin.secondary("nav.requests", "Back to requests").Placement("toolbar"), function() { ctx.state.photoModal = null; return go(ctx, "requests"); });
  const markReviewing = ctx.bind(admin.primary("request.reviewing", "Mark reviewing").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "reviewing", "Marked reviewing from Admin DSL");
    return render(ctx);
  });
  const needsInfo = ctx.bind(admin.secondary("request.needsInfo", "Needs info").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "needs_info", "More information requested");
    return render(ctx);
  });
  const archive = ctx.bind(admin.danger("request.archive", "Archive").Placement("toolbar"), function() {
    intakeAdmin.updateRequestStatus(request.id, "archived", "Archived from Admin DSL");
    ctx.state.photoModal = null;
    return go(ctx, "requests");
  });
  const openPhoto = ctx.bind(admin.open("photo.open", "Open photo").Placement("detail"), function(event) {
    ctx.state.photoModal = event.value;
    return render(ctx);
  });
  const closePhoto = ctx.bind(admin.secondary("photo.close", "Close").Placement("footer"), function() {
    ctx.state.photoModal = null;
    return render(ctx);
  });

  const page = admin.pageResource("admin-intake-request-detail", "Request " + request.id)
    .Shell("resource", { active: "requests", eyebrow: "Real Admin · Intake" })
    .Description(requestTitle(request) + " · " + request.status)
    .Content(
      admin.toolbar().Actions(back, markReviewing, needsInfo, archive),
      admin.cardGrid({ columns: 2 },
        admin.summaryCard("Summary", { body: "Service: " + request.serviceValue + "\nEstimate: " + (request.estimateLabel || "Pending") + "\nBooking: " + bookingLabel(request) + "\nBudget: " + (request.budgetValue || "Not set") }),
        admin.summaryCard("Internal notes", { body: request.internalNotes || "No internal notes yet." })
      ),
      admin.section("Photos", { description: "Uploaded front/side/back customer references. Missing blobs render as explicit error tiles." },
        admin.imageGallery("requestPhotos", { images: photosForGallery(request), emptyText: "No photos were uploaded for this request." }).Actions(openPhoto)
      ),
      admin.section("Raw request snapshot", {},
        admin.markdown(JSON.stringify(request.request || {}, null, 2), {})
      )
    );

  if (ctx.state.photoModal) {
    const photo = ctx.state.photoModal;
    const body = photo.url ? "File: " + (photo.subtitle || photo.id || "photo") + "\nStatus: " + (photo.status || "Stored") : "Could not load the stored blob for " + (photo.id || photo.slot || "this photo") + ". The request is still available, but this photo may have been removed.";
    page.Modals(admin.surface.modal("photoViewer", { title: photo.url ? "Photo · " + (photo.title || photo.slot || "Uploaded") : "Photo unavailable", open: true },
      admin.summaryCard(photo.url ? "Photo metadata" : "Missing photo", { body: body }).Actions(closePhoto)
    ));
  }

  return page.MustBuild();
}

function versionRows(versions) {
  return (versions || []).map(function(version) {
    return {
      id: version.id,
      status: version.status,
      label: version.label,
      activatedAt: version.activatedAt || "—",
      createdAt: version.createdAt || "—"
    };
  });
}

function serviceEditorItems(services) {
  return (services || []).map(function(service) {
    return {
      id: service.id,
      category: service.category,
      value: service.value,
      title: service.title,
      subtitleValue: service.subtitle || "",
      badge: service.badge || "",
      sortOrder: service.sortOrder,
      enabled: service.enabled,
      subtitle: service.category + " · " + service.value + " · " + (service.badge || "No badge") + " · sort " + service.sortOrder + (service.enabled ? "" : " · disabled")
    };
  });
}

function findById(items, id) {
  for (var i = 0; i < (items || []).length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

function parseIntOrZero(value) {
  var parsed = parseInt(String(value || "0"), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function parseBool(value) {
  var normalized = String(value || "").toLowerCase().trim();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on" || normalized === "enabled";
}

function toneEditorItems(tones) {
  return (tones || []).map(function(tone) {
    return {
      id: tone.id,
      title: tone.label,
      subtitle: tone.value + " · sort " + tone.sortOrder + (tone.enabled ? "" : " · disabled")
    };
  });
}

function budgetEditorItems(budgets) {
  return (budgets || []).map(function(budget) {
    return {
      id: budget.id,
      title: budget.title,
      subtitle: budget.value + " · " + (budget.subtitle || "No subtitle") + " · sort " + budget.sortOrder + (budget.enabled ? "" : " · disabled")
    };
  });
}

function priceRows(priceRanges) {
  return (priceRanges || []).map(function(range) {
    return {
      id: range.id,
      service: range.serviceValue || "default",
      budget: range.budgetValue || "default",
      label: range.label,
      min: range.minCents ? "$" + Math.round(range.minCents / 100) : "—",
      max: range.maxCents ? "$" + Math.round(range.maxCents / 100) : "—"
    };
  });
}

function timeSlotItems(timeSlots) {
  return (timeSlots || []).map(function(slot) {
    return {
      id: slot.id,
      title: slot.title,
      subtitle: slot.value + " · sort " + slot.sortOrder + (slot.enabled ? "" : " · disabled")
    };
  });
}

function validationChanges(report) {
  const issues = (report && report.issues) || [];
  if (!issues.length) {
    return [{ field: "Validation", before: "Pending review", after: "No blocking issues", tone: "success" }];
  }
  return issues.map(function(issue) {
    return {
      field: issue.entity || issue.severity,
      before: issue.severity,
      after: issue.message,
      tone: issue.severity === "error" ? "danger" : "warn"
    };
  });
}

function configEditorSection(ctx, editor) {
  const setSection = ctx.bind(admin.secondary("config.section", "Switch section").Placement("toolbar"), function(event) {
    ctx.state.configSection = event.value && event.value.id || "services";
    return render(ctx);
  });
  const section = ctx.state.configSection || "services";
  const openService = ctx.bind(admin.open("config.service.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedServiceId = event.value && event.value.id;
    ctx.state.configDrawer = "service";
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return render(ctx);
  });
  const disabledEdit = admin.secondary("config.edit.placeholder", "Edit").Placement("row").Disabled(true).AccessibilityLabel("Detailed editing is implemented in the next Phase 7 slice");
  const availabilitySelect = ctx.bind(admin.open("config.availability.selectDay", "Select day").Placement("detail"), function(event) {
    ctx.state.selectedAvailabilityDay = event.value && event.value.value;
    return render(ctx);
  });

  const tabs = admin.tabs("configSections", { tabs: [
    { id: "services", label: "Services" },
    { id: "tones", label: "Tones" },
    { id: "budgets", label: "Budgets" },
    { id: "pricing", label: "Pricing" },
    { id: "availability", label: "Availability" },
    { id: "validation", label: "Validation" }
  ], value: section }).Actions(setSection);

  if (section === "tones") {
    return admin.section("Tone options", { description: "Draft tone labels read by the customer intake flow." },
      tabs,
      admin.editableList("toneOptions", { items: toneEditorItems(editor.tones), emptyTitle: "No tone options" }).Actions(disabledEdit)
    );
  }
  if (section === "budgets") {
    return admin.section("Budget options", { description: "Budget choices and explanatory copy." },
      tabs,
      admin.editableList("budgetOptions", { items: budgetEditorItems(editor.budgets), emptyTitle: "No budget options" }).Actions(disabledEdit)
    );
  }
  if (section === "pricing") {
    return admin.section("Price ranges", { description: "Service/budget price range rules used by estimates." },
      tabs,
      admin.resourceTable("priceRanges", {
        columns: [
          { id: "service", label: "Service" },
          { id: "budget", label: "Budget" },
          { id: "label", label: "Label" },
          { id: "min", label: "Min" },
          { id: "max", label: "Max" }
        ],
        rows: priceRows(editor.priceRanges),
        emptyTitle: "No price ranges"
      }).Actions(disabledEdit)
    );
  }
  if (section === "availability") {
    return admin.section("Availability and time slots", { description: "Published booking days and selectable appointment times." },
      tabs,
      admin.monthAvailabilityGrid("availabilityDays", { days: editor.availabilityDays || [], selected: ctx.state.selectedAvailabilityDay || "" }).Actions(availabilitySelect),
      admin.editableList("timeSlots", { items: timeSlotItems(editor.timeSlots), emptyTitle: "No time slots" }).Actions(disabledEdit)
    );
  }
  if (section === "validation") {
    return admin.section("Validation report", { description: "Pre-publish validation for the selected config version." },
      tabs,
      admin.diffView("configValidation", {
        title: editor.validation && editor.validation.ok ? "Config is publishable" : "Config needs attention",
        body: "Validation is computed by the app-owned intake admin store.",
        changes: validationChanges(editor.validation)
      })
    );
  }
  return admin.section("Service and category options", { description: "Draft service menu rows grouped by category and ordered for customer intake." },
    tabs,
    admin.editableList("serviceOptions", { items: serviceEditorItems(editor.services), emptyTitle: "No service options" }).Actions(editor.version.status === "draft" ? openService : disabledEdit)
  );
}

function serviceFormValues(ctx, service) {
  return ctx.state.serviceFormValues || {
    id: service.id,
    category: service.category,
    value: service.value,
    title: service.title,
    subtitle: service.subtitle || "",
    badge: service.badge || "",
    sortOrder: String(service.sortOrder || 0),
    enabled: service.enabled ? "true" : "false"
  };
}

function serviceFormErrors(values) {
  const errors = {};
  if (!String(values.category || "").trim()) errors.category = "Category is required";
  if (!String(values.value || "").trim()) errors.value = "Value is required";
  if (!String(values.title || "").trim()) errors.title = "Title is required";
  return errors;
}

function serviceOptionDrawer(ctx, editor, saveAction, cancelAction) {
  const service = findById(editor.services, ctx.state.selectedServiceId);
  if (!service) {
    return admin.surface.drawer("serviceOptionEditor", { title: "Service unavailable", open: true },
      admin.summaryCard("Missing service", { body: "The selected service option no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = serviceFormValues(ctx, service);
  return admin.surface.drawer("serviceOptionEditor", { title: "Edit service option", open: true },
    admin.form("serviceOptionForm", { title: service.title, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Service details",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("category", { label: "Category", value: values.category }),
        admin.textField("value", { label: "Value", value: values.value }),
        admin.textField("title", { label: "Title", value: values.title }),
        admin.textField("subtitle", { label: "Subtitle", value: values.subtitle }),
        admin.textField("badge", { label: "Badge", value: values.badge }),
        admin.textField("sortOrder", { label: "Sort order", value: values.sortOrder }),
        admin.textField("enabled", { label: "Enabled (true/false)", value: values.enabled })
      )
    ).Actions(saveAction, cancelAction)
  );
}

function configScreen(ctx) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { ctx.state.publishModal = false; return go(ctx, "dashboard"); });
  const createDraft = ctx.bind(admin.primary("config.createDraft", "Create draft").Placement("toolbar"), function() {
    const draft = intakeAdmin.createDraftFromActive("Admin draft");
    ctx.state.configVersionId = draft.id;
    ctx.state.configSection = "services";
    ctx.state.publishModal = false;
    return configScreen(ctx);
  });
  const selectVersion = ctx.bind(admin.open("config.version.open", "Open").Placement("row"), function(event) {
    ctx.state.configVersionId = event.value && event.value.id;
    ctx.state.configSection = "services";
    ctx.state.publishModal = false;
    return render(ctx);
  });
  const openPublish = ctx.bind(admin.primary("config.publish.open", "Publish draft").Placement("toolbar"), function() {
    ctx.state.publishModal = true;
    return render(ctx);
  });
  const cancelPublish = ctx.bind(admin.secondary("config.publish.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.publishModal = false;
    return render(ctx);
  });
  const cancelService = ctx.bind(admin.secondary("config.service.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedServiceId = null;
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return render(ctx);
  });
  const saveService = ctx.bind(admin.primary("config.service.save", "Save service").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedServiceId;
    ctx.state.serviceFormValues = values;
    const errors = serviceFormErrors(values);
    if (Object.keys(errors).length) {
      ctx.state.errors = errors;
      return render(ctx);
    }
    intakeAdmin.updateServiceOption({
      id: values.id,
      category: values.category,
      value: values.value,
      title: values.title,
      subtitle: values.subtitle || "",
      badge: values.badge || "",
      sortOrder: parseIntOrZero(values.sortOrder),
      enabled: parseBool(values.enabled)
    });
    ctx.state.configDrawer = null;
    ctx.state.selectedServiceId = null;
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return render(ctx);
  });
  const confirmPublish = ctx.bind(admin.danger("config.publish.confirm", "Publish").Placement("footer"), function() {
    const editor = intakeAdmin.getConfigEditor(ctx.state.configVersionId || "");
    const published = intakeAdmin.publishConfigVersion(editor.version.id);
    ctx.state.configVersionId = published.id;
    ctx.state.configSection = "validation";
    ctx.state.publishModal = false;
    return render(ctx);
  });

  const versions = intakeAdmin.listConfigVersions();
  const editor = intakeAdmin.getConfigEditor(ctx.state.configVersionId || "");
  ctx.state.configVersionId = editor.version.id;
  const canPublish = editor.version.status === "draft" && editor.validation && editor.validation.ok;
  const publishAction = canPublish ? openPublish : admin.primary("config.publish.disabled", "Publish draft").Placement("toolbar").Disabled(true);

  const page = admin.pageResource("admin-intake-config", "Intake Configuration")
    .Shell("resource", { active: "config", eyebrow: "Real Admin · Intake" })
    .Description("Manage versioned config rows that drive the customer intake flow.")
    .Content(
      admin.toolbar().Actions(back, createDraft, publishAction),
      admin.cardGrid({ columns: 3 },
        admin.metricCard("Selected", editor.version.label, { tone: editor.version.status === "draft" ? "warn" : "success", caption: editor.version.id }),
        admin.metricCard("Status", editor.version.status, { tone: editor.version.status === "active" ? "success" : "warn", caption: editor.version.activatedAt || "Not activated" }),
        admin.metricCard("Validation", editor.validation && editor.validation.ok ? "OK" : "Issues", { tone: editor.validation && editor.validation.ok ? "success" : "danger", caption: String(((editor.validation && editor.validation.issues) || []).length) + " issue(s)" })
      ),
      admin.section("Config versions", { description: "Open a version to inspect its publishable resources." },
        admin.resourceTable("configVersions", {
          columns: [
            { id: "status", label: "Status" },
            { id: "label", label: "Label" },
            { id: "id", label: "ID" },
            { id: "activatedAt", label: "Activated" }
          ],
          rows: versionRows(versions),
          emptyTitle: "No config versions"
        }).Actions(selectVersion)
      ),
      configEditorSection(ctx, editor)
    );

  if (ctx.state.publishModal) {
    page.Modals(admin.surface.modal("publishConfig", { title: "Publish intake config?", open: true },
      admin.summaryCard("Publish " + editor.version.label, { body: "Publishing this draft will archive the current active config and make the selected rows visible to customer intake sessions." }).Actions(cancelPublish, confirmPublish)
    ));
  }
  if (ctx.state.configDrawer === "service") {
    page.Drawers(serviceOptionDrawer(ctx, editor, saveService, cancelService));
  }

  return page.MustBuild();
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
        admin.summaryCard("Preview bridge", { body: result.ok ? "Preview host module is connected for " + result.configVersionId + "." : "Preview validation failed." }),
        admin.markdown("The next phase should render customer DSL pages for a selected draft config version.", {})
      )
    )
    .MustBuild();
}
