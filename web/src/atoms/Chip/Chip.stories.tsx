import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Fringe/Primitives/Chip",
  component: Chip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chip>;

const CONDITIONS = ["Healthy", "Dry", "Damaged", "Brittle", "Oily", "Frizzy", "Fine", "Thick", "Color-treated"];
const LENGTHS   = ["Short", "Medium", "Long", "Extra long"];

// ── Pill shape (default) ────────────────────────────────
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

// ── Square shape ─────────────────────────────────────────
export const SquareDefault: Story = {
  args: { children: "Short", shape: "square", selected: false },
};

export const SquareSelected: Story = {
  args: { children: "Medium", shape: "square", selected: true },
};

// ── Themed ──────────────────────────────────────────────
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

// ── Condition filter group (pill) ───────────────────────
export const ConditionChips: Story = {
  name: "Group — Condition filter (pill)",
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

// ── Length filter group (square) ────────────────────────
export const LengthChips: Story = {
  name: "Group — Length filter (square)",
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

// ── Unstyled ─────────────────────────────────────────────
export const UnstyledChip: Story = {
  args: { children: "Unstyled chip", selected: false },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base span element)
      </div>
    ),
  ],
};