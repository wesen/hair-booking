/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added TimeField stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeField } from "./TimeField";
function Probe() { const [last, setLast] = useState("No changes yet."); return <div><TimeField name="field" label="Time" value="14:30" onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/TimeField", component: TimeField } satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof TimeField>;
export const Default: Story = { args: { name: "field", label: "Time", value: "14:30" } };
export const WithHelp: Story = { args: { name: "field", label: "Time", value: "14:30", helpText: "Helper copy explains how admins should fill this field." } };
export const WithError: Story = { args: { name: "field", label: "Time", value: "", required: true, error: "This field is required." } };
export const Disabled: Story = { args: { name: "field", label: "Time", value: "14:30", disabled: true } };
export const ReadOnly: Story = { args: { name: "field", label: "Time", value: "14:30", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <Probe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileField", label: "Long mobile time field label", value: "14:30", helpText: "Mobile layout remains touch-friendly." } };
