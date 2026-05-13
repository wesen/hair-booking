import { page, n } from "./builder";
import type { DslPage } from "./schema";
import { color } from "../fringe-ui/tokens";

export const serviceDsl = page("dsl-service", "Service DSL")
  .describe("Service selection screen built entirely from JSON DSL nodes.")
  .intake({ step: 1, total: 9, eyebrow: "Chapter I · The Ask", title: "What brings you in?", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Pick one to start — you can add more later.", { variant: "editorial", style: { marginBottom: 18 } }),
    n.serviceOption("Cut", "Trim · restyle · bangs", { rate: "$80+" }),
    n.serviceOption("Color", "Single process · gloss · root touch-up", { rate: "$120+" }),
    n.serviceOption("Highlights", "Partial · full · balayage", { rate: "$180+", selected: true }),
    n.serviceOption("Extensions", "Tape-in · hand-tied · consultation first", { rate: "$400+" }),
    n.serviceOption("Treatment", "Olaplex · bond-repair · scalp", { rate: "$60+" }),
  )
  .toJSON();

export const colorDsl = page("dsl-color", "Color DSL")
  .intake({ step: 2, total: 9, eyebrow: "Chapter II · The Tone", title: "Current level", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Slide to your starting point. 1 is black, 10 is platinum.", { variant: "editorial", style: { marginBottom: 20 } }),
    n.colorLevelBar(7, { style: { marginBottom: 18 } }),
    n.note("You're at Level 7 — dark blonde with warm undertones.", { tone: "info" }),
    n.spacer(20),
    n.eyebrow("Target (optional)", { style: { marginBottom: 10 } }),
    n.stack({ gap: 8, style: { flexDirection: "row", flexWrap: "wrap" } },
      n.chip("Stay the same"),
      n.chip("Go 1 shade lighter", { selected: true }),
      n.chip("Go 2 shades lighter"),
      n.chip("Darker"),
      n.chip("Dimensional"),
    ),
  )
  .toJSON();

export const lengthDsl = page("dsl-length", "Length DSL")
  .intake({ step: 3, total: 9, eyebrow: "Chapter III · The Length", title: "How long is it now?", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Pick the silhouette that matches best today.", { variant: "editorial", style: { marginBottom: 20 } }),
    n.grid(4, { gap: 8, style: { marginBottom: 24 } },
      n.lengthSilhouette("Pixie"),
      n.lengthSilhouette("Bob"),
      n.lengthSilhouette("Shoulder"),
      n.lengthSilhouette("Mid-back", { selected: true }),
    ),
    n.eyebrow("Extensions", { style: { marginBottom: 12 } }),
    n.segmented([
      { value: "none", label: "None" },
      { value: "taped", label: "Tape-in" },
      { value: "tied", label: "Hand-tied" },
    ], "none"),
  )
  .toJSON();

export const photosDsl = page("dsl-photos", "Photos DSL")
  .intake({ step: 4, total: 9, eyebrow: "Chapter IV · The Reference", title: "Three angles, please.", titleSize: 44, onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Front, side, and back in natural light. Helps more than you'd think.", { variant: "editorial", style: { fontSize: 16, marginBottom: 20 } }),
    n.eyebrow("Current hair — 3 angles", { style: { marginBottom: 10 } }),
    n.grid(3, { gap: 8, style: { marginBottom: 20 } },
      n.photoTile("Front", { filled: true }),
      n.photoTile("Side", { filled: true }),
      n.photoTile("Back"),
    ),
    n.eyebrow("Inspiration (optional · up to 4)", { style: { marginBottom: 10 } }),
    n.grid(4, { gap: 6 },
      n.card({ style: { aspectRatio: "1 / 1", background: color.peach, display: "flex", alignItems: "center", justifyContent: "center" } }, n.text("✓", { variant: "h3", style: { color: color.plum } })),
      n.card({ style: { aspectRatio: "1 / 1", background: color.peach, display: "flex", alignItems: "center", justifyContent: "center" } }, n.text("✓", { variant: "h3", style: { color: color.plum } })),
      n.card({ style: { aspectRatio: "1 / 1", background: color.cream, display: "flex", alignItems: "center", justifyContent: "center" } }, n.text("+", { variant: "h3", style: { color: color.soft } })),
      n.card({ style: { aspectRatio: "1 / 1", background: color.cream, display: "flex", alignItems: "center", justifyContent: "center" } }, n.text("+", { variant: "h3", style: { color: color.soft } })),
    ),
  )
  .toJSON();

export const budgetDsl = page("dsl-budget", "Budget DSL")
  .intake({ step: 6, total: 9, eyebrow: "Chapter VI · The Budget", title: "Comfortable range?", titleSize: 36, onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.text("Helps us match you to the right stylist. Tips not included.", { variant: "editorial", style: { marginBottom: 20 } }),
    n.budgetOption("Under $150", "Cut or single-service touch-up"),
    n.budgetOption("$150 – $250", "Partial color + cut", { selected: true }),
    n.budgetOption("$250 – $400", "Full color · highlights + cut"),
    n.budgetOption("$400+", "Extensions · correction · balayage"),
  )
  .toJSON();

export const estimateDsl = page("dsl-estimate", "Estimate DSL")
  .intake({ step: 7, total: 9, eyebrow: "Chapter VII · The Quote", title: "Your estimate", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.masthead("$245", { eyebrow: "ESTIMATED TOTAL", right: "3h 15m", compact: true }),
    n.spacer(16),
    n.summaryRow("Service", "Partial highlights + cut", { onEdit: "editService" }),
    n.summaryRow("Color level", "Level 7 → Level 8", { onEdit: "editColor" }),
    n.summaryRow("Length", "Mid-back · no extensions", { onEdit: "editLength" }),
    n.summaryRow("Add-ons", "Olaplex bond treatment · $45"),
    n.spacer(20),
    n.note("Estimate only. Final cost depends on in-salon assessment of current color and condition.", { tone: "warn" }),
  )
  .toJSON();

export const bookingDsl = page("dsl-booking", "Booking DSL")
  .intake({ step: 8, total: 9, eyebrow: "Chapter VIII · The Date", title: "When suits you?", onNext: "next", onBack: "back", onSkip: "skip" })
  .add(
    n.stylistCard("Nadia Rivera", "Senior colorist · Lived-in blonde", { rate: "$180+", available: "Available Tue 2:00p" }),
    n.spacer(20),
    n.eyebrow("June 2025", { style: { marginBottom: 10 } }),
    n.grid(7, { gap: 4, style: { marginBottom: 20 } },
      ...["M", "T", "W", "T", "F", "S", "S"].map(d => n.text(d, { style: { textAlign: "center", color: color.soft, fontFamily: '"JetBrains Mono", monospace', fontSize: 10 } })),
      ...Array.from({ length: 2 }).map(() => n.spacer(1)),
      ...Array.from({ length: 28 }).map((_, i) => n.dayCell(i + 1, { selected: i + 1 === 18, disabled: i + 1 < 12, dot: [14, 17, 18, 19, 23].includes(i + 1) })),
    ),
    n.eyebrow("Tue, Jun 18 — available times", { style: { marginBottom: 10 } }),
    n.grid(4, { gap: 6 },
      n.timeSlot("10:30a"),
      n.timeSlot("12:00p"),
      n.timeSlot("2:00p", { selected: true }),
      n.timeSlot("4:30p"),
    ),
  )
  .toJSON();

export const confirmDsl = page("dsl-confirm", "Confirm DSL")
  .bare()
  .add(
    n.stack({ gap: 14, style: { padding: 30 } },
      n.masthead("See you Tuesday.", { eyebrow: "You're booked.", right: "CONF #4281", accent: color.peach }),
      n.text("A confirmation and prep notes are on their way.", { variant: "editorial" }),
      n.summaryRow("When", "TUE, JUN 18 · 2:00P"),
      n.summaryRow("With", "Nadia Rivera"),
      n.summaryRow("Service", "Partial highlights + cut"),
      n.summaryRow("Estimate", "$245 · 3h 15m"),
      n.summaryRow("Deposit", "$50 held"),
      n.note("Deposit received. Cancellations inside 24h forfeit deposit.", { tone: "success" }),
    ),
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
