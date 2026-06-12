const admin = require("fringe/admin-dsl");
const helpers = require("./intake_config_helpers.flow.js");
const findById = helpers.findById;

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
      admin.panel("Missing tone", { ariaLabel: "Missing tone" }, admin.markdown("The selected tone option no longer exists in this config version.", {})).FooterActions(cancelAction)
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

function serviceOptionDrawer(ctx, editor, saveAction, cancelAction, deleteAction) {
  const service = ctx.state.selectedServiceId === "__new__" ? { id: "__new__", category: "color", value: "", title: "New service", subtitle: "", badge: "", sortOrder: (editor.services || []).length * 10 + 10, enabled: true } : findById(editor.services, ctx.state.selectedServiceId);
  if (!service) {
    return admin.surface.drawer("serviceOptionEditor", { title: "Service unavailable", open: true },
      admin.panel("Missing service", { ariaLabel: "Missing service" }, admin.markdown("The selected service option no longer exists in this config version.", {})).FooterActions(cancelAction)
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
      admin.panel("Missing budget", { ariaLabel: "Missing budget" }, admin.markdown("The selected budget option no longer exists in this config version.", {})).FooterActions(cancelAction)
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
      admin.panel("Missing price range", { ariaLabel: "Missing price range" }, admin.markdown("The selected price range no longer exists in this config version.", {})).FooterActions(cancelAction)
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
      admin.panel("Missing availability day", { ariaLabel: "Missing availability day" }, admin.markdown("The selected availability day no longer exists in this config version.", {})).FooterActions(cancelAction)
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
      admin.panel("Missing time slot", { ariaLabel: "Missing time slot" }, admin.markdown("The selected time slot no longer exists in this config version.", {})).FooterActions(cancelAction)
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

module.exports = { toneFormErrors, toneOptionDrawer, serviceFormErrors, serviceOptionDrawer, budgetFormErrors, budgetOptionDrawer, priceFormErrors, priceRangeDrawer, availabilityFormErrors, availabilityDayDrawer, timeSlotFormErrors, timeSlotDrawer };
