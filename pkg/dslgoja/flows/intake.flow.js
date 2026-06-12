const { page, n } = require("fringe/dsl");
const images = require("host/images");
const configDb = require("configDb");

// ── Config helpers ───────────────────────────────────────────────────

function queryConfig(sql, args) {
  return configDb.query(sql, args || []);
}

function configVersion(ctx) {
  if (ctx.state.configVersionId) return ctx.state.configVersionId;
  var rows = queryConfig(
    "SELECT id FROM dsl_config_versions WHERE status = ? ORDER BY activated_at DESC LIMIT 1",
    ["active"]
  );
  if (!rows.length) throw new Error("configDb has no active dsl_config_versions row");
  ctx.state.configVersionId = rows[0].id;
  return ctx.state.configVersionId;
}

function configuredServiceOptions(ctx) {
  return queryConfig(
    "SELECT value, title, subtitle, badge FROM dsl_service_options WHERE config_version_id = ? AND category = ? AND enabled = 1 ORDER BY sort_order",
    [configVersion(ctx), ctx.state.category]
  );
}

function configuredToneOptions(ctx) {
  return queryConfig(
    "SELECT value, label FROM dsl_tone_options WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order",
    [configVersion(ctx)]
  );
}

function configuredBudgetOptions(ctx) {
  return queryConfig(
    "SELECT value, title, subtitle FROM dsl_budget_options WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order",
    [configVersion(ctx)]
  );
}

function configuredDayOptions(ctx) {
  var rows = queryConfig(
    "SELECT value, day, date, dot, disabled FROM dsl_availability_days WHERE config_version_id = ? ORDER BY sort_order",
    [configVersion(ctx)]
  );
  return rows.map(function (row) {
    return {
      value: row.value,
      day: row.day,
      date: row.date,
      dot: row.dot === true || Number(row.dot) === 1,
      disabled: row.disabled === true || Number(row.disabled) === 1,
    };
  });
}

function configuredTimeOptions(ctx) {
  return queryConfig(
    "SELECT value, title FROM dsl_time_slots WHERE config_version_id = ? AND enabled = 1 ORDER BY sort_order",
    [configVersion(ctx)]
  );
}

// ── Step definitions (used by shell helper for desktop rail navigation) ──

const stepDefs = [
  { id: "service", label: "01 Service" },
  { id: "color", label: "02 Color" },
  { id: "photos", label: "03 Photos" },
  { id: "budget", label: "04 Budget" },
  { id: "estimate", label: "05 Estimate" },
  { id: "booking", label: "06 Booking" },
  { id: "confirm", label: "07 Confirm" },
];

// ── State ─────────────────────────────────────────────────────────────

function initialState() {
  return {
    step: "service",
    configVersionId: "cfg_default",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    damage: 2,
    photos: { front: null, side: null, back: null },
    budget: "flexible",
    day: "2026-06-19",
    time: "12:00",
  };
}

// ── Router ────────────────────────────────────────────────────────────

function goto(ctx, step) {
  ctx.state.step = step;
  return render(ctx);
}

function render(ctx) {
  switch (ctx.state.step) {
    case "color":    return colorStep(ctx);
    case "photos":   return photosStep(ctx);
    case "budget":   return budgetStep(ctx);
    case "estimate": return estimateStep(ctx);
    case "booking":  return bookingStep(ctx);
    case "confirm":  return confirmStep(ctx);
    case "service":
    default:         return serviceStep(ctx);
  }
}

// ── Shell helper ─────────────────────────────────────────────────────

