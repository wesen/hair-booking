const { page, n } = require("fringe/dsl");

const serviceOptions = [
  { value: "cut", name: "Cut", description: "Trim · restyle · bangs", rate: "$80+" },
  { value: "highlights", name: "Highlights", description: "Partial · full · balayage", rate: "$180+" },
  { value: "gloss", name: "Gloss refresh", description: "Tone · shine · maintenance", rate: "$120+" },
];

const toneOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

const budgetOptions = [
  { value: "under-200", label: "Under $200", description: "Refresh, trim, gloss, or maintenance." },
  { value: "200-350", label: "$200–$350", description: "Most color refresh and partial highlight plans." },
  { value: "350-plus", label: "$350+", description: "Transformations, extensions, and multi-step color." },
  { value: "flexible", label: "Flexible", description: "Show me the best plan first." },
];

const dayOptions = [
  { value: "2026-05-18", day: "18", label: "Mon 18", dot: true },
  { value: "2026-05-19", day: "19", label: "Tue 19", dot: true },
  { value: "2026-05-20", day: "20", label: "Wed 20" },
  { value: "2026-05-21", day: "21", label: "Thu 21", dot: true },
  { value: "2026-05-22", day: "22", label: "Fri 22" },
  { value: "2026-05-23", day: "23", label: "Sat 23", disabled: true },
  { value: "2026-05-24", day: "24", label: "Sun 24", disabled: true },
];

const timeOptions = [
  { value: "10:30", label: "10:30a" },
  { value: "12:00", label: "12:00p" },
  { value: "14:00", label: "2:00p" },
  { value: "16:30", label: "4:30p" },
];

function initialState() {
  return {
    step: "service",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    damage: 2,
    photos: {
      front: false,
      side: false,
      back: false,
    },
    budget: "flexible",
    day: "2026-05-19",
    time: "12:00",
  };
}

function goto(ctx, step) {
  ctx.state.step = step;
  return render(ctx);
}

function render(ctx) {
  switch (ctx.state.step) {
    case "color":
      return colorStep(ctx);
    case "photos":
      return photosStep(ctx);
    case "budget":
      return budgetStep(ctx);
    case "estimate":
      return estimateStep(ctx);
    case "booking":
      return bookingStep(ctx);
    case "confirm":
      return confirmStep(ctx);
    case "service":
    default:
      return serviceStep(ctx);
  }
}

function shell(ctx, config) {
  const actions = {};
  if (config.back) actions.back = ctx.action("back", function () { return goto(ctx, config.back); }, "back");
  if (config.next) actions.next = ctx.action("next", function () { return goto(ctx, config.next); }, "next");
  if (config.skip) actions.skip = ctx.action("skip", function () { return goto(ctx, config.skip); }, "skip");
  return {
    step: config.step,
    total: 7,
    eyebrow: config.eyebrow,
    title: config.title,
    nextLabel: config.nextLabel || "Keep going →",
    actions,
  };
}

function selectedServiceName(ctx) {
  const match = serviceOptions.find(function (item) { return item.value === ctx.state.service; });
  return match ? match.name : "Highlights";
}

function estimateRange(ctx) {
  if (ctx.state.budget === "under-200") return "$120–$190";
  if (ctx.state.budget === "200-350") return "$220–$340";
  if (ctx.state.budget === "350-plus") return "$360–$520";
  return ctx.state.service === "cut" ? "$80–$160" : "$220–$420";
}

function photoCount(ctx) {
  return Object.keys(ctx.state.photos).filter(function (key) { return ctx.state.photos[key]; }).length;
}

function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake(shell(ctx, {
      step: 1,
      eyebrow: "Chapter I · The Ask",
      title: "What brings you in?",
      next: "color",
      skip: "color",
    }))
    .add(
      n.text("This page is authored by JavaScript running in Goja inside the Go backend.", {
        variant: "editorial",
        style: { marginBottom: 16 },
      }).id("service-intro"),
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], ctx.state.category, {
        actions: {
          change: ctx.action("setCategory", function (event) {
            ctx.state.category = event.value;
            return render(ctx);
          }, "change"),
        },
        style: { marginBottom: 16 },
      }).id("category-tabs"),
      n.serviceOptionGroup(serviceOptions, ctx.state.service, {
        actions: {
          change: ctx.action("setService", function (event) {
            ctx.state.service = event.value;
            return render(ctx);
          }, "change"),
        },
      }).id("service-options"),
    )
    .toJSON();
}

function colorStep(ctx) {
  return page("intake-color", "Color")
    .intake(shell(ctx, {
      step: 2,
      eyebrow: "Chapter II · The Color",
      title: "Tune the plan",
      back: "service",
      next: "photos",
    }))
    .add(
      n.chipGroup(toneOptions, ctx.state.tones, {
        label: "Tone family",
        helperText: "These chips are backed by ctx.state.tones in the Goja flow session.",
        actions: {
          change: ctx.action("setTones", function (event) {
            ctx.state.tones = event.value;
            return render(ctx);
          }, "change"),
        },
      }).id("tone-chips"),
      n.ratingBar(ctx.state.damage, {
        label: "Damage",
        interactive: true,
        actions: {
          change: ctx.action("setDamage", function (event) {
            ctx.state.damage = Number(event.value);
            return render(ctx);
          }, "change"),
        },
        style: { marginTop: 14 },
      }).id("damage-rating"),
    )
    .toJSON();
}

