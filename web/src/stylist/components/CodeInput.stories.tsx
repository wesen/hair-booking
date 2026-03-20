import type { Meta, StoryObj } from "@storybook/react";
import { CodeInput } from "./CodeInput";

const meta: Meta<typeof CodeInput> = {
  title: "Stylist/Consultation/CodeInput",
  component: CodeInput,
};

export default meta;
type Story = StoryObj<typeof CodeInput>;

export const Empty: Story = {
  args: {
    digits: ["", "", "", "", "", ""],
  },
};

export const PartiallyFilled: Story = {
  args: {
    digits: ["4", "8", "2", "", "", ""],
  },
};

export const Complete: Story = {
  args: {
    digits: ["4", "8", "2", "9", "1", "5"],
  },
};

export const WithError: Story = {
  args: {
    digits: ["4", "8", "2", "9", "", ""],
    error: true,
  },
};
