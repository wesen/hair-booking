import type { Meta, StoryObj } from "@storybook/react";
import { AccentPanel } from "./AccentPanel";
import { color, type as typeToken } from "../../fringe-ui/tokens";

const meta: Meta<typeof AccentPanel> = {
  title: "Molecules/AccentPanel",
  component: AccentPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AccentPanel>;

export const ButterPanel: Story = {
  name: "Butter — Estimate",
  args: { accent: color.butter, accentInk: color.ink },
  render: (args) => (
    <AccentPanel {...args}>
      <div>
        <div style={{ ...typeToken.eyebrow, color: color.plumDeep, marginBottom: 12 }}>
          ESTIMATED · USD
        </div>
        <div style={{ ...typeToken.display1, fontSize: 160, color: color.ink, letterSpacing: -6, lineHeight: 0.82, marginTop: 12 }}>
          $245
        </div>
        <div style={{ ...typeToken.editorialLg, color: color.plumDeep, marginTop: 8 }}>
          3 hours, 15 minutes.
        </div>
      </div>
      <div>
        <div style={{ padding: "16px 0", borderTop: `1px solid ${color.ink}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...typeToken.meta, color: color.ink }}>LOW</div>
          <div style={{ ...typeToken.h2, color: color.ink }}>$220</div>
        </div>
        <div style={{ padding: "16px 0", borderTop: `1px solid ${color.ink}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...typeToken.meta, color: color.ink }}>LIKELY</div>
          <div style={{ ...typeToken.h2, color: color.ink }}>$245</div>
        </div>
        <div style={{ padding: "16px 0", borderTop: `1px solid ${color.ink}`, borderBottom: `1px solid ${color.ink}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...typeToken.meta, color: color.ink }}>HIGH</div>
          <div style={{ ...typeToken.h2, color: color.ink }}>$285</div>
        </div>
      </div>
    </AccentPanel>
  ),
};

export const SagePanel: Story = {
  name: "Sage — Stylist",
  args: { accent: color.sage, accentInk: color.paper },
  render: (args) => (
    <AccentPanel {...args}>
      <div>
        <div style={{ ...typeToken.eyebrow, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
          YOUR STYLIST
        </div>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: color.paper, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", ...typeToken.display3, fontSize: 32, color: args.accent }}>
          N
        </div>
        <div style={{ ...typeToken.h2, color: color.paper, fontSize: 28 }}>Nadia Rivera</div>
        <div style={{ ...typeToken.editorial, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
          Senior colorist · lived-in blonde
        </div>
      </div>
    </AccentPanel>
  ),
};