function photosStep(ctx) {
  function tile(key, label) {
    return n.photoTile(label, {
      value: key,
      filled: !!ctx.state.photos[key],
      actions: {
        upload: ctx.action("uploadPhoto:" + key, function () {
          ctx.state.photos[key] = true;
          return render(ctx);
        }, "upload"),
        remove: ctx.action("removePhoto:" + key, function () {
          ctx.state.photos[key] = false;
          return render(ctx);
        }, "remove"),
      },
    }).id("photo-" + key);
  }

  return page("intake-photos", "Photos")
    .intake(shell(ctx, {
      step: 3,
      eyebrow: "Chapter III · References",
      title: "Add a few photos",
      back: "color",
      next: "budget",
      skip: "budget",
    }))
    .add(
      n.text("Upload or mark the angles that help the stylist understand your current hair and goal.", {
        variant: "editorial",
        style: { marginBottom: 16 },
      }).id("photos-intro"),
      n.grid(3, { gap: 10 },
        tile("front", "Front"),
        tile("side", "Side"),
        tile("back", "Back")
      ).id("photo-grid"),
      n.note(photoCount(ctx) + " photo angles selected", { tone: "info", style: { marginTop: 14 } }).id("photo-count"),
    )
    .toJSON();
}

function budgetStep(ctx) {
  return page("intake-budget", "Budget")
    .intake(shell(ctx, {
      step: 4,
      eyebrow: "Chapter IV · Budget",
      title: "Choose a comfort zone",
      back: "photos",
      next: "estimate",
    }))
    .add(
      n.text("This does not lock you in. It helps us shape the recommendation before you book.", {
        variant: "editorial",
        style: { marginBottom: 16 },
      }).id("budget-intro"),
      n.budgetOptionGroup(budgetOptions, ctx.state.budget, {
        actions: {
          change: ctx.action("setBudget", function (event) {
            ctx.state.budget = event.value;
            return render(ctx);
          }, "change"),
        },
      }).id("budget-options"),
    )
    .toJSON();
}

function estimateStep(ctx) {
  return page("intake-estimate", "Estimate")
    .intake(shell(ctx, {
      step: 5,
      eyebrow: "Chapter V · Preview",
      title: "Your working estimate",
      back: "budget",
      next: "booking",
      nextLabel: "Pick a time →",
    }))
    .add(
      n.card({ accent: "#6b3a4a", style: { marginBottom: 14 } },
        n.summaryRow("Service", selectedServiceName(ctx)).id("estimate-service"),
        n.summaryRow("Tone", (ctx.state.tones || []).join(", ") || "Not sure yet").id("estimate-tones"),
        n.summaryRow("Photos", String(photoCount(ctx))).id("estimate-photos"),
        n.summaryRow("Budget", ctx.state.budget).id("estimate-budget"),
        n.summaryRow("Range", estimateRange(ctx)).id("estimate-range")
      ).id("estimate-card"),
      n.note("Final pricing is confirmed after stylist review.", { tone: "info" }).id("estimate-note"),
    )
    .toJSON();
}

function bookingStep(ctx) {
  return page("intake-booking", "Booking")
    .intake(shell(ctx, {
      step: 6,
      eyebrow: "Chapter VI · Calendar",
      title: "Choose a time",
      back: "estimate",
      next: "confirm",
      nextLabel: "Reserve →",
    }))
    .add(
      n.dayPickerGrid(dayOptions, ctx.state.day, {
        actions: {
          change: ctx.action("setDay", function (event) {
            ctx.state.day = event.value;
            return render(ctx);
          }, "change"),
        },
        style: { marginBottom: 16 },
      }).id("booking-days"),
      n.timeSlotGroup(timeOptions, ctx.state.time, {
        columns: 2,
        actions: {
          change: ctx.action("setTime", function (event) {
            ctx.state.time = event.value;
            return render(ctx);
          }, "change"),
        },
      }).id("booking-times"),
    )
    .toJSON();
}

function confirmStep(ctx) {
  const day = dayOptions.find(function (item) { return item.value === ctx.state.day; });
  const time = timeOptions.find(function (item) { return item.value === ctx.state.time; });
  return page("intake-confirm", "Confirm")
    .intake(shell(ctx, {
      step: 7,
      eyebrow: "Chapter VII · Done",
      title: "Request received",
      back: "booking",
      next: "service",
      nextLabel: "Start over",
    }))
    .add(
      n.note("Your request is ready for stylist review. This prototype loops back to the first step instead of creating an appointment record.", {
        tone: "success",
        style: { marginBottom: 16 },
      }).id("confirm-success"),
      n.card({ accent: "#7a8f6b" },
        n.summaryRow("Service", selectedServiceName(ctx)).id("confirm-service"),
        n.summaryRow("Estimate", estimateRange(ctx)).id("confirm-estimate"),
        n.summaryRow("Date", day ? day.label : "TBD").id("confirm-day"),
        n.summaryRow("Time", time ? time.label : "TBD").id("confirm-time")
      ).id("confirm-card"),
    )
    .toJSON();
}
