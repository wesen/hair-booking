import type { Meta, StoryObj } from "@storybook/react";
import { PhotosPage } from "./PhotosPage";

const meta: Meta<typeof PhotosPage> = {
  title: "Pages/PhotosPage",
  component: PhotosPage,
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj<typeof PhotosPage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
