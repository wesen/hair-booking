import type { Meta, StoryObj } from "@storybook/react";
import { Segmented } from "./Segmented";

const meta: Meta<typeof Segmented> = {
  title: "Atoms/Segmented",
  component: Segmented,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Segmented>;

export const ServiceOptions: Story = {
  name: "Service options (3 segments)",
  render: () => <Segmented options={["Service", "Color", "Extensions"]} value="Color" onChange={() => {}} />,
};

export const ExtensionTypes: Story = {
  name: "Extension type (3 segments)",
  render: () => <Segmented options={[{ value: "none", label: "None" }, { value: "taped", label: "Tape-in" }, { value: "tied", label: "Hand-tied" }]} value="taped" onChange={() => {}} />,
};

export const ReminderTiming: Story = {
  name: "Reminder timing (4 segments)",
  render: () => <Segmented options={["1 hr", "12 hr", "24 hr", "48 hr"]} value="24 hr" onChange={() => {}} />,
};

export const MaintenancePreference: Story = {
  name: "Maintenance preference (4 segments)",
  render: () => <Segmented options={["4-6wk", "8-12wk", "Quarterly", "Whatever"]} value="8-12wk" onChange={() => {}} />,
};

export const NoSelectionYet: Story = {
  name: "No selection yet",
  render: () => <Segmented options={["Service", "Color", "Extensions"]} onChange={() => {}} />,
};

export const TwoSegments: Story = {
  name: "Two segments",
  render: () => <Segmented options={["Personal", "Hair profile", "Preferences"]} value="Hair profile" onChange={() => {}} />,
};

export const OnButter: Story = {
  render: () => <Segmented options={["Service", "Color", "Extensions"]} value="Color" onChange={() => {}} />,
  decorators: [
    (Story) => (
      <div style={{ background: "#f4c752", padding: 24, display: "inline-block" }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Segmented options={["Service", "Color", "Extensions"]} value="Color" onChange={() => {}} />
      <Segmented options={[{ value: "none", label: "None" }, { value: "taped", label: "Tape-in" }, { value: "tied", label: "Hand-tied" }]} value="taped" onChange={() => {}} />
      <Segmented options={["1 hr", "12 hr", "24 hr", "48 hr"]} value="24 hr" onChange={() => {}} />
    </div>
  ),
};

export const Unstyled: Story = {
  render: () => <Segmented options={["A", "B", "C"]} value="B" onChange={() => {}} />,
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div with border, button children)
      </div>
    ),
  ],
};