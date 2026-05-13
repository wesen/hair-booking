import type { Meta, StoryObj } from "@storybook/react";
import { Rule } from "./Rule";

const meta: Meta<typeof Rule> = {
  title: "Atoms/Rule",
  component: Rule,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Rule>;

export const Default: Story = { args: {} };
export const Thick: Story  = { args: { thick: true } };
export const Dark: Story    = { args: { color: "#111111" } };
export const Plum: Story    = { args: { color: "#6b3a4a" } };
export const Coral: Story    = { args: { color: "#e8573c" } };

export const SectionDivider: Story = {
  name: "In section context",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <div style={{ padding: "14px 0" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 12 }}>
          SERVICE
        </div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Partial highlights + cut</div>
      </div>
      <Rule />
      <div style={{ padding: "14px 0" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Color level</div>
      </div>
      <Rule thick />
    </div>
  ),
};

export const Unstyled: Story = {
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div, height: 1px)
      </div>
    ),
  ],
};