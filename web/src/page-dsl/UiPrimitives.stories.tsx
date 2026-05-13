import type { Meta, StoryObj } from "@storybook/react";
import { page, n } from "./builder";
import { DslPageRenderer } from "./render";
import type { DslPage } from "./schema";
import { color } from "../fringe-ui/tokens";

const actions = {
  serviceChanged: (p: any) => console.log("serviceChanged", p),
  budgetChanged: (p: any) => console.log("budgetChanged", p),
  tonesChanged: (p: any) => console.log("tonesChanged", p),
  damageChanged: (p: any) => console.log("damageChanged", p),
  dayChanged: (p: any) => console.log("dayChanged", p),
  timeChanged: (p: any) => console.log("timeChanged", p),
  upload: (p: any) => console.log("upload", p),
  remove: (p: any) => console.log("remove", p),
  next: () => console.log("next"),
  back: () => console.log("back"),
};

// ── Selectable primitives ──────────────────────────────────────────

const selectableServiceDsl: DslPage = page("selectable-service", "Selectable: Service")
  .intake({ step: 1, total: 7, eyebrow: "Chapter I", title: "Pick a service" })
  .add(
    n.text("Full-width selectables with badges render as ServiceOption molecules.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.selectableGroup([
      { value: "cut", title: "Cut", subtitle: "Trim · restyle · bangs", badge: "$80+" },
      { value: "highlights", title: "Highlights", subtitle: "Partial · full · balayage", badge: "$180+" },
      { value: "gloss", title: "Gloss refresh", subtitle: "Tone · shine · maintenance", badge: "$120+" },
    ], "highlights", { mode: "single", action: "serviceChanged" }),
  )
  .toJSON();

const selectableBudgetDsl: DslPage = page("selectable-budget", "Selectable: Budget Grid")
  .intake({ step: 4, total: 7, eyebrow: "Budget", title: "Comfort zone" })
  .add(
    n.text("Budget selectables in 2-column grid render as BudgetOption molecules.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.selectableGroup([
      { value: "under-200", title: "Under $200", subtitle: "Refresh, trim, gloss" },
      { value: "200-350", title: "$200–$350", subtitle: "Most color refresh plans" },
      { value: "350-plus", title: "$350+", subtitle: "Transformations and extensions" },
      { value: "flexible", title: "Flexible", subtitle: "Best plan first" },
    ], "flexible", { mode: "single", columns: 2, action: "budgetChanged" }),
  )
  .toJSON();

const selectableTimeDsl: DslPage = page("selectable-time", "Selectable: Time Slots")
  .intake({ step: 6, total: 7, eyebrow: "Calendar", title: "Pick a time" })
  .add(
    n.text("Compact selectables in columns render as TimeSlot molecules.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.selectableGroup([
      { value: "10:30", title: "10:30a" },
      { value: "12:00", title: "12:00p" },
      { value: "14:00", title: "2:00p" },
      { value: "16:30", title: "4:30p" },
    ], "14:00", { mode: "single", columns: 4, action: "timeChanged" }),
  )
  .toJSON();

// ── Scale primitive ────────────────────────────────────────────────

const scaleDotsDsl: DslPage = page("scale-dots", "Scale: Dots (Rating)")
  .intake({ step: 2, total: 7, eyebrow: "Color", title: "Damage level" })
  .add(
    n.scale(3, { max: 5, label: "Damage", interactive: true, action: "damageChanged" }),
    n.spacer(24),
    n.scale(4, { max: 5, label: "Dryness", interactive: true }),
    n.spacer(24),
    n.scale(1, { max: 5, label: "Breakage", interactive: true }),
  )
  .toJSON();

const scaleSwatchesDsl: DslPage = page("scale-swatches", "Scale: Swatches (Color Levels)")
  .intake({ step: 2, total: 7, eyebrow: "Color Lab", title: "Current level" })
  .add(
    n.scale(6, { max: 10, label: "Current level", variant: "swatches" }),
    n.spacer(16),
    n.scale(8, { max: 10, label: "Target level", variant: "swatches" }),
  )
  .toJSON();

// ── Data display primitives ────────────────────────────────────────

