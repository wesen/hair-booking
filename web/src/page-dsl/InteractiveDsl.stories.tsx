import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { page, n } from "./builder";
import { DslPageRenderer } from "./render";
import type { DslActionPayload, DslPage } from "./schema";
import { color, font } from "../fringe-ui/tokens";

const serviceOptions = [
  { value: "cut", title: "Cut", subtitle: "Trim · restyle · bangs", badge: "$80+" },
  { value: "highlights", title: "Highlights", subtitle: "Partial · full · balayage", badge: "$180+" },
  { value: "gloss", title: "Gloss refresh", subtitle: "Tone · shine · maintenance", badge: "$120+" },
];

const budgetOptions = [
  { value: "150-250", title: "$150 – $250", subtitle: "Partial color" },
  { value: "250-400", title: "$250 – $400", subtitle: "Full color" },
];

const toneOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

const timeOptions = ["10:30a", "12:00p", "2:00p", "4:30p"].map((slot) => ({ value: slot, title: slot }));

function buildInteractiveIntakeDsl(state: {
  category: string;
  service: string;
  budget: string;
  tones: string[];
  damage: number;
}): DslPage {
  return page("interactive-dsl-intake", "Interactive DSL intake")
    .intake({ step: 2, total: 7, eyebrow: "DSL · Interactive", title: "Build the visit" })
    .add(
      n.text("This page is JSON DSL. Every control below sends callback payloads back through the renderer context.", { variant: "editorial", style: { marginBottom: 16 } }),
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], state.category, { action: "categoryChanged", style: { marginBottom: 16 } }),
      n.selectableGroup(serviceOptions, state.service, { mode: "single", action: "serviceChanged" }),
      n.selectableGroup(budgetOptions, state.budget, { mode: "single", columns: 2, style: { marginTop: 12 } }),
      n.chipGroup(toneOptions, state.tones, {
        action: "tonesChanged",
        label: "Tone family",
        helperText: "Multi-select chips rendered by the DSL.",
        style: { marginTop: 16 },
      }),
      n.scale(state.damage, { max: 5, label: "Damage", interactive: true, style: { marginTop: 14 } }),
    )
    .toJSON();
}

function buildInteractiveBookingDsl(state: { day: string; time: string; photos: string[] }): DslPage {
  const dayOptions = Array.from({ length: 21 }, (_, i) => ({
    day: i + 1, date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    disabled: i < 10,
    dot: [14, 17, 18].includes(i + 1),
  }));
  return page("interactive-dsl-booking", "Interactive DSL booking")
    .intake({ step: 6, total: 7, eyebrow: "DSL · Booking", title: "Pick a slot" })
    .add(
      n.calendarGrid(2026, 6, dayOptions, `2026-06-${state.day.padStart(2, "0")}`, { columns: 7, style: { marginBottom: 16 } }),
      n.selectableGroup(timeOptions, state.time, { mode: "single", columns: 4, style: { marginBottom: 18 } }),
      n.eyebrow("Photos", { style: { marginBottom: 10 } }),
      n.grid(3, { gap: 8 },
        ...["front", "side", "back"].map((photo) => n.uploadTile(photo, {
          value: photo,
          filled: state.photos.includes(photo),
        })),
      ),
    )
    .toJSON();
}

function StateDump({ value }: { value: unknown }) {
  return (
    <pre style={{ margin: 0, padding: 12, background: color.cream, fontFamily: font.mono, fontSize: 12, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const meta: Meta = {
  title: "Page DSL/Interactive Widgets",
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj;

export const InteractiveIntake: Story = {
  render: () => {
    const [state, setState] = useState({
      category: "color",
      service: "highlights",
      budget: "250-400",
      tones: ["dimensional"],
      damage: 2,
    });
    const dsl = useMemo(() => buildInteractiveIntakeDsl(state), [state]);

    return (
      <DslPageRenderer
        page={dsl}
        context={{
          actions: {
            categoryChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, category: String(payload?.value ?? current.category) })),
            serviceChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, service: String(payload?.value ?? current.service) })),
            budgetChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, budget: String(payload?.value ?? current.budget) })),
            tonesChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, tones: Array.isArray(payload?.value) ? payload.value.map(String) : current.tones })),
            damageChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, damage: Number(payload?.value ?? current.damage) })),
            next: () => console.log("next", state),
            back: () => console.log("back"),
            skip: () => console.log("skip"),
          },
        }}
      />
    );
  },
};

export const InteractiveBooking: Story = {
  render: () => {
    const [state, setState] = useState({ day: "18", time: "2:00p", photos: ["front"] });
    const dsl = useMemo(() => buildInteractiveBookingDsl(state), [state]);

    return (
      <DslPageRenderer
        page={dsl}
        context={{
          actions: {
            dayChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, day: String(payload?.value ?? current.day).replace("2026-06-", "") })),
            timeChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, time: String(payload?.value ?? current.time) })),
            upload: (payload?: DslActionPayload) => setState((current) => ({ ...current, photos: Array.from(new Set([...current.photos, String(payload?.value)])) })),
            remove: (payload?: DslActionPayload) => setState((current) => ({ ...current, photos: current.photos.filter((p) => p !== String(payload?.value)) })),
            next: () => console.log("next", state),
            back: () => console.log("back"),
            skip: () => console.log("skip"),
          },
        }}
      />
    );
  },
};

export const InteractiveJsonContract: Story = {
  parameters: { phone: false, layout: "padded" },
  render: () => <StateDump value={buildInteractiveIntakeDsl({ category: "color", service: "highlights", budget: "250-400", tones: ["dimensional"], damage: 2 })} />,
};