function shell(ctx, config) {
  const actions = {};
  if (config.back) actions.back = ctx.action("back", function () { return goto(ctx, config.back); }, "back");
  if (config.next) actions.next = ctx.action("next", function () { return goto(ctx, config.next); }, "next");
  if (config.skip) actions.skip = ctx.action("skip", function () { return goto(ctx, config.skip); }, "skip");

  // Build step rail items with goto actions for desktop navigation
  var steps = stepDefs.map(function (def, index) {
    return {
      id: def.id,
      label: def.label,
      index: index + 1,
      current: def.id === config.stepId,
      disabled: false,
      actions: {
        select: ctx.action("goto:" + def.id, function () { return goto(ctx, def.id); }, "goto"),
      },
    };
  });

  return {
    step: config.step, total: 7, stepId: config.stepId,
    eyebrow: config.eyebrow, title: config.title,
    nextLabel: config.nextLabel || "Keep going →",
    actions, steps,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function selectedServiceName(ctx) {
  var match = configuredServiceOptions(ctx).find(function (o) { return o.value === ctx.state.service; });
  return match ? match.title : "Highlights";
}

function estimateRange(ctx) {
  var version = configVersion(ctx);
  var rows = queryConfig(
    "SELECT label FROM dsl_price_ranges WHERE config_version_id = ? AND budget_value = ? ORDER BY id LIMIT 1",
    [version, ctx.state.budget]
  );
  if (rows.length) return rows[0].label;
  rows = queryConfig(
    "SELECT label FROM dsl_price_ranges WHERE config_version_id = ? AND service_value = ? AND budget_value IS NULL ORDER BY id LIMIT 1",
    [version, ctx.state.service]
  );
  if (rows.length) return rows[0].label;
  rows = queryConfig(
    "SELECT label FROM dsl_price_ranges WHERE config_version_id = ? AND service_value IS NULL AND budget_value IS NULL ORDER BY id LIMIT 1",
    [version]
  );
  if (rows.length) return rows[0].label;
  throw new Error("configDb has no price range for service=" + ctx.state.service + " budget=" + ctx.state.budget);
}

function photoCount(ctx) {
  return Object.keys(ctx.state.photos).filter(function (k) { return !!ctx.state.photos[k]; }).length;
}

function editAction(ctx, name, step) {
  return { actions: { edit: ctx.action(name, function () { return goto(ctx, step); }, "edit") } };
}

function submitIntakeRequest(ctx) {
  const intake = require("host/intake");
  var day = configuredDayOptions(ctx).find(function (item) { return item.value === ctx.state.day; });
  var time = configuredTimeOptions(ctx).find(function (item) { return item.value === ctx.state.time; });
  var request = intake.createRequest({
    sessionId: ctx.sessionId,
    configVersionId: configVersion(ctx),
    serviceCategory: ctx.state.category,
    serviceValue: ctx.state.service,
    tones: ctx.state.tones || [],
    damage: ctx.state.damage,
    photos: ctx.state.photos || {},
    budgetValue: ctx.state.budget,
    dayValue: ctx.state.day,
    timeValue: ctx.state.time,
    estimateLabel: estimateRange(ctx),
    request: {
      selectedServiceName: selectedServiceName(ctx),
      selectedDayLabel: day ? day.day : null,
      selectedTimeLabel: time ? time.title : null
    }
  });
  ctx.state.submittedRequestId = request.id;
  return request;
}

// ── Context panel helpers ────────────────────────────────────────────
// These nodes get .region("context") so the desktop renderer pulls them
// into the right-side accent panel. On mobile they just stack below main content.

function stylistContext() {
  return n.personCard("Mia Rodriguez", {
    role: "Senior colorist · 8 yrs",
    badge: "$180/hr",
    available: "Next: Jun 18",
  }).id("stylist-context").region("context");
}

/** Living summary that grows as the user progresses through the flow. */
function stepSummary(ctx) {
  var rows = [];
  if (ctx.state.service) {
    rows.push(n.kvRow("Service", selectedServiceName(ctx)).id("ctx-service").region("context"));
  }
  if (ctx.state.tones && ctx.state.tones.length) {
    rows.push(n.kvRow("Tones", ctx.state.tones.join(", ")).id("ctx-tones").region("context"));
  }
  if (photoCount(ctx)) {
    rows.push(n.kvRow("Photos", String(photoCount(ctx)) + " angles").id("ctx-photos").region("context"));
  }
  if (ctx.state.budget) {
    rows.push(n.kvRow("Budget", ctx.state.budget).id("ctx-budget").region("context"));
  }
  if (ctx.state.day) {
    var day = configuredDayOptions(ctx).find(function (d) { return d.value === ctx.state.day; });
    if (day) {
      rows.push(n.kvRow("Date", "June " + day.day).id("ctx-day").region("context"));
    }
  }
  if (ctx.state.time) {
    var time = configuredTimeOptions(ctx).find(function (t) { return t.value === ctx.state.time; });
    if (time) {
      rows.push(n.kvRow("Time", time.title).id("ctx-time").region("context"));
    }
  }
  // Wrap in a card so they render as a summary block
  if (rows.length > 0) {
    return n.card({ accent: "#6b3a4a" }, ...rows).id("step-summary").region("context");
  }
  return null;
}

/** Nodes to append to every step for the desktop context panel. */
function contextNodes(ctx) {
  var nodes = [stylistContext()];
  var summary = stepSummary(ctx);
  if (summary) nodes.push(summary);
  return nodes;
}

// ── Step 1: Service ──────────────────────────────────────────────────

function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake(shell(ctx, {
      step: 1, stepId: "service", eyebrow: "Chapter I · The Ask", title: "What brings you in?",
      next: "color", skip: "color",
    }))
    .add(
      n.text("Pick one to start — you can add more later.", { variant: "editorial", style: { marginBottom: 16 } }).id("service-intro"),
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], ctx.state.category, {
        actions: { change: ctx.action("setCategory", function (event) { ctx.state.category = event.value; return render(ctx); }, "change") },
        style: { marginBottom: 16 },
      }).id("category-tabs"),
      n.selectableGroup(configuredServiceOptions(ctx), ctx.state.service, {
        mode: "single",
        actions: { change: ctx.action("setService", function (event) { ctx.state.service = event.value; return render(ctx); }, "change") },
      }).id("service-options"),
      // Context panel (desktop: right column accent panel)
      stylistContext(),
    )
    .toJSON();
}

