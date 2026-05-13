import type { Meta, StoryObj } from "@storybook/react";
import { StatusBar } from "./StatusBar";

const meta: Meta<typeof StatusBar> = {
  title: "Atoms/StatusBar",
  component: StatusBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {};
export const LightColor: Story = { args: { color: "#ffffff" } };
export const DarkColor: Story  = { args: { color: "#111111" } };

export const InPhoneFrame: Story = {
  name: "In phone frame",
  render: () => (
    <div style={{
      width: 390, height: 844, borderRadius: 48,
      background: "#ffffff", border: "8px solid #1a1a1a",
      overflow: "hidden",
      boxShadow: "0 24px 60px rgba(17,17,17,0.18)",
      position: "relative",
    }}>
      <StatusBar color="#111111" />
    </div>
  ),
};

export const Unstyled: Story = {
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — iOS status bar mockup)
      </div>
    ),
  ],
};