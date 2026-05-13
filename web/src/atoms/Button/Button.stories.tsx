import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

// ── Variants ────────────────────────────────────────────
export const PrimaryDefault: Story = {
  args: { variant: "primary", size: "md", children: "Book now →" },
};

export const PrimaryHover: Story = {
  args: { variant: "primary", size: "md", children: "Keep going" },
  parameters: { pseudo: { hover: true } },
};

export const PrimaryActive: Story = {
  args: { variant: "primary", size: "md", children: "Keep going" },
  parameters: { pseudo: { active: true } },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Skip" },
};

export const SecondaryHover: Story = {
  args: { variant: "secondary", size: "md", children: "Cancel" },
  parameters: { pseudo: { hover: true } },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "md", children: "Cancel" },
};

export const Danger: Story = {
  args: { variant: "danger", size: "md", children: "Delete" },
};

// ── Sizes ────────────────────────────────────────────────
export const SizeSm: Story = {
  args: { variant: "primary", size: "sm", children: "Save" },
};

export const SizeMd: Story = {
  args: { variant: "primary", size: "md", children: "Save" },
};

export const SizeLg: Story = {
  args: { variant: "primary", size: "lg", children: "Book now →" },
};

// ── States ───────────────────────────────────────────────
export const Disabled: Story = {
  args: { variant: "primary", size: "md", children: "Book now", disabled: true },
};

export const GhostDisabled: Story = {
  args: { variant: "ghost", size: "md", children: "Cancel", disabled: true },
};

// ── Themed variants ──────────────────────────────────────
export const ButterAccent: Story = {
  args: { variant: "primary", size: "lg", children: "Continue to booking →" },
  decorators: [
    (Story) => (
      <div style={{ background: "#f4c752", padding: 24, display: "inline-block" }}>
        <Story />
      </div>
    ),
  ],
};

export const SageAccent: Story = {
  args: { variant: "primary", size: "lg", children: "Hold this slot →" },
  decorators: [
    (Story) => (
      <div style={{ background: "#7a8f6b", padding: 24, display: "inline-block" }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkBg: Story = {
  args: { variant: "primary", size: "md", children: "Done" },
  decorators: [
    (Story) => (
      <div style={{ background: "#111111", padding: 24, display: "inline-block" }}>
        <Story />
      </div>
    ),
  ],
};

// ── All variants ──────────────────────────────────────────
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      <Button variant="primary" size="lg">Book now →</Button>
      <Button variant="primary" size="md">Keep going</Button>
      <Button variant="primary" size="sm">Save</Button>
      <Button variant="secondary">Skip</Button>
      <Button variant="secondary" size="sm">Edit</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="primary" size="lg" disabled>Disabled</Button>
    </div>
  ),
};

// ── Unstyled ─────────────────────────────────────────────
export const Unstyled: Story = {
  args: { variant: "primary", size: "md", children: "Unstyled button" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (no Fringe styles applied — base button element)
      </div>
    ),
  ],
};