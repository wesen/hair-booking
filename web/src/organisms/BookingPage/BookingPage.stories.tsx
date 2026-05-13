import type { Meta, StoryObj } from "@storybook/react";
import { BookingPage } from "./BookingPage";
import { Provider } from "react-redux";
import { createRuntimeStore } from "../../store";

const store = createRuntimeStore();

const meta: Meta<typeof BookingPage> = {
  title: "Pages/BookingPage",
  component: BookingPage,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Provider store={store}><Story/></Provider>],
};

export default meta;
type Story = StoryObj<typeof BookingPage>;

export const Default: Story = {
  args: {
    intakeId: "intake_001",
    serviceId: "svc_highlights",
    stylist: { name: "Nadia Rivera", role: "Senior colorist · Lived-in blonde", rate: "$180+", available: "Available Tue 2:00p" },
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
