import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmPage } from "./ConfirmPage";

const meta: Meta<typeof ConfirmPage> = {
  title: "Organisms/ConfirmPage",
  component: ConfirmPage,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ConfirmPage>;

export const Default: Story = {
  args: {
    confirmationNumber: "#4281",
    when: "Tuesday, June 18",
    time: "2:00 PM",
    stylist: "Nadia Rivera",
    service: "Partial highlights + cut",
    estimate: "$245",
    duration: "3h 15m",
    deposit: "$50",
    onDone: () => console.log("done"),
  },
};
