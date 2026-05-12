import type { Meta, StoryObj } from "@storybook/react";
import { PhotoPickerSheet } from "./PhotoPickerSheet";

const meta: Meta<typeof PhotoPickerSheet> = {
  title: "Stylist/Consultation/PhotoPickerSheet",
  component: PhotoPickerSheet,
};

export default meta;
type Story = StoryObj<typeof PhotoPickerSheet>;

export const Default: Story = {
  args: {},
};
