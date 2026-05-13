import type { Meta, StoryObj } from "@storybook/react";
import { HomeIndicator } from "./HomeIndicator";

const meta: Meta<typeof HomeIndicator> = {
  title: "Atoms/HomeIndicator",
  component: HomeIndicator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HomeIndicator>;

export const Default: Story = {};
export const LightColor: Story = { args: { color: "#ffffff" } };
export const DarkColor: Story  = { args: { color: "#111111" } };

export const AtBottomOfPhone: Story = {
  name: "At bottom of phone",
  render: () => (
    <div style={{
      width: 390, height: 844, borderRadius: 48,
      background: "#ffffff", border: "8px solid #1a1a1a",
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 110, height: 32, borderRadius: 20, background: "#000", zIndex: 100 }} />
      <div style={{ padding: "80px 24px 0", fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 19, color: "#5b5852" }}>
        What brings you in?
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <HomeIndicator color="#111111" />
      </div>
    </div>
  ),
};

export const Unstyled: Story = {
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — iOS home indicator pill)
      </div>
    ),
  ],
};