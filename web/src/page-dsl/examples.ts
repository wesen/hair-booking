import { page, n } from "./builder";
import type { DslPage } from "./schema";
import { color } from "../fringe-ui/tokens";

export const serviceDsl = page("dsl-service", "Service DSL")
  .describe("Service selection using selectableGroup primitive.")
  .intake({ step: 1, total: 7, eyebrow: "Chapter I · The Ask", title: "What brings you in?" })
  .add(
    n.text("Pick one to start — you can add more later.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.segmented([
      { value: "cut", label: "Cut" },
      { value: "color", label: "Color" },
      { value: "extensions", label: "Extensions" },
    ], "color", { style: { marginBottom: 24 } }),
    n.selectableGroup([
      { value: "cut", title: "Cut", subtitle: "Trim · restyle · bangs", badge: "$80+" },
      { value: "color", title: "Color", subtitle: "Single process · gloss · root touch-up", badge: "$120+" },
      { value: "highlights", title: "Highlights", subtitle: "Partial · full · balayage", badge: "$180+" },
      { value: "extensions", title: "Extensions", subtitle: "Tape-in · hand-tied · consultation first", badge: "$400+" },
      { value: "treatment", title: "Treatment", subtitle: "Olaplex · bond-repair · scalp", badge: "$60+" },
    ], "highlights", { mode: "single" }),
  )
  .toJSON();

export const colorDsl = page("dsl-color", "Color DSL")
  .intake({ step: 2, total: 7, eyebrow: "Chapter II · The Tone", title: "Tune the plan" })
  .add(
    n.text("Slide to your starting point. 1 is black, 10 is platinum.", { variant: "editorial", style: { marginBottom: 20 } }),
    n.scale(7, { max: 10, label: "Current level", variant: "swatches", style: { marginBottom: 18 } }),
    n.note("You're at Level 7 — dark blonde with warm undertones.", { tone: "info" }),
    n.spacer(20),
    n.eyebrow("Target (optional)", { style: { marginBottom: 10 } }),
    n.chipGroup([
      { value: "same", label: "Stay the same" },
      { value: "lighter1", label: "Go 1 shade lighter" },
      { value: "lighter2", label: "Go 2 shades lighter" },
      { value: "darker", label: "Darker" },
      { value: "dimensional", label: "Dimensional" },
    ], ["lighter1"], { selectionMode: "single" }),
  )
  .toJSON();

export const lengthDsl = page("dsl-length", "Length DSL")
  .intake({ step: 3, total: 7, eyebrow: "Chapter III · The Length", title: "How long is it now?" })
  .add(
    n.text("Pick the silhouette that matches best today.", { variant: "editorial", style: { marginBottom: 20 } }),
    n.selectableGroup([
      { value: "pixie", title: "Pixie" },
      { value: "bob", title: "Bob" },
      { value: "shoulder", title: "Shoulder" },
      { value: "mid-back", title: "Mid-back" },
    ], "mid-back", { mode: "single", columns: 4 }),
    n.spacer(20),
    n.eyebrow("Damage level", { style: { marginBottom: 12 } }),
    n.scale(2, { max: 5, label: "Damage", interactive: true }),
  )
  .toJSON();

export const photosDsl = page("dsl-photos", "Photos DSL")
  .intake({ step: 4, total: 7, eyebrow: "Chapter IV · The Reference", title: "Three angles, please.", titleSize: 44 })
  .add(
    n.text("Front, side, and back in natural light. Helps more than you'd think.", { variant: "editorial", style: { fontSize: 16, marginBottom: 20 } }),
    n.eyebrow("Current hair — 3 angles", { style: { marginBottom: 10 } }),
    n.grid(3, { gap: 10 },
      n.uploadTile("Front", { filled: true, value: "front" }),
      n.uploadTile("Side", { filled: true, value: "side" }),
      n.uploadTile("Back", { value: "back" }),
    ),
    n.spacer(16),
    n.note("2 of 3 photo angles selected", { tone: "info" }),
  )
  .toJSON();

export const budgetDsl = page("dsl-budget", "Budget DSL")
  .intake({ step: 5, total: 7, eyebrow: "Chapter V · The Budget", title: "Comfortable range?", titleSize: 36 })
  .add(
    n.text("Helps us match you to the right stylist. Tips not included.", { variant: "editorial", style: { marginBottom: 28 } }),
    n.selectableGroup([
      { value: "under-150", title: "Under $150", subtitle: "Cut or single-service touch-up" },
      { value: "150-250", title: "$150 – $250", subtitle: "Partial color + cut" },
      { value: "250-400", title: "$250 – $400", subtitle: "Full color · highlights + cut" },
      { value: "400-plus", title: "$400+", subtitle: "Extensions · correction · balayage" },
    ], "150-250", { mode: "single" }),
  )
  .toJSON();

export const estimateDsl = page("dsl-estimate", "Estimate DSL")
  .intake({ step: 6, total: 7, eyebrow: "Chapter VI · The Quote", title: "Your estimate" })
  .add(
    n.masthead("$245", { eyebrow: "ESTIMATED TOTAL", right: "3h 15m", compact: true }),
    n.spacer(24),
    n.kvRow("Service", "Partial highlights + cut", { editable: true }),
    n.kvRow("Color level", "Level 7 → Level 8", { editable: true }),
    n.kvRow("Length", "Mid-back · no extensions", { editable: true }),
    n.kvRow("Add-ons", "Olaplex bond treatment · $45"),
    n.spacer(20),
    n.note("Estimate only. Final cost depends on in-salon assessment of current color and condition.", { tone: "warn" }),
  )
  .toJSON();

export const bookingDsl = page("dsl-booking", "Booking DSL")
  .intake({ step: 7, total: 7, eyebrow: "Chapter VII · The Date", title: "When suits you?" })
  .add(
    n.personCard("Nadia Rivera", {
      role: "Senior colorist · Lived-in blonde",
      badge: "$180+",
    }),
    n.spacer(20),
    n.calendarGrid(2026, 6, Array.from({ length: 30 }, (_, i) => ({
      day: i + 1, date: `2026-06-${String(i + 1).padStart(2, "0")}`,
      selected: i + 1 === 18,
      disabled: i + 1 < 12,
      dot: [14, 17, 18, 19, 23].includes(i + 1),
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

export const confirmDsl = page("dsl-confirm", "Confirm DSL")
  .intake({ step: 9, total: 9, title: " " })
  .add(
    n.masthead("See you", { eyebrow: "You're booked.", accent: "Tuesday.", right: "CONF #4281", compact: true }),
    n.spacer(28),
    n.text("A confirmation and prep notes are on their way.", { variant: "editorial", style: { marginBottom: 24 } }),
    n.kvRow("When", "TUE, JUN 18 · 2:00P"),
    n.kvRow("With", "Nadia Rivera"),
    n.kvRow("Service", "Partial highlights + cut"),
    n.kvRow("Estimate", "$245 · 3h 15m"),
    n.kvRow("Deposit", "$50 held"),
    n.spacer(20),
    n.note("Deposit received. Cancellations inside 24h forfeit deposit.", { tone: "success" }),
  )
  .toJSON();

export const dslExamples: Record<string, DslPage> = {
  service: serviceDsl,
  color: colorDsl,
  length: lengthDsl,
  photos: photosDsl,
  budget: budgetDsl,
  estimate: estimateDsl,
  booking: bookingDsl,
  confirm: confirmDsl,
};
