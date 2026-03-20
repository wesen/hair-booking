import type { Meta, StoryObj } from "@storybook/react";
import { ServiceOption } from "./ServiceOption";
import { SERVICES } from "../data/constants";

const meta: Meta<typeof ServiceOption> = {
  title: "Stylist/ServiceOption",
  component: ServiceOption,
};

export default meta;
type Story = StoryObj<typeof ServiceOption>;

export const Default: Story = {
  args: {
    service: SERVICES[0],
  },
};

export const Selected: Story = {
  args: {
    service: SERVICES[0],
    selected: true,
  },
};

export const AllServices: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {SERVICES.map((service) => (
        <ServiceOption key={service.id} service={service} />
      ))}
    </div>
  ),
};

export const Expensive: Story = {
  args: {
    service: SERVICES[7],
  },
};
