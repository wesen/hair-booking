const admin = require("fringe/admin-dsl");
const intakeAdmin = require("host/intake-admin");

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

function parseOptionalInt(value) {
  var text = String(value == null ? "" : value).trim();
  if (!text) return null;
  var parsed = parseInt(text, 10);
  return isNaN(parsed) ? null : parsed;
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

function configEditorSection(ctx, editor, deps) {
  const setSection = ctx.bind(admin.secondary("config.section", "Switch section").Placement("toolbar"), function(event) {
    ctx.state.configSection = event.value && event.value.id || "services";
    return deps.render(ctx);
  });
  const section = ctx.state.configSection || "services";
  const addEntity = function(kind, selectedKey, formKey) {
    return function() {
      ctx.state[selectedKey] = "__new__";
      ctx.state.configDrawer = kind;
      ctx.state[formKey] = null;
      ctx.state.errors = {};
      return deps.render(ctx);
    };
  };
  const addService = ctx.bind(admin.primary("config.service.add", "Add service").Placement("toolbar"), addEntity("service", "selectedServiceId", "serviceFormValues"));
  const addTone = ctx.bind(admin.primary("config.tone.add", "Add tone").Placement("toolbar"), addEntity("tone", "selectedToneId", "toneFormValues"));
  const addBudget = ctx.bind(admin.primary("config.budget.add", "Add budget").Placement("toolbar"), addEntity("budget", "selectedBudgetId", "budgetFormValues"));
  const addPrice = ctx.bind(admin.primary("config.price.add", "Add price").Placement("toolbar"), addEntity("price", "selectedPriceId", "priceFormValues"));
  const addAvailability = ctx.bind(admin.primary("config.availability.add", "Add day").Placement("toolbar"), addEntity("availability", "selectedAvailabilityId", "availabilityFormValues"));
  const addTimeSlot = ctx.bind(admin.primary("config.timeSlot.add", "Add time").Placement("toolbar"), addEntity("timeSlot", "selectedTimeSlotId", "timeSlotFormValues"));
  const openService = ctx.bind(admin.open("config.service.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedServiceId = event.value && event.value.id;
    ctx.state.configDrawer = "service";
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const openTone = ctx.bind(admin.open("config.tone.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedToneId = event.value && event.value.id;
    ctx.state.configDrawer = "tone";
    ctx.state.toneFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const openBudget = ctx.bind(admin.open("config.budget.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedBudgetId = event.value && event.value.id;
    ctx.state.configDrawer = "budget";
    ctx.state.budgetFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const openPrice = ctx.bind(admin.open("config.price.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedPriceId = event.value && event.value.id;
    ctx.state.configDrawer = "price";
    ctx.state.priceFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const openTimeSlot = ctx.bind(admin.open("config.timeSlot.open", "Edit").Placement("row"), function(event) {
    ctx.state.selectedTimeSlotId = event.value && event.value.id;
    ctx.state.configDrawer = "timeSlot";
    ctx.state.timeSlotFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const disabledEdit = admin.secondary("config.edit.placeholder", "Edit").Placement("row").Disabled(true).AccessibilityLabel("Detailed editing is implemented in the next Phase 7 slice");
  const availabilitySelect = ctx.bind(admin.open("config.availability.open", "Edit day").Placement("detail"), function(event) {
    ctx.state.selectedAvailabilityDay = event.value && event.value.value;
    ctx.state.selectedAvailabilityId = event.value && event.value.id;
    ctx.state.configDrawer = editor.version.status === "draft" ? "availability" : null;
    ctx.state.availabilityFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
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
      admin.toolbar().Actions(editor.version.status === "draft" ? addTone : admin.primary("config.tone.add.disabled", "Add tone").Disabled(true)),
      admin.editableList("toneOptions", { items: toneEditorItems(editor.tones), emptyTitle: "No tone options" }).Actions(editor.version.status === "draft" ? openTone : disabledEdit)
    );
  }
  if (section === "budgets") {
    return admin.section("Budget options", { description: "Budget choices and explanatory copy." },
      tabs,
      admin.toolbar().Actions(editor.version.status === "draft" ? addBudget : admin.primary("config.budget.add.disabled", "Add budget").Disabled(true)),
      admin.editableList("budgetOptions", { items: budgetEditorItems(editor.budgets), emptyTitle: "No budget options" }).Actions(editor.version.status === "draft" ? openBudget : disabledEdit)
    );
  }
  if (section === "pricing") {
    return admin.section("Price ranges", { description: "Service/budget price range rules used by estimates." },
      tabs,
      admin.toolbar().Actions(editor.version.status === "draft" ? addPrice : admin.primary("config.price.add.disabled", "Add price").Disabled(true)),
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
      }).Actions(editor.version.status === "draft" ? openPrice : disabledEdit)
    );
  }
  if (section === "availability") {
    return admin.section("Availability and time slots", { description: "Published booking days and selectable appointment times." },
      tabs,
      admin.toolbar().Actions(editor.version.status === "draft" ? addAvailability : admin.primary("config.availability.add.disabled", "Add day").Disabled(true), editor.version.status === "draft" ? addTimeSlot : admin.primary("config.timeSlot.add.disabled", "Add time").Disabled(true)),
      admin.monthAvailabilityGrid("availabilityDays", { days: editor.availabilityDays || [], selected: ctx.state.selectedAvailabilityDay || "" }).Actions(availabilitySelect),
      admin.editableList("timeSlots", { items: timeSlotItems(editor.timeSlots), emptyTitle: "No time slots" }).Actions(editor.version.status === "draft" ? openTimeSlot : disabledEdit)
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
    admin.toolbar().Actions(editor.version.status === "draft" ? addService : admin.primary("config.service.add.disabled", "Add service").Disabled(true)),
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

function toneFormValues(ctx, tone) {
  return ctx.state.toneFormValues || {
    id: tone.id,
    value: tone.value,
    label: tone.label,
    sortOrder: String(tone.sortOrder || 0),
    enabled: tone.enabled ? "true" : "false"
  };
}

function toneFormErrors(values) {
  const errors = {};
  if (!String(values.value || "").trim()) errors.value = "Value is required";
  if (!String(values.label || "").trim()) errors.label = "Label is required";
  return errors;
}

function toneOptionDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const tone = ctx.state.selectedToneId === "__new__" ? { id: "__new__", value: "", label: "New tone", sortOrder: (editor.tones || []).length * 10 + 10, enabled: true } : findById(editor.tones, ctx.state.selectedToneId);
  if (!tone) {
    return admin.surface.drawer("toneOptionEditor", { title: "Tone unavailable", open: true },
      admin.summaryCard("Missing tone", { body: "The selected tone option no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = toneFormValues(ctx, tone);
  return admin.surface.drawer("toneOptionEditor", { title: "Edit tone option", open: true },
    admin.form("toneOptionForm", { title: tone.label, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Tone details",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("value", { label: "Value", value: values.value }),
        admin.textField("label", { label: "Label", value: values.label }),
        admin.textField("sortOrder", { label: "Sort order", value: values.sortOrder }),
        admin.textField("enabled", { label: "Enabled (true/false)", value: values.enabled })
      )
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function serviceOptionDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const service = ctx.state.selectedServiceId === "__new__" ? { id: "__new__", category: "color", value: "", title: "New service", subtitle: "", badge: "", sortOrder: (editor.services || []).length * 10 + 10, enabled: true } : findById(editor.services, ctx.state.selectedServiceId);
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
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function budgetFormValues(ctx, budget) {
  return ctx.state.budgetFormValues || {
    id: budget.id,
    value: budget.value,
    title: budget.title,
    subtitle: budget.subtitle || "",
    sortOrder: String(budget.sortOrder || 0),
    enabled: budget.enabled ? "true" : "false"
  };
}

function budgetFormErrors(values) {
  const errors = {};
  if (!String(values.value || "").trim()) errors.value = "Value is required";
  if (!String(values.title || "").trim()) errors.title = "Title is required";
  return errors;
}

function budgetOptionDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const budget = ctx.state.selectedBudgetId === "__new__" ? { id: "__new__", value: "", title: "New budget", subtitle: "", sortOrder: (editor.budgets || []).length * 10 + 10, enabled: true } : findById(editor.budgets, ctx.state.selectedBudgetId);
  if (!budget) {
    return admin.surface.drawer("budgetOptionEditor", { title: "Budget unavailable", open: true },
      admin.summaryCard("Missing budget", { body: "The selected budget option no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = budgetFormValues(ctx, budget);
  return admin.surface.drawer("budgetOptionEditor", { title: "Edit budget option", open: true },
    admin.form("budgetOptionForm", { title: budget.title, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Budget details",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("value", { label: "Value", value: values.value }),
        admin.textField("title", { label: "Title", value: values.title }),
        admin.textField("subtitle", { label: "Subtitle", value: values.subtitle }),
        admin.textField("sortOrder", { label: "Sort order", value: values.sortOrder }),
        admin.textField("enabled", { label: "Enabled (true/false)", value: values.enabled })
      )
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function priceFormValues(ctx, price) {
  return ctx.state.priceFormValues || {
    id: price.id,
    serviceValue: price.serviceValue || "",
    budgetValue: price.budgetValue || "",
    label: price.label,
    minCents: price.minCents == null ? "" : String(price.minCents),
    maxCents: price.maxCents == null ? "" : String(price.maxCents)
  };
}

function priceFormErrors(values) {
  const errors = {};
  if (!String(values.label || "").trim()) errors.label = "Label is required";
  const min = parseOptionalInt(values.minCents);
  const max = parseOptionalInt(values.maxCents);
  if (String(values.minCents || "").trim() && min === null) errors.minCents = "Minimum cents must be a number";
  if (String(values.maxCents || "").trim() && max === null) errors.maxCents = "Maximum cents must be a number";
  if (min !== null && max !== null && min > max) errors.maxCents = "Maximum must be greater than or equal to minimum";
  return errors;
}

function priceRangeDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const price = ctx.state.selectedPriceId === "__new__" ? { id: "__new__", serviceValue: "", budgetValue: "", label: "New price range", minCents: null, maxCents: null } : findById(editor.priceRanges, ctx.state.selectedPriceId);
  if (!price) {
    return admin.surface.drawer("priceRangeEditor", { title: "Price range unavailable", open: true },
      admin.summaryCard("Missing price range", { body: "The selected price range no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = priceFormValues(ctx, price);
  return admin.surface.drawer("priceRangeEditor", { title: "Edit price range", open: true },
    admin.form("priceRangeForm", { title: price.label, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Price rule",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("serviceValue", { label: "Service value", value: values.serviceValue }),
        admin.textField("budgetValue", { label: "Budget value", value: values.budgetValue }),
        admin.textField("label", { label: "Label", value: values.label }),
        admin.textField("minCents", { label: "Minimum cents", value: values.minCents }),
        admin.textField("maxCents", { label: "Maximum cents", value: values.maxCents })
      )
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function availabilityFormValues(ctx, day) {
  return ctx.state.availabilityFormValues || {
    id: day.id,
    value: day.value,
    day: day.day,
    date: day.date,
    dot: day.dot ? "true" : "false",
    disabled: day.disabled ? "true" : "false",
    disabledReason: day.disabledReason || "",
    sortOrder: String(day.sortOrder || 0)
  };
}

function availabilityFormErrors(values) {
  const errors = {};
  if (!String(values.value || "").trim()) errors.value = "Value is required";
  if (!String(values.day || "").trim()) errors.day = "Day label is required";
  if (!String(values.date || "").trim()) errors.date = "Date is required";
  return errors;
}

function availabilityDayDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const day = ctx.state.selectedAvailabilityId === "__new__" ? { id: "__new__", value: "", day: "", date: "", dot: true, disabled: false, disabledReason: "", sortOrder: (editor.availabilityDays || []).length * 10 + 10 } : findById(editor.availabilityDays, ctx.state.selectedAvailabilityId);
  if (!day) {
    return admin.surface.drawer("availabilityDayEditor", { title: "Availability day unavailable", open: true },
      admin.summaryCard("Missing availability day", { body: "The selected availability day no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = availabilityFormValues(ctx, day);
  return admin.surface.drawer("availabilityDayEditor", { title: "Edit availability day", open: true },
    admin.form("availabilityDayForm", { title: day.date, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Availability day",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("value", { label: "Value", value: values.value }),
        admin.textField("day", { label: "Day label", value: values.day }),
        admin.textField("date", { label: "Date", value: values.date }),
        admin.textField("dot", { label: "Has availability dot (true/false)", value: values.dot }),
        admin.textField("disabled", { label: "Disabled (true/false)", value: values.disabled }),
        admin.textField("disabledReason", { label: "Disabled reason", value: values.disabledReason }),
        admin.textField("sortOrder", { label: "Sort order", value: values.sortOrder })
      )
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function timeSlotFormValues(ctx, slot) {
  return ctx.state.timeSlotFormValues || {
    id: slot.id,
    value: slot.value,
    title: slot.title,
    sortOrder: String(slot.sortOrder || 0),
    enabled: slot.enabled ? "true" : "false"
  };
}

function timeSlotFormErrors(values) {
  const errors = {};
  if (!String(values.value || "").trim()) errors.value = "Value is required";
  if (!String(values.title || "").trim()) errors.title = "Title is required";
  return errors;
}

function timeSlotDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const slot = ctx.state.selectedTimeSlotId === "__new__" ? { id: "__new__", value: "", title: "New time", sortOrder: (editor.timeSlots || []).length * 10 + 10, enabled: true } : findById(editor.timeSlots, ctx.state.selectedTimeSlotId);
  if (!slot) {
    return admin.surface.drawer("timeSlotEditor", { title: "Time slot unavailable", open: true },
      admin.summaryCard("Missing time slot", { body: "The selected time slot no longer exists in this config version." }).Actions(cancelAction)
    );
  }
  const values = timeSlotFormValues(ctx, slot);
  return admin.surface.drawer("timeSlotEditor", { title: "Edit time slot", open: true },
    admin.form("timeSlotForm", { title: slot.title, values: values, errors: ctx.state.errors || {} },
      admin.fieldGroup("Time slot",
        admin.textField("id", { label: "ID", value: values.id }),
        admin.textField("value", { label: "Value", value: values.value }),
        admin.textField("title", { label: "Title", value: values.title }),
        admin.textField("sortOrder", { label: "Sort order", value: values.sortOrder }),
        admin.textField("enabled", { label: "Enabled (true/false)", value: values.enabled })
      )
    ).Actions(saveAction, cancelAction, deleteAction)
  );
}

function configScreen(ctx, deps) {
  const back = ctx.bind(admin.secondary("nav.dashboard", "Dashboard").Placement("toolbar"), function() { ctx.state.publishModal = false; return deps.go(ctx, "dashboard"); });
  const createDraft = ctx.bind(admin.primary("config.createDraft", "Create draft").Placement("toolbar"), function() {
    const draft = intakeAdmin.createDraftFromActive("Admin draft");
    ctx.state.configVersionId = draft.id;
    ctx.state.configSection = "services";
    ctx.state.publishModal = false;
    return configScreen(ctx, deps);
  });
  const selectVersion = ctx.bind(admin.open("config.version.open", "Open").Placement("row"), function(event) {
    ctx.state.configVersionId = event.value && event.value.id;
    ctx.state.configSection = "services";
    ctx.state.publishModal = false;
    return deps.render(ctx);
  });
  const openPublish = ctx.bind(admin.primary("config.publish.open", "Publish draft").Placement("toolbar"), function() {
    ctx.state.publishModal = true;
    return deps.render(ctx);
  });
  const cancelPublish = ctx.bind(admin.secondary("config.publish.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.publishModal = false;
    return deps.render(ctx);
  });
  const cancelService = ctx.bind(admin.secondary("config.service.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedServiceId = null;
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const cancelTone = ctx.bind(admin.secondary("config.tone.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedToneId = null;
    ctx.state.toneFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const cancelBudget = ctx.bind(admin.secondary("config.budget.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedBudgetId = null;
    ctx.state.budgetFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const cancelPrice = ctx.bind(admin.secondary("config.price.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedPriceId = null;
    ctx.state.priceFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const cancelAvailability = ctx.bind(admin.secondary("config.availability.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedAvailabilityId = null;
    ctx.state.availabilityFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const cancelTimeSlot = ctx.bind(admin.secondary("config.timeSlot.cancel", "Cancel").Placement("footer"), function() {
    ctx.state.configDrawer = null;
    ctx.state.selectedTimeSlotId = null;
    ctx.state.timeSlotFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  function deleteSelected(kind, selectedKey, formKey) {
    return function() {
      const id = ctx.state[selectedKey];
      if (id && id !== "__new__") intakeAdmin.deleteConfigEntity(kind, id);
      ctx.state.configDrawer = null;
      ctx.state[selectedKey] = null;
      ctx.state[formKey] = null;
      ctx.state.errors = {};
      return deps.render(ctx);
    };
  }
  const deleteService = ctx.bind(admin.danger("config.service.delete", "Delete service").Placement("footer"), deleteSelected("service", "selectedServiceId", "serviceFormValues"));
  const deleteTone = ctx.bind(admin.danger("config.tone.delete", "Delete tone").Placement("footer"), deleteSelected("tone", "selectedToneId", "toneFormValues"));
  const deleteBudget = ctx.bind(admin.danger("config.budget.delete", "Delete budget").Placement("footer"), deleteSelected("budget", "selectedBudgetId", "budgetFormValues"));
  const deletePrice = ctx.bind(admin.danger("config.price.delete", "Delete price").Placement("footer"), deleteSelected("price", "selectedPriceId", "priceFormValues"));
  const deleteAvailability = ctx.bind(admin.danger("config.availability.delete", "Delete day").Placement("footer"), deleteSelected("availability", "selectedAvailabilityId", "availabilityFormValues"));
  const deleteTimeSlot = ctx.bind(admin.danger("config.timeSlot.delete", "Delete time").Placement("footer"), deleteSelected("timeSlot", "selectedTimeSlotId", "timeSlotFormValues"));
  const saveService = ctx.bind(admin.primary("config.service.save", "Save service").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedServiceId;
    ctx.state.serviceFormValues = values;
    const errors = serviceFormErrors(values);
    if (Object.keys(errors).length) {
      ctx.state.errors = errors;
      return deps.render(ctx);
    }
    const payload = { category: values.category, value: values.value, title: values.title, subtitle: values.subtitle || "", badge: values.badge || "", sortOrder: parseIntOrZero(values.sortOrder), enabled: parseBool(values.enabled) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "service", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updateServiceOption({ id: values.id, category: payload.category, value: payload.value, title: payload.title, subtitle: payload.subtitle, badge: payload.badge, sortOrder: payload.sortOrder, enabled: payload.enabled });
    ctx.state.configDrawer = null;
    ctx.state.selectedServiceId = null;
    ctx.state.serviceFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const saveTone = ctx.bind(admin.primary("config.tone.save", "Save tone").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedToneId;
    ctx.state.toneFormValues = values;
    const errors = toneFormErrors(values);
    if (Object.keys(errors).length) {
      ctx.state.errors = errors;
      return deps.render(ctx);
    }
    const payload = { value: values.value, label: values.label, sortOrder: parseIntOrZero(values.sortOrder), enabled: parseBool(values.enabled) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "tone", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updateToneOption({ id: values.id, value: payload.value, label: payload.label, sortOrder: payload.sortOrder, enabled: payload.enabled });
    ctx.state.configDrawer = null;
    ctx.state.selectedToneId = null;
    ctx.state.toneFormValues = null;
    ctx.state.errors = {};
    return deps.render(ctx);
  });
  const saveBudget = ctx.bind(admin.primary("config.budget.save", "Save budget").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedBudgetId;
    ctx.state.budgetFormValues = values;
    const errors = budgetFormErrors(values);
    if (Object.keys(errors).length) { ctx.state.errors = errors; return deps.render(ctx); }
    const payload = { value: values.value, title: values.title, subtitle: values.subtitle || "", sortOrder: parseIntOrZero(values.sortOrder), enabled: parseBool(values.enabled) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "budget", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updateBudgetOption({ id: values.id, value: payload.value, title: payload.title, subtitle: payload.subtitle, sortOrder: payload.sortOrder, enabled: payload.enabled });
    ctx.state.configDrawer = null; ctx.state.selectedBudgetId = null; ctx.state.budgetFormValues = null; ctx.state.errors = {};
    return deps.render(ctx);
  });
  const savePrice = ctx.bind(admin.primary("config.price.save", "Save price").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedPriceId;
    ctx.state.priceFormValues = values;
    const errors = priceFormErrors(values);
    if (Object.keys(errors).length) { ctx.state.errors = errors; return deps.render(ctx); }
    const payload = { serviceValue: values.serviceValue || "", budgetValue: values.budgetValue || "", label: values.label, minCents: parseOptionalInt(values.minCents), maxCents: parseOptionalInt(values.maxCents) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "price", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updatePriceRange({ id: values.id, serviceValue: payload.serviceValue, budgetValue: payload.budgetValue, label: payload.label, minCents: payload.minCents, maxCents: payload.maxCents });
    ctx.state.configDrawer = null; ctx.state.selectedPriceId = null; ctx.state.priceFormValues = null; ctx.state.errors = {};
    return deps.render(ctx);
  });
  const saveAvailability = ctx.bind(admin.primary("config.availability.save", "Save day").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedAvailabilityId;
    ctx.state.availabilityFormValues = values;
    const errors = availabilityFormErrors(values);
    if (Object.keys(errors).length) { ctx.state.errors = errors; return deps.render(ctx); }
    const payload = { value: values.value, day: values.day, date: values.date, dot: parseBool(values.dot), disabled: parseBool(values.disabled), disabledReason: values.disabledReason || "", sortOrder: parseIntOrZero(values.sortOrder) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "availability", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updateAvailabilityDay({ id: values.id, value: payload.value, day: payload.day, date: payload.date, dot: payload.dot, disabled: payload.disabled, disabledReason: payload.disabledReason, sortOrder: payload.sortOrder });
    ctx.state.configDrawer = null; ctx.state.selectedAvailabilityId = null; ctx.state.availabilityFormValues = null; ctx.state.errors = {};
    return deps.render(ctx);
  });
  const saveTimeSlot = ctx.bind(admin.primary("config.timeSlot.save", "Save time slot").Placement("footer"), function(event) {
    const values = event.value || {};
    values.id = values.id || ctx.state.selectedTimeSlotId;
    ctx.state.timeSlotFormValues = values;
    const errors = timeSlotFormErrors(values);
    if (Object.keys(errors).length) { ctx.state.errors = errors; return deps.render(ctx); }
    const payload = { value: values.value, title: values.title, sortOrder: parseIntOrZero(values.sortOrder), enabled: parseBool(values.enabled) };
    if (values.id === "__new__") intakeAdmin.createConfigEntity({ kind: "timeSlot", configVersionId: ctx.state.configVersionId, values: payload });
    else intakeAdmin.updateTimeSlot({ id: values.id, value: payload.value, title: payload.title, sortOrder: payload.sortOrder, enabled: payload.enabled });
    ctx.state.configDrawer = null; ctx.state.selectedTimeSlotId = null; ctx.state.timeSlotFormValues = null; ctx.state.errors = {};
    return deps.render(ctx);
  });
  const confirmPublish = ctx.bind(admin.danger("config.publish.confirm", "Publish").Placement("footer"), function() {
    const editor = intakeAdmin.getConfigEditor(ctx.state.configVersionId || "");
    const published = intakeAdmin.publishConfigVersion(editor.version.id);
    ctx.state.configVersionId = published.id;
    ctx.state.configSection = "validation";
    ctx.state.publishModal = false;
    return deps.render(ctx);
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
      configEditorSection(ctx, editor, deps)
    );

  if (ctx.state.publishModal) {
    page.Modals(admin.surface.modal("publishConfig", { title: "Publish intake config?", open: true },
      admin.summaryCard("Publish " + editor.version.label, { body: "Publishing this draft will archive the current active config and make the selected rows visible to customer intake sessions." }).Actions(cancelPublish, confirmPublish)
    ));
  }
  if (ctx.state.configDrawer === "service") {
    page.Drawers(serviceOptionDrawer(ctx, editor, saveService, cancelService, deleteService));
  }
  if (ctx.state.configDrawer === "tone") {
    page.Drawers(toneOptionDrawer(ctx, editor, saveTone, cancelTone, deleteTone));
  }
  if (ctx.state.configDrawer === "budget") {
    page.Drawers(budgetOptionDrawer(ctx, editor, saveBudget, cancelBudget, deleteBudget));
  }
  if (ctx.state.configDrawer === "price") {
    page.Drawers(priceRangeDrawer(ctx, editor, savePrice, cancelPrice, deletePrice));
  }
  if (ctx.state.configDrawer === "availability") {
    page.Drawers(availabilityDayDrawer(ctx, editor, saveAvailability, cancelAvailability, deleteAvailability));
  }
  if (ctx.state.configDrawer === "timeSlot") {
    page.Drawers(timeSlotDrawer(ctx, editor, saveTimeSlot, cancelTimeSlot, deleteTimeSlot));
  }

  return page.MustBuild();
}

module.exports = { configScreen };
