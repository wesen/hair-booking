import type { Meta, StoryObj } from "@storybook/react";
import { Section } from "./Section";

const meta: Meta<typeof Section> = {
  title: "Fringe/Salon/Section",
  component: Section,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Section>;

export const WithTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section n={1} title="SERVICE">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Partial highlights + cut</div>
      </Section>
    </div>
  ),
};

export const NoTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section n={2}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Partial highlights + cut</div>
      </Section>
    </div>
  ),
};

export const WithoutIndex: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section title="SERVICE">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Partial highlights + cut</div>
      </Section>
    </div>
  ),
};

export const NoTopBorder: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section n={1} title="SERVICE" topBorder={false}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>First section (no top border)</div>
      </Section>
    </div>
  ),
};

export const StackedSections: Story = {
  name: "Stacked sections (intake flow)",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section n={1} title="SERVICE">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Partial highlights + cut</div>
      </Section>
      <Section n={2} title="COLOR LEVEL">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Level 7 → Level 8</div>
      </Section>
      <Section n={3} title="LENGTH">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>Mid-back · no extensions</div>
      </Section>
    </div>
  ),
};

export const CustomAccent: Story = {
  name: "Custom accent (coral)",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Section n={1} title="UP NEXT · IN 12 MIN" accent="#e8573c">
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase", color: "#ffffff" }}>
          Mia Chen · Partial highlights + cut
        </div>
      </Section>
    </div>
  ),
};

export const Unstyled: Story = {
  args: { n: 1, title: "Unstyled" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div with flex row)
      </div>
    ),
  ],
};