const kvRowDsl: DslPage = page("kv-row", "kvRow: Key-Value Display")
  .intake({ step: 5, total: 7, eyebrow: "Preview", title: "Your estimate" })
  .add(
    n.text("kvRow renders as SummaryRow molecule with optional edit action.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.kvRow("Service", "Highlights"),
    n.kvRow("Tone", "Dimensional"),
    n.kvRow("Photos", "2 of 3"),
    n.kvRow("Budget", "Flexible"),
    n.kvRow("Range", "$220–$420"),
  )
  .toJSON();

const statDsl: DslPage = page("stat", "stat: Hero Number")
  .bare()
  .add(
    n.stack({ gap: 24, style: { padding: 30, background: color.paper } },
      n.stat("$245", { label: "ESTIMATED · USD", subtitle: "Based on your selections." }),
      n.stat("4.8", { label: "AVERAGE RATING", subtitle: "Across 230 color appointments." }),
      n.stat("12", { label: "APPOINTMENTS", subtitle: "Since your first visit." }),
    ),
  )
  .toJSON();

const personCardDsl: DslPage = page("person-card", "personCard: Stylist Card")
  .bare()
  .add(
    n.stack({ gap: 16, style: { padding: 30, background: color.paper } },
      n.personCard("Nadia Rivera", { role: "Senior colorist · Lived-in blonde", badge: "Best match" }),
      n.personCard("Maya Chen", { role: "Color specialist · Vivid transformations", badge: "$180/hr" }),
      n.personCard("Alex Kim", { role: "Junior stylist · Cuts and blowouts" }),
    ),
  )
  .toJSON();

// ── Upload tile primitive ──────────────────────────────────────────

const uploadTileDsl: DslPage = page("upload-tile", "uploadTile: Photo Upload")
  .intake({ step: 3, total: 7, eyebrow: "References", title: "Add photos" })
  .add(
    n.text("uploadTile renders as PhotoTile molecule.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.grid(3, { gap: 10 },
      n.uploadTile("Front", { value: "front", filled: true, action: "upload" }),
      n.uploadTile("Side", { value: "side", filled: true, action: "upload" }),
      n.uploadTile("Back", { value: "back", action: "upload" }),
    ),
  )
  .toJSON();

// ── Calendar grid primitive ────────────────────────────────────────

const calendarGridDsl: DslPage = page("calendar-grid", "calendarGrid: Date Picker")
  .intake({ step: 6, total: 7, eyebrow: "Calendar", title: "Choose a date" })
  .add(
    n.calendarGrid(2026, 6, Array.from({ length: 30 }, (_, i) => ({
      day: i + 1, date: `2026-06-${String(i + 1).padStart(2, "0")}`,
      selected: i + 1 === 19, disabled: i + 1 < 14,
      dot: [16, 18, 19, 22].includes(i + 1),
    })), "2026-06-19", { columns: 7, action: "dayChanged" }),
  )
  .toJSON();

// ── Desktop two-column partition ───────────────────────────────────

const desktopPartitionDsl: DslPage = page("desktop-partition", "Desktop Partition")
  .shell({ kind: "desktop", props: { step: 5, total: 7, accent: "butter", accentInk: "ink", activeNav: "Book" } })
  .add(
    n.text("On desktop, stat and personCard auto-pull into the right-side accent panel.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.kvRow("Service", "Highlights"),
    n.kvRow("Tone", "Dimensional"),
    n.kvRow("Budget", "Flexible"),
    n.kvRow("Range", "$220–$420"),
    // These two will auto-partition to the context panel
    n.stat("$245", { label: "ESTIMATED · USD", subtitle: "Based on your selections." }),
    n.personCard("Nadia Rivera", { role: "Senior colorist", badge: "Best match" }),
  )
  .toJSON() as DslPage;

const desktopExplicitRegionDsl: DslPage = page("desktop-region", "Desktop Explicit Regions")
  .shell({ kind: "desktop", props: { step: 5, total: 7, accent: "sage", accentInk: "ink", activeNav: "Book" } })
  .add(
    n.text("Use .region() to explicitly place nodes in main or context column.", { variant: "editorial", style: { marginBottom: 16 } }),
    n.note("This card is forced to the context panel via .region('context').", { tone: "info" }).region("context"),
    n.selectableGroup([
      { value: "cut", title: "Cut", subtitle: "Trim", badge: "$80+" },
      { value: "color", title: "Color", subtitle: "Full service", badge: "$220+" },
    ], "color", { mode: "single", action: "serviceChanged" }),
    n.card({ accent: color.plum },
      n.kvRow("Service", "Color"),
      n.kvRow("Range", "$220–$420"),
    ).region("context"),
  )
  .toJSON() as DslPage;

// ── Story setup ────────────────────────────────────────────────────

const meta: Meta = {
  title: "Page DSL/UI Primitives",
  parameters: { layout: "fullscreen", phone: true, viewport: { defaultViewport: "iPhone14" } },
};

export default meta;
type Story = StoryObj;

export const SelectableService: Story = {
  render: () => <DslPageRenderer page={selectableServiceDsl} context={{ actions }} />,
};

export const SelectableBudget: Story = {
  render: () => <DslPageRenderer page={selectableBudgetDsl} context={{ actions }} />,
};

export const SelectableTime: Story = {
  render: () => <DslPageRenderer page={selectableTimeDsl} context={{ actions }} />,
};

export const ScaleDots: Story = {
  render: () => <DslPageRenderer page={scaleDotsDsl} context={{ actions }} />,
};

export const ScaleSwatches: Story = {
  render: () => <DslPageRenderer page={scaleSwatchesDsl} context={{ actions }} />,
};

export const KvRow: Story = {
  render: () => <DslPageRenderer page={kvRowDsl} context={{ actions }} />,
};

export const Stat: Story = {
  parameters: { phone: false, layout: "padded", viewport: { defaultViewport: "desktop1440" } },
  render: () => <DslPageRenderer page={statDsl} />,
};

export const PersonCard: Story = {
  parameters: { phone: false, layout: "padded", viewport: { defaultViewport: "desktop1440" } },
  render: () => <DslPageRenderer page={personCardDsl} />,
};

export const UploadTile: Story = {
  render: () => <DslPageRenderer page={uploadTileDsl} context={{ actions }} />,
};

export const CalendarGrid: Story = {
  render: () => <DslPageRenderer page={calendarGridDsl} context={{ actions }} />,
};

export const DesktopPartition: Story = {
  parameters: { phone: false, viewport: { defaultViewport: "desktop1440" } },
  render: () => <DslPageRenderer page={desktopPartitionDsl} context={{ actions }} />,
};

export const DesktopExplicitRegion: Story = {
  parameters: { phone: false, viewport: { defaultViewport: "desktop1440" } },
  render: () => <DslPageRenderer page={desktopExplicitRegionDsl} context={{ actions }} />,
};
