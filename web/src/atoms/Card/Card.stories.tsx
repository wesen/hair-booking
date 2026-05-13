import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Partial highlights
      </div>
      <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 16, color: "#6b3a4a", marginTop: 4 }}>
        3 months ago
      </div>
    </Card>
  ),
};

export const WithAccent: Story = {
  args: { accent: "#6b3a4a" },
  render: () => (
    <Card accent="#6b3a4a">
      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Last service
      </div>
      <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 16, color: "#6b3a4a", marginTop: 4 }}>
        Balayage refresh + trim · 3 months ago
      </div>
    </Card>
  ),
};

export const CoralAccent: Story = {
  args: { accent: "#e8573c" },
  render: () => (
    <Card accent="#e8573c">
      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Up next · in 12 min
      </div>
      <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 15, color: "#e8573c", marginTop: 4 }}>
        Mia Chen · Partial highlights + cut
      </div>
    </Card>
  ),
};

export const SageAccent: Story = {
  args: { accent: "#7a8f6b" },
  render: () => (
    <Card accent="#7a8f6b">
      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Available
      </div>
      <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 15, color: "#7a8f6b", marginTop: 4 }}>
        Tomorrow 2p
      </div>
    </Card>
  ),
};

export const ButterBackground: Story = {
  render: () => (
    <div style={{ background: "#f4c752", padding: 20 }}>
      <Card>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 20, textTransform: "uppercase" }}>
          Butter card
        </div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 15, marginTop: 4, color: "#4a2431" }}>
          Est. $245 · 3h 15m
        </div>
      </Card>
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All accent variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
      <Card><div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, textTransform: "uppercase" }}>Default (no accent)</div></Card>
      <Card accent="#6b3a4a"><div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, textTransform: "uppercase" }}>Plum accent</div></Card>
      <Card accent="#e8573c"><div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, textTransform: "uppercase" }}>Coral accent</div></Card>
      <Card accent="#7a8f6b"><div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, textTransform: "uppercase" }}>Sage accent</div></Card>
    </div>
  ),
};

export const Unstyled: Story = {
  render: () => (
    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888", padding: 20 }}>
      (base div with background: var(--fringe-cream))
    </div>
  ),
};