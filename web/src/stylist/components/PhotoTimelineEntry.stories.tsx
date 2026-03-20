import type { Meta, StoryObj } from "@storybook/react";
import { PhotoTimelineEntry } from "./PhotoTimelineEntry";
import { MOCK_PHOTOS } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PhotoTimelineEntry> = {
  title: "Stylist/Portal/PhotoTimelineEntry",
  component: PhotoTimelineEntry,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PhotoTimelineEntry>;

export const Default: Story = {
  args: {
    entry: MOCK_PHOTOS[0],
  },
};

export const Install: Story = {
  args: {
    entry: MOCK_PHOTOS[1],
  },
};
