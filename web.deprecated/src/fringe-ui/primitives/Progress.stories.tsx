import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Fringe/Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Zero: Story   = { args: { value: 0,   max: 100 } };
export const Quarter: Story = { args: { value: 25,  max: 100 } };
export const Half: Story    = { args: { value: 50,  max: 100 } };
export const ThreeQuarter: Story = { args: { value: 75, max: 100 } };
export const Full: Story    = { args: { value: 100, max: 100 } };
export const Step1of9: Story = { args: { value: 1,  max: 9 }, name: "Step 1 of 9" };
export const Step5of9: Story = { args: { value: 5,  max: 9 }, name: "Step 5 of 9" };
export const Step8of9: Story = { args: { value: 8,  max: 9 }, name: "Step 8 of 9" };

export const CustomColor: Story = {
  args: { value: 83, color: "#e8573c" },
};

export const OnPeach: Story = {
  args: { value: 60 },
  decorators: [
    (Story) => (
      <div style={{ background: "#f2b89a", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const OnButter: Story = {
  args: { value: 60 },
  decorators: [
    (Story) => (
      <div style={{ background: "#f4c752", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const StepRailStyle: Story = {
  name: "Intake progress (step 5 of 9)",
  render: () => (
    <div style={{ padding: "8px 22px 0" }}>
      <Progress value={5} max={9} />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { value: 50 },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — two nested divs)
      </div>
    ),
  ],
};