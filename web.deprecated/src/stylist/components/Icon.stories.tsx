import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";
import type { IconName } from "../types";

const meta: Meta<typeof Icon> = {
  title: "Stylist/Icon",
  component: Icon,
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: "home",
  },
};

const allIcons: IconName[] = [
  "home",
  "calendar",
  "users",
  "star",
  "gift",
  "check",
  "clock",
  "back",
  "search",
  "plus",
  "x",
  "send",
  "phone",
  "note",
];

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {allIcons.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Icon name={name} />
          <span style={{ fontSize: 11 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Small: Story = {
  args: {
    name: "home",
    size: 14,
  },
};

export const Large: Story = {
  args: {
    name: "home",
    size: 32,
  },
};

export const WithColor: Story = {
  render: () => (
    <div style={{ color: "#c4917b" }}>
      <Icon name="star" />
    </div>
  ),
};
