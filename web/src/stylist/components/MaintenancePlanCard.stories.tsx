import type { Meta, StoryObj } from "@storybook/react";
import { MaintenancePlanCard } from "./MaintenancePlanCard";
import { MOCK_MAINTENANCE } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof MaintenancePlanCard> = {
  title: "Stylist/Portal/MaintenancePlanCard",
  component: MaintenancePlanCard,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MaintenancePlanCard>;

export const Default: Story = {
  args: {
    items: MOCK_MAINTENANCE,
  },
};
