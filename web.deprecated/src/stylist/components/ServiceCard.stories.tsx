import type { Meta, StoryObj } from "@storybook/react";
import { ServiceCard } from "./ServiceCard";

const meta: Meta<typeof ServiceCard> = {
  title: "Stylist/Consultation/ServiceCard",
  component: ServiceCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Color: Story = {
  args: {
    title: "Color Services",
    description: "Full color, highlights, balayage, correction",
    emoji: "🎨",
    gradientFrom: "#e8d5e8",
    gradientTo: "#dcc5dc",
  },
};

export const Extensions: Story = {
  args: {
    title: "Extensions",
    description: "Tape-ins, k-tips, hand-tied wefts",
    emoji: "✨",
  },
};

export const Both: Story = {
  args: {
    title: "Extensions + Color",
    description: "Full transformation — extensions and color together",
    emoji: "💫",
    gradientFrom: "#d8e6f5",
    gradientTo: "#d0ddee",
  },
};

export const AllServices: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ServiceCard
        title="Extensions"
        description="Tape-ins, k-tips, hand-tied wefts"
        emoji="✨"
      />
      <ServiceCard
        title="Color Services"
        description="Full color, highlights, balayage, correction"
        emoji="🎨"
        gradientFrom="#e8d5e8"
        gradientTo="#dcc5dc"
      />
      <ServiceCard
        title="Extensions + Color"
        description="Full transformation — extensions and color together"
        emoji="💫"
        gradientFrom="#d8e6f5"
        gradientTo="#d0ddee"
      />
    </div>
  ),
};
