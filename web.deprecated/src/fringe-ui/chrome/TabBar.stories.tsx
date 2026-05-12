import type { Meta, StoryObj } from "@storybook/react";
import { TabBar, ClientTabBar } from "./TabBar";

const meta: Meta<typeof TabBar> = {
  title: "Fringe/Chrome/TabBar",
  component: TabBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TabBar>;

export const TodayActive: Story = {
  name: "Today active (default)",
  args: { activeTab: "Today", onTabChange: () => {} },
};

export const ClientsActive: Story = {
  name: "Clients active",
  args: { activeTab: "Clients", onTabChange: () => {} },
};

export const InboxActive: Story = {
  name: "Inbox active",
  args: { activeTab: "Inbox", onTabChange: () => {} },
};

export const YouActive: Story = {
  name: "You active",
  args: { activeTab: "You", onTabChange: () => {} },
};

export const CoralAccent: Story = {
  name: "Coral badge accent",
  args: { activeTab: "Today", onTabChange: () => {}, accentColor: "#e8573c" },
};

export const SageAccent: Story = {
  name: "Sage badge accent",
  args: { activeTab: "Clients", onTabChange: () => {}, accentColor: "#7a8f6b" },
};

export const InPhoneFrame: Story = {
  name: "In phone frame",
  render: () => (
    <div style={{
      width: 390, height: 844, borderRadius: 48,
      background: "#ffffff", border: "8px solid #1a1a1a",
      overflow: "hidden", position: "relative",
    }}>
      <div style={{ padding: "60px 0 0" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 48, textTransform: "uppercase", letterSpacing: -1, padding: "20px 22px" }}>
          Today.
        </div>
      </div>
      <TabBar activeTab="Today" onTabChange={() => {}} accentColor="#e8573c" />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { activeTab: "Today", onTabChange: () => {} },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — iOS tab bar)
      </div>
    ),
  ],
};

// ── Client Tab Bar ──────────────────────────────────────
const clientMeta: Meta<typeof ClientTabBar> = {
  title: "Fringe/Chrome/ClientTabBar",
  component: ClientTabBar,
  tags: ["autodocs"],
};

export const ClientHomeActive: Story = {
  name: "Client — Home active",
  args: { activeTab: "Home", onTabChange: () => {} },
};
export const ClientBookActive: Story = {
  name: "Client — Book active",
  args: { activeTab: "Book", onTabChange: () => {} },
};
export const ClientHistoryActive: Story = {
  name: "Client — History active",
  args: { activeTab: "History", onTabChange: () => {} },
};
export const ClientAccountActive: Story = {
  name: "Client — Account active",
  args: { activeTab: "Account", onTabChange: () => {} },
};