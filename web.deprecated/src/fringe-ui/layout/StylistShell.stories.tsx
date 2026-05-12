import type { Meta, StoryObj } from "@storybook/react";
import { StylistShell } from "./StylistShell";

const meta: Meta<typeof StylistShell> = {
  title: "Fringe/Layout/StylistShell",
  component: StylistShell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StylistShell>;

export const TodayTab: Story = {
  name: "Today tab (default)",
  args: { activeTab: "Today", onTabChange: () => {}, accentColor: "#e8573c" },
  render: (args) => (
    <StylistShell {...args}>
      <div style={{ padding: "14px 22px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, letterSpacing: 4, textTransform: "uppercase" }}>Fringe</div>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: "#f2b89a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Anton", sans-serif', fontSize: 13, color: "#6b3a4a" }}>N</div>
      </div>
      <div style={{ padding: "8px 22px 20px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 8 }}>TUE · JUN 18 · TODAY</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 44, textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 0.95 }}>Five in<br/>the chair.</div>
      </div>
    </StylistShell>
  ),
};

export const ClientsTab: Story = {
  name: "Clients tab",
  args: { activeTab: "Clients", onTabChange: () => {} },
  render: (args) => (
    <StylistShell {...args}>
      <div style={{ padding: "14px 22px 18px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#e8573c", marginBottom: 6 }}>ROSTER · 142 ACTIVE</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 40, textTransform: "uppercase", letterSpacing: -0.4, lineHeight: 0.95 }}>Your<br/>clients.</div>
      </div>
    </StylistShell>
  ),
};

export const InboxTab: Story = {
  name: "Inbox tab",
  args: { activeTab: "Inbox", onTabChange: () => {} },
  render: (args) => (
    <StylistShell {...args}>
      <div style={{ padding: "14px 22px 18px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#e8573c", marginBottom: 6 }}>3 UNREAD · 7 TOTAL</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 40, textTransform: "uppercase", letterSpacing: -0.4, lineHeight: 0.95 }}>Inbox.</div>
      </div>
    </StylistShell>
  ),
};

export const DarkVariant: Story = {
  name: "Dark (bold variant)",
  args: { activeTab: "Today", onTabChange: () => {} },
  render: (args) => (
    <StylistShell {...args} style={{ background: "#111111" }}>
      <div style={{ background: "#f4c752", padding: "16px 22px 28px", color: "#111111" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, letterSpacing: 4, textTransform: "uppercase" }}>Fringe</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#4a2431" }}>NADIA · SENIOR</div>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#4a2431", marginBottom: 6 }}>TUE · JUN 18</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 96, textTransform: "uppercase", letterSpacing: -2, lineHeight: 0.82 }}>Today.</div>
      </div>
    </StylistShell>
  ),
};

export const Unstyled: Story = {
  args: { activeTab: "Today", onTabChange: () => {} },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base shell div)
      </div>
    ),
  ],
};