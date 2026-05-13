import type { Meta, StoryObj } from "@storybook/react";
import { HistoryPage } from "./HistoryPage";

const meta: Meta<typeof HistoryPage> = {
  title: "Pages/HistoryPage",
  component: HistoryPage,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof HistoryPage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
