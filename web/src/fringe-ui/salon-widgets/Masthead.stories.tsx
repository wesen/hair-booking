import type { Meta, StoryObj } from "@storybook/react";
import { Masthead } from "./Masthead";

const meta: Meta<typeof Masthead> = {
  title: "Fringe/Salon/Masthead",
  component: Masthead,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Masthead>;

export const Default: Story = {
  args: { eyebrow: "Chapter V · The Record", title: "Your hair,", accent: "on file." },
};

export const ConfirmMasthead: Story = {
  name: "Confirm — You're booked",
  args: { eyebrow: "You're booked.", title: "See you", accent: "Tuesday.", right: "CONF #4281" },
};

export const Compact: Story = {
  args: { eyebrow: "ESTIMATED TOTAL", title: "$245", right: "3h 15m", compact: true },
};

export const WithoutEyebrow: Story = {
  args: { title: "See you", accent: "Tuesday." },
};

export const WithoutRight: Story = {
  args: { eyebrow: "CONFIRMATION · #4281", title: "See you", accent: "Tuesday." },
};

export const WithoutAccent: Story = {
  args: { eyebrow: "Chapter I · The Ask", title: "What brings you in?" },
};

export const LargeTitle: Story = {
  name: "Large (font 56px)",
  args: { eyebrow: "Chapter VIII · The Date", title: "When suits you?" },
};

export const OnWhite: Story = {
  name: "On white background",
  render: () => (
    <div style={{ background: "#ffffff", padding: 24 }}>
      <Masthead eyebrow="Chapter V · The Record" title="Your hair," accent="on file." />
    </div>
  ),
};

export const OnCreamDeep: Story = {
  name: "On cream-deep background",
  render: () => (
    <div style={{ background: "#efe6d4", padding: 24 }}>
      <Masthead eyebrow="Chapter V · The Record" title="Your hair," accent="on file." />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { title: "Unstyled masthead" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div with peach background)
      </div>
    ),
  ],
};