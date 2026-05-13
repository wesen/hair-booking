import type { Meta, StoryObj } from "@storybook/react";
import { ServicePage } from "./ServicePage";

const meta: Meta<typeof ServicePage> = {
  title: "Organisms/ServicePage",
  component: ServicePage,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ServicePage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
