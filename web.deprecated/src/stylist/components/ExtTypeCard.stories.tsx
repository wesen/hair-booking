import type { Meta, StoryObj } from "@storybook/react";
import { ExtTypeCard } from "./ExtTypeCard";
import { EXT_TYPES } from "../data/consultation-constants";

const meta: Meta<typeof ExtTypeCard> = {
  title: "Stylist/Consultation/ExtTypeCard",
  component: ExtTypeCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    extType: EXT_TYPES[0], // tape-ins
  },
};

export const Selected: Story = {
  args: {
    extType: EXT_TYPES[1], // k-tips
    selected: true,
  },
};

export const Unsure: Story = {
  args: {
    extType: EXT_TYPES[3], // unsure
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {EXT_TYPES.map((ext) => (
        <ExtTypeCard
          key={ext.id}
          extType={ext}
          selected={ext.id === "ktip"}
        />
      ))}
    </div>
  ),
};
