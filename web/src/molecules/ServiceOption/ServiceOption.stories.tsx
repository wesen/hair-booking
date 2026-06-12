import type { Meta, StoryObj } from "@storybook/react";
import { ServiceOption } from "./ServiceOption";

const meta: Meta<typeof ServiceOption> = {
  title: "Molecules/ServiceOption",
  component: ServiceOption,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ServiceOption>;

export const Default: Story = {
  args: { name: "Highlights", description: "Partial · full · balayage", rate: "$180+" },
};

export const Selected: Story = {
  args: { name: "Highlights", description: "Partial · full · balayage", rate: "$180+", selected: true },
};

export const WithoutRate: Story = {
  args: { name: "Consultation", description: "Free 15-minute chat" },
};
