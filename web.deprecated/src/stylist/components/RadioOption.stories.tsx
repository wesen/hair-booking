import type { Meta, StoryObj } from "@storybook/react";
import { RadioOption } from "./RadioOption";

const meta: Meta<typeof RadioOption> = {
  title: "Stylist/Consultation/RadioOption",
  component: RadioOption,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Medium",
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    children: "Medium",
  },
};

export const WithDescription: Story = {
  render: () => (
    <RadioOption selected>
      <div>
        <div style={{ fontWeight: 500 }}>Tape-ins</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Easiest application & removal
        </div>
      </div>
    </RadioOption>
  ),
};

export const RadioGroup: Story = {
  render: () => (
    <div data-part="radio-group">
      <RadioOption>Fine / thin</RadioOption>
      <RadioOption selected>Medium</RadioOption>
      <RadioOption>Thick</RadioOption>
    </div>
  ),
};
