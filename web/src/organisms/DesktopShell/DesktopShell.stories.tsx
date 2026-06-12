import type { Meta, StoryObj } from "@storybook/react";
import { DesktopShell } from "./DesktopShell";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { AccentPanel } from "../../molecules/AccentPanel/AccentPanel";
import { SummaryRow } from "../../molecules/SummaryRow/SummaryRow";
import { Note } from "../../atoms/Note/Note";
import { color, type as typeToken } from "../../fringe-ui/tokens";

const meta: Meta<typeof DesktopShell> = {
  title: "Organisms/DesktopShell",
  component: DesktopShell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DesktopShell>;

function PlaceholderContent({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ padding: "48px 56px" }}>
      <div
        style={{
          ...typeToken.eyebrow,
          color: color.plum,
          marginBottom: 10,
        }}
      >
        Chapter VII · The Quote
      </div>
      <div
        style={{
          ...typeToken.display2,
          fontSize: 76,
          color: color.ink,
          letterSpacing: -1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...typeToken.editorial,
          color: color.softInk,
          maxWidth: 440,
          marginTop: 14,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export const EstimateButter: Story = {
  name: "Estimate — Butter",
  args: { step: 7, total: 9, accent: color.butter, accentInk: color.ink },
  render: (args) => (
    <DesktopShell {...args}>
      <PlaceholderContent
        title="Your estimate."
        subtitle="Based on what you've shared. Final number depends on an in-chair look."
      />
    </DesktopShell>
  ),
};

export const BookingSage: Story = {
  name: "Booking — Sage",
  args: { step: 8, total: 9, accent: color.sage, accentInk: color.paper },
  render: (args) => (
    <DesktopShell {...args}>
      <PlaceholderContent
        title="When suits you?"
        subtitle="Pick a date and time that works. Booking holds with a $50 deposit."
      />
    </DesktopShell>
  ),
};

export const ConfirmButter: Story = {
  name: "Confirm — Butter",
  args: { step: 9, total: 9, accent: color.butter, accentInk: color.ink },
  render: (args) => (
    <DesktopShell {...args}>
      <PlaceholderContent
        title="See you Tuesday."
        subtitle="Your confirmation and prep notes are on their way."
      />
    </DesktopShell>
  ),
};

export const EstimateFull: Story = {
  name: "Full Estimate — Two Column",
  args: { step: 7, total: 9, accent: color.butter, accentInk: color.ink },
  render: (args) => (
    <DesktopShell {...args}>
      <div style={{ padding: "48px 56px" }}>
        <TwoColumnLayout
          leftWidth="1.15fr"
          rightWidth="1fr"
          left={
            <>
              <div style={{ ...typeToken.eyebrow, color: color.plum, marginBottom: 10 }}>Chapter VII · The Quote</div>
              <div style={{ ...typeToken.display2, fontSize: 84, color: color.ink, letterSpacing: -1.5, marginBottom: 8 }}>Your<br />estimate.</div>
              <div style={{ ...typeToken.editorialLg, fontSize: 22, color: color.softInk, maxWidth: 440, marginTop: 14 }}>Based on what you've shared. Final number depends on an in-chair look.</div>
              <div style={{ marginTop: 48, borderTop: `1px solid ${color.rule}` }}>
                <SummaryRow label="Service" value="Partial highlights + cut" onEdit={() => {}} />
                <SummaryRow label="Color level" value="Level 7 → Level 8" onEdit={() => {}} />
                <SummaryRow label="Length" value="Mid-back · no extensions" onEdit={() => {}} />
                <SummaryRow label="Add-ons" value="Olaplex bond treatment · $45" />
              </div>
              <div style={{ marginTop: 32 }}>
                <Note tone="warn">Color corrections or unexpected length may adjust the final quote in-salon.</Note>
              </div>
            </>
          }
          right={
            <AccentPanel accent={color.butter} accentInk={color.ink}>
              <div>
                <div style={{ ...typeToken.eyebrow, color: color.plumDeep }}>ESTIMATED · USD</div>
                <div style={{ ...typeToken.display1, fontSize: 180, color: color.ink, letterSpacing: -6, lineHeight: 0.82, marginTop: 12 }}>$245</div>
                <div style={{ ...typeToken.editorialLg, fontSize: 22, color: color.plumDeep, marginTop: 8 }}>3 hours, 15 minutes.</div>
              </div>
              <div>
                {["LOW $220", "LIKELY $245", "HIGH $285"].map((tier) => {
                  const [label, val] = tier.split(" ");
                  return (
                    <div key={label} style={{ padding: "16px 0", borderTop: `1px solid ${color.ink}`, display: "flex", justifyContent: "space-between" }}>
                      <div style={{ ...typeToken.meta, color: color.ink }}>{label}</div>
                      <div style={{ ...typeToken.h2, color: color.ink }}>{val}</div>
                    </div>
                  );
                })}
              </div>
            </AccentPanel>
          }
        />
      </div>
    </DesktopShell>
  ),
};

export const ServicePlum: Story = {
  name: "Service — Plum",
  args: { step: 1, total: 9, accent: color.plum, accentInk: color.paper },
  render: (args) => (
    <DesktopShell {...args}>
      <PlaceholderContent
        title="What brings you in?"
        subtitle="Pick one to start — you can add more later."
      />
    </DesktopShell>
  ),
};
