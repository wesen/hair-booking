import type { Meta, StoryObj } from "@storybook/react";
import { PointsHistoryList } from "./PointsHistoryList";
import { MOCK_POINTS_HISTORY } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PointsHistoryList> = {
  title: "Stylist/Portal/PointsHistoryList",
  component: PointsHistoryList,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PointsHistoryList>;

export const Default: Story = {
  args: {
    items: MOCK_POINTS_HISTORY,
  },
};
