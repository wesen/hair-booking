import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { page, n } from "./builder";
import { DslPageRenderer } from "./render";
import type { DslActionPayload, DslPage } from "./schema";
import { color, font } from "../fringe-ui/tokens";

const serviceOptions = [
  { value: "cut", name: "Cut", description: "Trim · restyle · bangs", rate: "$80+" },
  { value: "highlights", name: "Highlights", description: "Partial · full · balayage", rate: "$180+" },
  { value: "gloss", name: "Gloss refresh", description: "Tone · shine · maintenance", rate: "$120+" },
];

const budgetOptions = [
  { value: "150-250", label: "$150 – $250", description: "Partial color" },
  { value: "250-400", label: "$250 – $400", description: "Full color" },
];

const toneOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

const timeOptions = ["10:30a", "12:00p", "2:00p", "4:30p"].map((slot) => ({ value: slot, label: slot }));
const dayOptions = Array.from({ length: 21 }).map((_, i) => {
  const disabled = i < 10;
  return {
    value: String(i + 1),
    day: i + 1,
    disabled,
    ...(disabled ? { disabledReason: "too soon" } : {}),
    dot: [14, 17, 18].includes(i + 1),
  };
});

function buildInteractiveIntakeDsl(state: {
  service: string;
  budget: string;
  tones: string[];
  damage: number;
}): DslPage {
  return page("interactive-dsl-intake", "Interactive DSL intake")
    .intake({ step: 2, total: 9, eyebrow: "DSL · Interactive", title: "Build the visit", onNext: "next", onBack: "back", onSkip: "skip" })
    .add(
      n.text("This page is JSON DSL. Every control below sends callback payloads back through the renderer context.", { variant: "editorial", style: { marginBottom: 16 } }),
      n.segmented([
        { value: "cut", label: "Cut" },
        { value: "color", label: "Color" },
        { value: "extensions", label: "Extensions" },
      ], "color", { action: "segmentChanged", style: { marginBottom: 16 } }),
      n.serviceOptionGroup(serviceOptions, state.service, { action: "serviceChanged" }),
      n.budgetOptionGroup(budgetOptions, state.budget, { action: "budgetChanged", columns: 2, style: { marginTop: 12 } }),
      n.chipGroup(toneOptions, state.tones, {
        action: "tonesChanged",
        label: "Tone family",
        helperText: "Multi-select chips rendered by the DSL.",
        style: { marginTop: 16 },
      }),
      n.ratingBar(state.damage, { label: "Damage", interactive: true, action: "damageChanged", style: { marginTop: 14 } }),
    )
    .toJSON();
}

function buildInteractiveBookingDsl(state: { day: string; time: string; photos: string[] }): DslPage {
  return page("interactive-dsl-booking", "Interactive DSL booking")
    .intake({ step: 8, total: 9, eyebrow: "DSL · Booking", title: "Pick a slot", onNext: "next", onBack: "back", onSkip: "skip" })
    .add(
      n.dayPickerGrid(dayOptions, state.day, { action: "dayChanged", style: { marginBottom: 16 } }),
      n.timeSlotGroup(timeOptions, state.time, { action: "timeChanged", style: { marginBottom: 18 } }),
      n.eyebrow("Photos", { style: { marginBottom: 10 } }),
      n.grid(3, { gap: 8 },
        ...["front", "side", "back"].map((photo) => n.photoTile(photo, {
          value: photo,
          filled: state.photos.includes(photo),
          onUpload: "photoUploaded",
          onRemove: "photoRemoved",
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
            serviceChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, service: String(payload?.value ?? current.service) })),
            budgetChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, budget: String(payload?.value ?? current.budget) })),
            tonesChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, tones: Array.isArray(payload?.value) ? payload.value.map(String) : current.tones })),
            damageChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, damage: Number(payload?.value ?? current.damage) })),
            segmentChanged: (payload?: DslActionPayload) => console.log("segmentChanged", payload),
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
            dayChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, day: String(payload?.value ?? current.day) })),
            timeChanged: (payload?: DslActionPayload) => setState((current) => ({ ...current, time: String(payload?.value ?? current.time) })),
            photoUploaded: (payload?: DslActionPayload) => setState((current) => ({ ...current, photos: Array.from(new Set([...current.photos, String(payload?.value)])) })),
            photoRemoved: (payload?: DslActionPayload) => setState((current) => ({ ...current, photos: current.photos.filter((photo) => photo !== String(payload?.value)) })),
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
  render: () => <StateDump value={buildInteractiveIntakeDsl({ service: "highlights", budget: "250-400", tones: ["dimensional"], damage: 2 })} />,
};
