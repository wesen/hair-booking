import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Stylist/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: "Default card content",
  },
};

export const Rose: Story = {
  args: {
    variant: "rose",
    children: "Rose variant card",
  },
};

export const Gold: Story = {
  args: {
    variant: "gold",
    children: "Gold variant card",
  },
};

export const Clickable: Story = {
  args: {
    children: "Click me!",
    onClick: () => alert("Card clicked"),
    style: { cursor: "pointer" },
  },
};

export const WithContent: Story = {
  render: () => (
    <Card>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>128</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Clients</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>42</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>This Week</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>$3.2k</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Revenue</div>
        </div>
      </div>
    </Card>
  ),
};
