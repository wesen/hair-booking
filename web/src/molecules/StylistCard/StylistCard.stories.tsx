import type { Meta, StoryObj } from "@storybook/react";
import { StylistCard } from "./StylistCard";

const meta: Meta<typeof StylistCard> = {
  title: "Molecules/StylistCard",
  component: StylistCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StylistCard>;

export const Default: Story = {
  args: { name: "Nadia Rivera", role: "Senior colorist · Lived-in blonde", rate: "$180+", available: "Tomorrow 2p" },
};

export const AvailableSoon: Story = {
  args: { name: "Theo Park", role: "Cutter · Shag specialist", rate: "$120+", available: "Next Tue" },
};

export const NoRate: Story = {
  args: { name: "Josephine L.", role: "Colorist", available: "Today 3p" },
};

export const NoAvailability: Story = {
  args: { name: "Iris Kwan", role: "Colorist", rate: "$200+" },
};

export const OnCreamDeep: Story = {
  args: { name: "Nadia Rivera", role: "Senior colorist · Lived-in blonde", rate: "$180+", available: "Tomorrow 2p" },
  decorators: [
    (Story) => (
      <div style={{ background: "#efe6d4", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkCard: Story = {
  name: "Dark card variant",
  render: () => (
    <div style={{ background: "#111111", padding: 16 }}>
      <StylistCard name="Nadia Rivera" role="Senior colorist · Lived-in blonde" rate="$180+" available="Tomorrow 2p" />
    </div>
  ),
};

export const SageCard: Story = {
  name: "Sage background",
  render: () => (
    <div style={{ background: "#7a8f6b", padding: 16 }}>
      <StylistCard name="Nadia Rivera" role="Senior colorist · Lived-in blonde" rate="$180+" available="Tomorrow 2p" />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { name: "Nadia Rivera", role: "Senior colorist", rate: "$180+" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div with flex layout)
      </div>
    ),
  ],
};