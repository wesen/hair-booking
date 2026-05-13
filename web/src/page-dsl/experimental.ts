import { page, n } from "./builder";
import type { DslPage } from "./schema";
import { color } from "../fringe-ui/tokens";

export const consultationDashboardDsl = page("dsl-consultation-dashboard", "Consultation Dashboard")
  .describe("A dense intake dashboard combining cards, scales, kvRows, notes, and selectables.")
  .intake({ step: 5, total: 7, eyebrow: "Chapter V · The Record", title: "Hair snapshot" })
  .add(
    n.text("A quick view of what we know before we estimate your appointment.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.card({ accent: color.plum, style: { marginBottom: 14 } },
      n.eyebrow("Last visit", { style: { marginBottom: 6 } }),
      n.text("Partial highlights", { variant: "h3" }),
      n.text("3 months ago · lifted to level 7", { variant: "editorial", style: { fontSize: 15, color: color.plum } }),
    ),
    n.scale(2, { max: 5, label: "Damage" }),
    n.scale(3, { max: 5, label: "Dryness" }),
    n.scale(1, { max: 5, label: "Breakage" }),
    n.spacer(14),
    n.note("Bring reference photos with similar starting color. Very bright blondes may require a second visit.", { tone: "warn" }),
    n.spacer(16),
    n.eyebrow("Recommended paths", { style: { marginBottom: 10 } }),
    n.selectableGroup([
      { value: "lived-in", title: "Lived-in blonde", subtitle: "Partial highlights · gloss · cut", badge: "$245" },
      { value: "gloss", title: "Gloss refresh", subtitle: "Tone · shine · trim", badge: "$145" },
    ], "lived-in", { mode: "single" }),
  )
  .toJSON();

export const appointmentPlannerDsl = page("dsl-appointment-planner", "Appointment Planner")
  .describe("Calendar-heavy planner page using personCard, calendarGrid, and selectables.")
  .intake({ step: 6, total: 7, eyebrow: "Planner", title: "Build a visit" })
  .add(
    n.personCard("Nadia Rivera", {
      role: "Senior colorist · Lived-in blonde",
      badge: "Best match",
    }),
    n.spacer(16),
    n.selectableGroup([
      { value: "150-250", title: "$150 – $250", subtitle: "Best for partial color" },
      { value: "250-400", title: "$250 – $400", subtitle: "Full color + treatment" },
    ], "150-250", { mode: "single", columns: 2 }),
    n.spacer(16),
    n.calendarGrid(2026, 6, Array.from({ length: 30 }, (_, i) => ({
      day: i + 1, date: `2026-06-${String(i + 1).padStart(2, "0")}`,
      selected: i + 1 === 18, disabled: i + 1 < 12,
      dot: [14, 17, 18, 19].includes(i + 1),
    })), "2026-06-18", { columns: 7 }),
    n.spacer(16),
    n.selectableGroup([
      { value: "10:30", title: "10:30a" },
      { value: "12:00", title: "12:00p" },
      { value: "14:00", title: "2:00p" },
      { value: "16:30", title: "4:30p" },
    ], "14:00", { mode: "single", columns: 4 }),
  )
  .toJSON();

export const colorLabDsl = page("dsl-color-lab", "Color Lab")
  .describe("Color exploration combining scale swatches, chips, notes, and kvRows.")
  .intake({ step: 2, total: 7, eyebrow: "Color lab", title: "Find your tone" })
  .add(
    n.text("Use this to sketch target color stories before committing to a service path.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.scale(6, { max: 10, label: "Current level", variant: "swatches", style: { marginBottom: 16 } }),
    n.note("Level 6 → 8 is a moderate lift. Plan for gloss and bond support.", { tone: "info" }),
    n.spacer(16),
    n.eyebrow("Tone family", { style: { marginBottom: 10 } }),
    n.chipGroup([
      { value: "neutral", label: "Neutral" },
      { value: "warm", label: "Warm" },
      { value: "cool", label: "Cool" },
      { value: "dimensional", label: "Dimensional" },
      { value: "low-maintenance", label: "Low maintenance" },
    ], ["neutral"], { selectionMode: "single" }),
    n.spacer(18),
    n.kvRow("Current", "Level 6 · medium brown"),
    n.kvRow("Target", "Level 8 · soft blonde"),
    n.kvRow("Risk", "Moderate warmth pull"),
  )
  .toJSON();

export const photoMoodboardDsl = page("dsl-photo-moodboard", "Photo Moodboard")
  .describe("Visual concept page mixing uploadTiles, chips, notes.")
  .intake({ step: 4, total: 7, eyebrow: "Moodboard", title: "Show the vibe", titleSize: 44 })
  .add(
    n.text("Collect current hair and inspiration in one place before the estimate.", { variant: "editorial", style: { fontSize: 16, marginBottom: 16 } }),
    n.eyebrow("Current hair", { style: { marginBottom: 10 } }),
    n.grid(3, { gap: 8, style: { marginBottom: 18 } },
      n.uploadTile("Front", { filled: true, value: "front" }),
      n.uploadTile("Side", { filled: true, value: "side" }),
      n.uploadTile("Back", { value: "back" }),
    ),
    n.eyebrow("Inspiration tags", { style: { marginBottom: 10 } }),
    n.chipGroup([
      { value: "soft-contrast", label: "Soft contrast" },
      { value: "face-frame", label: "Face frame" },
      { value: "no-brass", label: "No brass" },
      { value: "low-upkeep", label: "Low upkeep" },
    ], ["soft-contrast", "face-frame"]),
    n.spacer(18),
    n.note("Tip: choose references with similar base color and lighting.", { tone: "success" }),
  )
  .toJSON();

export const aftercarePlanDsl = page("dsl-aftercare-plan", "Aftercare Plan")
  .describe("Post-booking care page using notes, kvRows, cards, and buttons.")
  .bare()
  .add(
    n.stack({ gap: 14, style: { minHeight: "100%", padding: 30, background: color.paper } },
      n.masthead("Keep it fresh.", { eyebrow: "Aftercare", right: "7 days" }),
      n.text("Your first week after color matters most. Keep water cool and heat low.", { variant: "editorial" }),
      n.note("Wait 48 hours before washing. Avoid clarifying shampoo this week.", { tone: "warn" }),
      n.kvRow("Wash", "Cool water · sulfate-free"),
      n.kvRow("Style", "Heat protectant · low temperature"),
      n.kvRow("Check-in", "Send photos in 7 days"),
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
