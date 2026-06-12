import type { Meta, StoryObj } from "@storybook/react";
import { IntakeShell } from "./IntakeShell";

const meta: Meta<typeof IntakeShell> = {
  title: "Organisms/IntakeShell",
  component: IntakeShell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IntakeShell>;

export const Step1of9: Story = {
  name: "Step 1 of 9 — Service",
  args: {
    step: 1, total: 9,
    eyebrow: "Chapter I · The Ask",
    title: "What brings you in?",
  },
  render: (args) => (
    <IntakeShell {...args}>
      <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 17, color: "#5b5852", marginBottom: 18 }}>
        Pick one to start — you can add more later.
      </div>
      {["Cut", "Color", "Highlights", "Extensions", "Treatment"].map((s) => (
        <div key={s} style={{
          padding: "14px 16px", marginBottom: 8,
          background: "#f6efe4",
          display: "flex", gap: 14, alignItems: "center",
          cursor: "pointer",
        }}>
          <div style={{ flex: 1, fontFamily: '"Anton", sans-serif', fontSize: 18, textTransform: "uppercase" }}>{s}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#6b3a4a" }}>$80+</div>
        </div>
      ))}
    </IntakeShell>
  ),
};

export const Step5of9: Story = {
  name: "Step 5 of 9 — History",
  args: {
    step: 5, total: 9,
    eyebrow: "Chapter V · The Record",
    title: "Hair history",
  },
  render: (args) => (
    <IntakeShell {...args}>
      <div style={{ padding: "14px 18px", borderLeft: "3px solid #6b3a4a", background: "#f6efe4", marginBottom: 14 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 4 }}>01 — LAST SERVICE</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 20, textTransform: "uppercase" }}>Partial highlights</div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 15, color: "#6b3a4a", marginTop: 2 }}>3 months ago</div>
      </div>
    </IntakeShell>
  ),
};

export const Step8of9: Story = {
  name: "Step 8 of 9 — Booking",
  args: {
    step: 8, total: 9,
    eyebrow: "Chapter VIII · The Date",
    title: "When suits you?",
  },
  render: (args) => (
    <IntakeShell {...args}>
      <div style={{ padding: "14px 18px", background: "#f6efe4", display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "#faddc9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Anton", sans-serif', fontSize: 22, color: "#6b3a4a" }}>N</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 16, textTransform: "uppercase" }}>Nadia Rivera</div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "#9a958e", marginTop: 2 }}>Senior colorist · Lived-in blonde</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#6b3a4a" }}>$180+</div>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 12, color: "#7a8f6b", marginTop: 2 }}>Available Tue 2:00p</div>
        </div>
      </div>
    </IntakeShell>
  ),
};

export const Step9of9: Story = {
  name: "Step 9 of 9 — Confirm",
  args: {
    step: 9, total: 9,
    eyebrow: "You're booked.",
    title: "See you",
    nextLabel: "Done",
    onSkip: undefined,
  },
  render: (args) => (
    <IntakeShell {...args}>
      <div style={{ padding: "24px 24px 26px", background: "#f2b89a" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#4a2431", marginBottom: 10 }}>You're booked.</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 56, textTransform: "uppercase", color: "#6b3a4a" }}>See you<br/><span style={{ color: "#111111" }}>Tuesday.</span></div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 17, color: "#4a2431", marginTop: 12 }}>
          A confirmation and prep notes are on their way.
        </div>
      </div>
    </IntakeShell>
  ),
};

export const Unstyled: Story = {
  args: { step: 1, total: 9, title: "Unstyled" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base shell div)
      </div>
    ),
  ],
};