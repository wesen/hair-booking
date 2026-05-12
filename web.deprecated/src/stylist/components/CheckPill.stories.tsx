import type { Meta, StoryObj } from "@storybook/react";
import { CheckPill } from "./CheckPill";
import { CHEMICAL_HISTORY } from "../data/consultation-constants";

const meta: Meta<typeof CheckPill> = {
  title: "Stylist/Consultation/CheckPill",
  component: CheckPill,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Box dye",
  },
};

export const Checked: Story = {
  args: {
    label: "Box dye",
    checked: true,
  },
};

export const CheckGrid: Story = {
  render: () => (
    <div data-part="check-grid">
      {CHEMICAL_HISTORY.map((item, i) => (
        <CheckPill
          key={item}
          label={item}
          checked={i === 0 || i === 2}
        />
      ))}
    </div>
  ),
};