// ── Step 2: Color ────────────────────────────────────────────────────

function colorStep(ctx) {
  return page("intake-color", "Color")
    .intake(shell(ctx, {
      step: 2, stepId: "color", eyebrow: "Chapter II · The Color", title: "Tune the plan",
      back: "service", next: "photos",
    }))
    .add(
      n.chipGroup(configuredToneOptions(ctx), ctx.state.tones, {
        label: "Tone family",
        helperText: "Select the tones you want for your color.",
        actions: { change: ctx.action("setTones", function (event) { ctx.state.tones = event.value; return render(ctx); }, "change") },
      }).id("tone-chips"),
      n.scale(ctx.state.damage, {
        label: "Damage", max: 5, interactive: true,
        actions: { change: ctx.action("setDamage", function (event) { ctx.state.damage = Number(event.value); return render(ctx); }, "change") },
        style: { marginTop: 14 },
      }).id("damage-rating"),
      // Context panel
      stylistContext(),
      stepSummary(ctx),
    )
    .toJSON();
}

// ── Step 3: Photos ───────────────────────────────────────────────────

function photosStep(ctx) {
  function tile(key, label) {
    var existing = ctx.state.photos[key];
    var intent = images.createUploadIntent({ purpose: "intake-photo", slot: key, maxBytes: 5 * 1024 * 1024 });
    return n.uploadTile(label, {
      value: key,
      filled: !!existing,
      imageUrl: existing ? existing.url : null,
      imageAlt: label + " hair reference photo",
      upload: intent,
      actions: {
        upload: ctx.action("uploadPhoto:" + key, function (event) {
          ctx.state.photos[key] = event.value;
          return render(ctx);
        }, "upload"),
        remove: ctx.action("removePhoto:" + key, function () {
          ctx.state.photos[key] = null;
          return render(ctx);
        }, "remove"),
      },
    }).id("photo-" + key);
  }

  return page("intake-photos", "Photos")
    .intake(shell(ctx, {
      step: 3, stepId: "photos", eyebrow: "Chapter III · References", title: "Add a few photos",
      back: "color", next: "budget", skip: "budget",
    }))
    .add(
      n.text("Upload or mark the angles that help the stylist understand your current hair and goal.", {
        variant: "editorial", style: { marginBottom: 16 },
      }).id("photos-intro"),
      n.grid(3, { gap: 10 },
        tile("front", "Front"),
        tile("side", "Side"),
        tile("back", "Back")
      ).id("photo-grid"),
      n.note(photoCount(ctx) + " photo angles selected", { tone: "info", style: { marginTop: 14 } }).id("photo-count"),
      // Context panel
      stylistContext(),
      stepSummary(ctx),
    )
    .toJSON();
}

// ── Step 4: Budget ────────────────────────────────────────────────────

function budgetStep(ctx) {
  return page("intake-budget", "Budget")
    .intake(shell(ctx, {
      step: 4, stepId: "budget", eyebrow: "Chapter IV · Budget", title: "Choose a comfort zone",
      back: "photos", next: "estimate",
    }))
    .add(
      n.text("This does not lock you in. It helps us shape the recommendation before you book.", {
        variant: "editorial", style: { marginBottom: 16 },
      }).id("budget-intro"),
      n.selectableGroup(configuredBudgetOptions(ctx), ctx.state.budget, {
        mode: "single",
        actions: { change: ctx.action("setBudget", function (event) { ctx.state.budget = event.value; return render(ctx); }, "change") },
      }).id("budget-options"),
      // Context panel
      stylistContext(),
      stepSummary(ctx),
    )
    .toJSON();
}

// ── Step 5: Estimate ─────────────────────────────────────────────────

