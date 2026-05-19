/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 126: Added switch stories for on/off/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SwitchField } from "./SwitchField";

function ChangeProbe() {
  const [last, setLast] = useState("No toggle yet.");
  return <div><SwitchField name="published" label="Published online" checked onValueChange={(checked) => setLast(checked ? "on" : "off")} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Molecules/SwitchField", component: SwitchField } satisfies Meta<typeof SwitchField>;
export default meta;
type Story = StoryObj<typeof SwitchField>;

export const On: Story = { args: { name: "published", label: "Published online", checked: true } };
export const Off: Story = { args: { name: "requiresConsultation", label: "Requires consultation", checked: false } };
export const WithHelp: Story = { args: { name: "bookable", label: "Bookable by customers", checked: true, helpText: "Turn off to keep this service staff-only." } };
export const WithError: Story = { args: { name: "accepted", label: "Accept policy", checked: false, required: true, error: "This confirmation is required." } };
export const Disabled: Story = { args: { name: "synced", label: "Synced from catalog", checked: true, disabled: true, helpText: "Managed by the connected catalog." } };
export const ReadOnly: Story = { args: { name: "locked", label: "Locked after publish", checked: true, readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <ChangeProbe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileBookable", label: "Long mobile toggle label for online booking availability", checked: false, helpText: "Mobile admins can still see the current on/off state clearly." } };
