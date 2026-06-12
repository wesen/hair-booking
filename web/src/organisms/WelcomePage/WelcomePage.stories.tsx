import type { Meta, StoryObj } from "@storybook/react";
import { WelcomePage } from "./WelcomePage";

const meta: Meta<typeof WelcomePage> = {
  title: "Pages/WelcomePage",
  component: WelcomePage,
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj<typeof WelcomePage>;

export const Default: Story = {
  args: {
    onSelectColor: () => console.log("color"),
    onSelectExtensions: () => console.log("extensions"),
    onSelectBoth: () => console.log("both"),
  },
};
