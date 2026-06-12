import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./AppHeader";

const meta: Meta<typeof AppHeader> = {
  title: "Molecules/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = { args: { step: 1, total: 9 } };
export const Step5of9: Story = { args: { step: 5, total: 9 } };
export const Step9of9: Story = { args: { step: 9, total: 9 } };
export const NoStep: Story   = { args: {} };

export const WithBack: Story = {
  name: "With back handler",
  args: { step: 2, total: 9, onBack: () => alert("back!") },
};

export const InHeaderBar: Story = {
  name: "In full header bar",
  render: () => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 22px 0",
      borderBottom: "1px solid #ebe7df",
      background: "#fff",
      height: 52,
    }}>
      <AppHeader step={3} total={9} onBack={() => {}} />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { step: 1, total: 9 },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — mobile top bar)
      </div>
    ),
  ],
};