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

function initialState() {
  return {
    step: "service",
    category: "color",
    service: "highlights",
    tones: ["dimensional"],
    damage: 2,
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
    case "service":
    default:
      return serviceStep(ctx);
  }
}

function serviceStep(ctx) {
  return page("intake-service", "Service")
    .intake({
      step: 1,
      total: 2,
      eyebrow: "Chapter I · The Ask",
      title: "What brings you in?",
      actions: {
        next: ctx.action("next", function () { return goto(ctx, "color"); }, "next"),
        skip: ctx.action("skip", function () { return goto(ctx, "color"); }, "skip"),
      },
    })
    .add(
      n.text("This page is authored by JavaScript running in Goja inside the Go backend.", {
        variant: "editorial",
        style: { marginBottom: 16 },
      }),
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
    .intake({
      step: 2,
      total: 2,
      eyebrow: "Chapter II · The Color",
      title: "Tune the plan",
      actions: {
        back: ctx.action("back", function () { return goto(ctx, "service"); }, "back"),
        next: ctx.action("next", function () { return goto(ctx, "service"); }, "next"),
      },
    })
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
