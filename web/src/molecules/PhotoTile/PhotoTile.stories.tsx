import type { Meta, StoryObj } from "@storybook/react";
import { PhotoTile } from "./PhotoTile";

const meta: Meta<typeof PhotoTile> = {
  title: "Molecules/PhotoTile",
  component: PhotoTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PhotoTile>;

export const Empty: Story  = { args: { label: "Front", filled: false } };
export const Filled: Story = { args: { label: "Front", filled: true } };

export const AllAngles: Story = {
  name: "3-angle row (Front, Side, Back)",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      <PhotoTile label="Front" filled />
      <PhotoTile label="Side"  filled />
      <PhotoTile label="Back"  filled={false} />
    </div>
  ),
};

export const InspirationGrid: Story = {
  name: "Inspiration grid (4 cells)",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      <PhotoTile label="1" filled />
      <PhotoTile label="2" filled />
      <PhotoTile label="3" filled />
      <PhotoTile label="4" filled={false} />
    </div>
  ),
};

export const PartialFill: Story = {
  name: "Partial fill (2 of 3)",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      <PhotoTile label="Front" filled />
      <PhotoTile label="Side"  filled />
      <PhotoTile label="Back"  filled={false} />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { label: "Unstyled", filled: false },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div with aspect-ratio)
      </div>
    ),
  ],
};