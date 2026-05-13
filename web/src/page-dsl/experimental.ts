import { page, n } from "./builder";
import type { DslPage } from "./schema";
import { color } from "../fringe-ui/tokens";

export const consultationDashboardDsl = page("dsl-consultation-dashboard", "Consultation Dashboard")
  .describe("A dense intake dashboard combining cards, rating bars, summary rows, notes, and service options.")
  .intake({ step: 5, total: 9, eyebrow: "Chapter V · The Record", title: "Hair snapshot", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("A quick view of what we know before we estimate your appointment.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.card({ accent: color.plum, style: { marginBottom: 14 } },
      n.eyebrow("Last visit", { style: { marginBottom: 6 } }),
      n.text("Partial highlights", { variant: "h3" }),
      n.text("3 months ago · lifted to level 7", { variant: "editorial", style: { fontSize: 15, color: color.plum } }),
    ),
    n.ratingBar(2, { label: "Damage" }),
    n.ratingBar(3, { label: "Dryness" }),
    n.ratingBar(1, { label: "Breakage" }),
    n.spacer(14),
    n.note("Bring reference photos with similar starting color. Very bright blondes may require a second visit.", { tone: "warn" }),
    n.spacer(16),
    n.eyebrow("Recommended paths", { style: { marginBottom: 10 } }),
    n.serviceOption("Lived-in blonde", "Partial highlights · gloss · cut", { rate: "$245", selected: true }),
    n.serviceOption("Gloss refresh", "Tone · shine · trim", { rate: "$145" }),
  )
  .toJSON();

export const appointmentPlannerDsl = page("dsl-appointment-planner", "Appointment Planner")
  .describe("Calendar-heavy experimental planner page using stylist cards, day cells, and time slots.")
  .intake({ step: 8, total: 9, eyebrow: "Planner", title: "Build a visit", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.stylistCard("Nadia Rivera", "Senior colorist · Lived-in blonde", { rate: "$180+", available: "Best match" }),
    n.spacer(16),
    n.grid(2, { gap: 8, style: { marginBottom: 16 } },
      n.budgetOption("$150 – $250", "Best for partial color", { selected: true }),
      n.budgetOption("$250 – $400", "Full color + treatment"),
    ),
    n.eyebrow("June 2025", { style: { marginBottom: 10 } }),
    n.grid(7, { gap: 4, style: { marginBottom: 18 } },
      ...["M", "T", "W", "T", "F", "S", "S"].map(d => n.text(d, { style: { textAlign: "center", color: color.soft, fontFamily: '"JetBrains Mono", monospace', fontSize: 10 } })),
      ...Array.from({ length: 2 }).map(() => n.spacer(1)),
      ...Array.from({ length: 21 }).map((_, i) => n.dayCell(i + 1, { selected: i + 1 === 18, disabled: i + 1 < 12, dot: [14, 17, 18, 19].includes(i + 1) })),
    ),
    n.eyebrow("Time windows", { style: { marginBottom: 10 } }),
    n.grid(4, { gap: 6 },
      n.timeSlot("10:30a"),
      n.timeSlot("12:00p"),
      n.timeSlot("2:00p", { selected: true }),
      n.timeSlot("4:30p"),
    ),
  )
  .toJSON();

export const colorLabDsl = page("dsl-color-lab", "Color Lab")
  .describe("Color exploration lab combining level bars, chips, notes, and summary rows.")
  .intake({ step: 2, total: 9, eyebrow: "Color lab", title: "Find your tone", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Use this to sketch target color stories before committing to a service path.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.colorLevelBar(6, { target: 8, style: { marginBottom: 16 } }),
    n.note("Level 6 → 8 is a moderate lift. Plan for gloss and bond support.", { tone: "info" }),
    n.spacer(16),
    n.eyebrow("Tone family", { style: { marginBottom: 10 } }),
    n.stack({ gap: 8, style: { flexDirection: "row", flexWrap: "wrap" } },
      n.chip("Neutral", { selected: true }),
      n.chip("Warm"),
      n.chip("Cool"),
      n.chip("Dimensional"),
      n.chip("Low maintenance"),
    ),
    n.spacer(18),
    n.summaryRow("Current", "Level 6 · medium brown"),
    n.summaryRow("Target", "Level 8 · soft blonde"),
    n.summaryRow("Risk", "Moderate warmth pull"),
  )
  .toJSON();

export const photoMoodboardDsl = page("dsl-photo-moodboard", "Photo Moodboard")
  .describe("A visual concept page mixing photo tiles, chips, notes, and summary rows.")
  .intake({ step: 4, total: 9, eyebrow: "Moodboard", title: "Show the vibe", titleSize: 44, onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Collect current hair and inspiration in one place before the estimate.", { variant: "editorial", style: { fontSize: 16, marginBottom: 16 } }),
    n.eyebrow("Current hair", { style: { marginBottom: 10 } }),
    n.grid(3, { gap: 8, style: { marginBottom: 18 } },
      n.photoTile("Front", { filled: true }),
      n.photoTile("Side", { filled: true }),
      n.photoTile("Back"),
    ),
    n.eyebrow("Inspiration tags", { style: { marginBottom: 10 } }),
    n.stack({ gap: 8, style: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 } },
      n.chip("Soft contrast", { selected: true }),
      n.chip("Face frame", { selected: true }),
      n.chip("No brass"),
      n.chip("Low upkeep"),
    ),
    n.note("Tip: choose references with similar base color and lighting.", { tone: "success" }),
  )
  .toJSON();

export const aftercarePlanDsl = page("dsl-aftercare-plan", "Aftercare Plan")
  .describe("Post-booking care page using notes, summary rows, cards, and buttons.")
  .bare()
  .add(
    n.stack({ gap: 14, style: { minHeight: "100%", padding: 30, background: color.paper } },
      n.masthead("Keep it fresh.", { eyebrow: "Aftercare", right: "7 days" }),
      n.text("Your first week after color matters most. Keep water cool and heat low.", { variant: "editorial" }),
      n.note("Wait 48 hours before washing. Avoid clarifying shampoo this week.", { tone: "warn" }),
      n.summaryRow("Wash", "Cool water · sulfate-free"),
      n.summaryRow("Style", "Heat protectant · low temperature"),
      n.summaryRow("Check-in", "Send photos in 7 days"),
      n.grid(2, { gap: 10, style: { marginTop: "auto" } },
        n.button("Message stylist", { variant: "secondary", action: "message" }),
        n.button("Done", { action: "done" }),
      ),
    ),
  )
  .toJSON();

export const experimentalDslExamples: Record<string, DslPage> = {
  consultationDashboard: consultationDashboardDsl,
  appointmentPlanner: appointmentPlannerDsl,
  colorLab: colorLabDsl,
  photoMoodboard: photoMoodboardDsl,
  aftercarePlan: aftercarePlanDsl,
};
