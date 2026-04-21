import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Fringe/Primitives/TextField",
  component: TextField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { label: "First name", placeholder: "Enter your name" },
};

export const WithValue: Story = {
  args: { label: "Email", value: "you@fringe.salon" },
};

export const Multiline: Story = {
  args: {
    label: "Anything else",
    multiline: true,
    value: "Usually wash twice a week. Ends feel crunchy in winter.",
  },
};

export const MultilinePlaceholder: Story = {
  args: { label: "Notes for your stylist", multiline: true, placeholder: "Tap to add…" },
};

export const NoLabel: Story = {
  args: { placeholder: "Search name, service, notes…" },
};

export const OnCreamDeep: Story = {
  args: { label: "First name", placeholder: "Enter your name" },
  decorators: [
    (Story) => (
      <div style={{ background: "#efe6d4", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 500 }}>
      <TextField label="First name" placeholder="Enter your name" />
      <TextField label="Email" value="you@fringe.salon" />
      <TextField label="Anything else" multiline value="Usually wash twice a week. Ends feel crunchy in winter." />
      <TextField label="Search" placeholder="Search name, service, notes…" />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { label: "Unstyled input", placeholder: "placeholder" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base input element)
      </div>
    ),
  ],
};