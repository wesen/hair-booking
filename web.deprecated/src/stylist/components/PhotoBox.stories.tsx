import type { Meta, StoryObj } from "@storybook/react";
import { PhotoBox } from "./PhotoBox";

const meta: Meta<typeof PhotoBox> = {
  title: "Stylist/Consultation/PhotoBox",
  component: PhotoBox,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    label: "Front",
  },
};

export const WithPhoto: Story = {
  args: {
    label: "Front",
    hasPhoto: true,
  },
};

export const PhotoGrid: Story = {
  render: () => (
    <div data-part="photo-grid">
      <PhotoBox label="Front" hasPhoto />
      <PhotoBox label="Back" />
      <PhotoBox label="Hairline" hasPhoto />
      <PhotoBox label="Inspo" />
    </div>
  ),
};
