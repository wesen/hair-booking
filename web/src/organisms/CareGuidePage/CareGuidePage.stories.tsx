import type { Meta, StoryObj } from "@storybook/react";
import { CareGuidePage } from "./CareGuidePage";

const meta: Meta<typeof CareGuidePage> = {
  title: "Pages/CareGuidePage",
  component: CareGuidePage,
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj<typeof CareGuidePage>;

export const Default: Story = {
  args: {
    sections: [
      {
        emoji: "🎨",
        heading: "First 48 hours",
        items: [
          "Avoid washing for 48 hours to let color set",
          "Use cool water when you do wash",
          "Skip the dry shampoo this week",
        ],
      },
      {
        emoji: "💆",
        heading: "Ongoing care",
        items: [
          "Sulfate-free shampoo only",
          "Deep condition weekly",
          "Minimize heat styling",
        ],
      },
    ],
    onBack: () => console.log("back"),
  },
};
