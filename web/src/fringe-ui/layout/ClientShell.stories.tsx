import type { Meta, StoryObj } from "@storybook/react";
import { ClientShell } from "./ClientShell";

const meta: Meta<typeof ClientShell> = {
  title: "Fringe/Layout/ClientShell",
  component: ClientShell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ClientShell>;

export const HomeTab: Story = {
  name: "Home tab (default)",
  args: { activeTab: "Home", onTabChange: () => {} },
  render: (args) => (
    <ClientShell {...args}>
      <div style={{ padding: "14px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, letterSpacing: 4, textTransform: "uppercase" }}>Fringe</div>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: "#f2b89a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Anton", sans-serif', fontSize: 13, color: "#6b3a4a" }}>M</div>
      </div>
      <div style={{ margin: "18px 22px 22px", background: "#f2b89a", padding: "22px 22px 24px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#4a2431", marginBottom: 6 }}>GOOD MORNING · MIA</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 36, textTransform: "uppercase", color: "#111111", letterSpacing: -0.3, lineHeight: 0.95 }}>Two days<br/>until the chair.</div>
      </div>
    </ClientShell>
  ),
};

export const HistoryTab: Story = {
  name: "History tab",
  args: { activeTab: "History", onTabChange: () => {} },
  render: (args) => (
    <ClientShell {...args}>
      <div style={{ padding: "14px 22px 18px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 6 }}>5 VISITS · SINCE FEB 2024</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 40, textTransform: "uppercase", letterSpacing: -0.4, lineHeight: 0.95 }}>Your<br/>history.</div>
      </div>
    </ClientShell>
  ),
};

export const AccountTab: Story = {
  name: "Account tab",
  args: { activeTab: "Account", onTabChange: () => {} },
  render: (args) => (
    <ClientShell {...args}>
      <div style={{ padding: "14px 22px 18px" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, letterSpacing: 4, textTransform: "uppercase" }}>Fringe</div>
      </div>
      <div style={{ margin: "0 22px 24px", padding: "20px 20px", background: "#f2b89a", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Anton", sans-serif', fontSize: 26, color: "#6b3a4a" }}>M</div>
        <div>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 22, textTransform: "uppercase" }}>Mia Chen</div>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 14, color: "#4a2431", marginTop: 2 }}>Member since Feb 2024</div>
        </div>
      </div>
    </ClientShell>
  ),
};

export const Unstyled: Story = {
  args: { activeTab: "Home", onTabChange: () => {} },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base shell div)
      </div>
    ),
  ],
};