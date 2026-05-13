import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";
import { ChipGroup } from "./ChipGroup";
import { color, font } from "../../fringe-ui/tokens";

const meta: Meta<typeof Chip> = {
  title: "Atoms/Chip",
  component: Chip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chip>;

const CONDITIONS = ["Healthy", "Dry", "Damaged", "Brittle", "Oily", "Frizzy", "Fine", "Thick", "Color-treated"];
const LENGTHS = ["Short", "Medium", "Long", "Extra long"];
const TONES = [
  { value: "neutral", label: "Neutral" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "dimensional", label: "Dimensional" },
  { value: "low-maintenance", label: "Low upkeep" },
];

export const PillDefault: Story = {
  args: { children: "Healthy", selected: false },
};

export const PillSelected: Story = {
  args: { children: "Healthy", selected: true },
};

export const PillHover: Story = {
  args: { children: "Dry", selected: false, onClick: () => {} },
  parameters: { pseudo: { hover: true } },
};

export const SquareDefault: Story = {
  args: { children: "Short", shape: "square", selected: false },
};

export const SquareSelected: Story = {
  args: { children: "Medium", shape: "square", selected: true },
};

export const ButterTheme: Story = {
  args: { children: "VIP", selected: true },
  decorators: [
    (Story) => (
      <div style={{ background: "#f4c752", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const SageTheme: Story = {
  args: { children: "NEW", selected: true },
  decorators: [
    (Story) => (
      <div style={{ background: "#7a8f6b", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const CoralTheme: Story = {
  args: { children: "VIP", selected: true },
  decorators: [
    (Story) => (
      <div style={{ background: "#e8573c", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const ConditionChips: Story = {
  name: "Group — Condition filter (static pill)",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {CONDITIONS.map((c) => (
        <Chip key={c} selected={["Healthy", "Frizzy"].includes(c)} onClick={() => {}}>
          {c}
        </Chip>
      ))}
    </div>
  ),
};

export const LengthChips: Story = {
  name: "Group — Length filter (static square)",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {LENGTHS.map((l) => (
        <Chip key={l} shape="square" selected={l === "Medium"} onClick={() => {}}>
          {l}
        </Chip>
      ))}
    </div>
  ),
};

export const InteractiveToneMultiSelect: Story = {
  name: "Interactive — toggled tone chips",
  render: () => {
    const [selected, setSelected] = useState<string[]>(["dimensional"]);

    return (
      <div style={{ maxWidth: 360 }}>
        <ChipGroup
          label="Tone family"
          helperText="Choose as many tone tags as apply. This is a controlled multi-select ChipGroup."
          options={TONES}
          value={selected}
          onChange={setSelected}
        />
        <pre style={{ marginTop: 16, padding: 12, background: color.cream, fontFamily: font.mono, fontSize: 12 }}>
          {JSON.stringify({ selected }, null, 2)}
        </pre>
      </div>
    );
  },
};

export const InteractiveLengthSingleSelect: Story = {
  name: "Interactive — single length selector",
  render: () => {
    const [selected, setSelected] = useState<string[]>(["Medium"]);

    return (
      <div style={{ maxWidth: 360 }}>
        <ChipGroup
          label="Current length"
          selectionMode="single"
          shape="square"
          options={LENGTHS}
          value={selected}
          onChange={setSelected}
        />
        <pre style={{ marginTop: 16, padding: 12, background: color.cream, fontFamily: font.mono, fontSize: 12 }}>
          {JSON.stringify({ selected: selected[0] ?? null }, null, 2)}
        </pre>
      </div>
    );
  },
};

export const DisabledChip: Story = {
  args: { children: "Unavailable", selected: false, disabled: true },
};
