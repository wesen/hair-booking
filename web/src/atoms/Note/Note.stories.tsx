import type { Meta, StoryObj } from "@storybook/react";
import { Note } from "./Note";

const meta: Meta<typeof Note> = {
  title: "Atoms/Note",
  component: Note,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Note>;

export const Info: Story = {
  args: { tone: "info",    children: "We'll confirm your appointment by text within one hour." },
};

export const Success: Story = {
  args: { tone: "success", children: "Deposit received — see you Tuesday." },
};

export const Warn: Story = {
  args: { tone: "warn", children: "A color service this dramatic usually needs a consultation first." },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Cancellations within 24h forfeit the deposit." },
};

export const InfoWithMarkup: Story = {
  name: "Info (with markup)",
  args: { tone: "info", children: "You're at Level 7 — dark blonde with warm undertones." },
  decorators: [
    (Story) => (
      <div style={{ padding: "14px 18px", maxWidth: 400 }}>
        <div style={{
          background: "#f6efe4",
          borderLeft: "3px solid #6b3a4a",
          padding: "12px 14px",
          fontSize: 14,
          lineHeight: 1.5,
        }}>
          You're at <strong>Level 7</strong> — dark blonde with warm undertones.
        </div>
      </div>
    ),
  ],
};

export const SuccessWithStrong: Story = {
  name: "Success (with strong)",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Note tone="success">
        Deposit received — see you <strong>Tuesday</strong>.
      </Note>
    </div>
  ),
};

export const AllTones: Story = {
  name: "All tones",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      <Note tone="info">We'll confirm your appointment by text within one hour.</Note>
      <Note tone="success">Deposit received — see you Tuesday.</Note>
      <Note tone="warn">A color service this dramatic usually needs a consultation first.</Note>
      <Note tone="danger">Cancellations within 24h forfeit the deposit.</Note>
    </div>
  ),
};

export const Unstyled: Story = {
  args: { tone: "info", children: "Unstyled note" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div, no Fringe styles)
      </div>
    ),
  ],
};