function estimateStep(ctx) {
  return page("intake-estimate", "Estimate")
    .intake(shell(ctx, {
      step: 5, stepId: "estimate", eyebrow: "Chapter V · Preview", title: "Your working estimate",
      back: "budget", next: "booking", nextLabel: "Pick a time →",
    }))
    .add(
      n.stat("$245", { label: "ESTIMATED · USD", subtitle: "Based on your selections." }).region("context").id("estimate-hero"),
      n.card({ accent: "#6b3a4a", style: { marginBottom: 14 } },
        n.kvRow("Service", selectedServiceName(ctx), editAction(ctx, "editEstimateService", "service")).id("estimate-service"),
        n.kvRow("Tone", (ctx.state.tones || []).join(", ") || "Not sure yet", editAction(ctx, "editEstimateColor", "color")).id("estimate-tones"),
        n.kvRow("Photos", String(photoCount(ctx)), editAction(ctx, "editEstimatePhotos", "photos")).id("estimate-photos"),
        n.kvRow("Budget", ctx.state.budget, editAction(ctx, "editEstimateBudget", "budget")).id("estimate-budget"),
        n.kvRow("Range", estimateRange(ctx)).id("estimate-range")
      ).id("estimate-card"),
      n.note("Final pricing is confirmed after stylist review.", { tone: "info" }).id("estimate-note"),
      // Context panel: stylist card (stat already pulled by partitionForDesktop)
      stylistContext(),
    )
    .toJSON();
}

// ── Step 6: Booking ──────────────────────────────────────────────────

function bookingStep(ctx) {
  return page("intake-booking", "Booking")
    .intake(shell(ctx, {
      step: 6, stepId: "booking", eyebrow: "Chapter VI · Calendar", title: "Choose a time",
      back: "estimate", next: "confirm", nextLabel: "Reserve →",
    }))
    .add(
      n.calendarGrid(2026, 6, configuredDayOptions(ctx), ctx.state.day, {
        showWeekdays: true,
        monthLabel: "June 2026",
        actions: { change: ctx.action("setDay", function (event) { ctx.state.day = event.value; return render(ctx); }, "change") },
        style: { marginBottom: 16 },
      }).id("booking-days"),
      n.selectableGroup(configuredTimeOptions(ctx), ctx.state.time, {
        mode: "single", columns: 2,
        actions: { change: ctx.action("setTime", function (event) { ctx.state.time = event.value; return render(ctx); }, "change") },
      }).id("booking-times"),
      // Context panel: estimate range + stylist + summary
      n.stat(estimateRange(ctx), { label: "ESTIMATED RANGE" }).region("context").id("booking-range"),
      stylistContext(),
      stepSummary(ctx),
    )
    .toJSON();
}

// ── Step 7: Confirm ──────────────────────────────────────────────────

function confirmStep(ctx) {
  var day = configuredDayOptions(ctx).find(function (item) { return item.value === ctx.state.day; });
  var time = configuredTimeOptions(ctx).find(function (item) { return item.value === ctx.state.time; });
  var submitted = !!ctx.state.submittedRequestId;
  return page("intake-confirm", "Confirm")
    .intake(shell(ctx, {
      step: 7, stepId: "confirm", eyebrow: "Chapter VII · Done", title: submitted ? "Request received" : "Review and submit",
      back: "booking", next: "service", nextLabel: "Start over",
    }))
    .add(
      n.note(submitted ? "Your request is saved for stylist review. Request id: " + ctx.state.submittedRequestId : "Review your intake details, then submit the request for stylist review.", {
        tone: submitted ? "success" : "info", style: { marginBottom: 16 },
      }).id("confirm-success"),
      n.card({ accent: "#7a8f6b" },
        n.kvRow("Service", selectedServiceName(ctx), editAction(ctx, "editConfirmService", "service")).id("confirm-service"),
        n.kvRow("Estimate", estimateRange(ctx), editAction(ctx, "editConfirmEstimate", "estimate")).id("confirm-estimate"),
        n.kvRow("Date", day ? day.day : "TBD", editAction(ctx, "editConfirmBookingDay", "booking")).id("confirm-day"),
        n.kvRow("Time", time ? time.title : "TBD", editAction(ctx, "editConfirmBookingTime", "booking")).id("confirm-time")
      ).id("confirm-card"),
      submitted ? n.note("You can start over or close this page.", { tone: "success", style: { marginTop: 16 } }).id("submitted-note") : n.button("Submit request", {
        variant: "primary",
        style: { marginTop: 16 },
        actions: { click: ctx.action("submitIntakeRequest", function () { submitIntakeRequest(ctx); return render(ctx); }, "submit") },
      }).id("submit-intake-request"),
      // Context panel: stylist + estimate
      stylistContext(),
      n.stat(estimateRange(ctx), { label: "ESTIMATED RANGE" }).region("context").id("confirm-range"),
    )
    .toJSON();
}
