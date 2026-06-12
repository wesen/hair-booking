/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added DurationField stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DurationField } from "./DurationField";
function Probe() { const [last, setLast] = useState("No changes yet."); return <div><DurationField name="field" label="Duration" value="45" onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/DurationField", component: DurationField } satisfies Meta<typeof DurationField>;
export default meta;
type Story = StoryObj<typeof DurationField>;
export const Default: Story = { args: { name: "field", label: "Duration", value: "45" } };
export const WithHelp: Story = { args: { name: "field", label: "Duration", value: "45", helpText: "Helper copy explains how admins should fill this field." } };
export const WithError: Story = { args: { name: "field", label: "Duration", value: "", required: true, error: "This field is required." } };
export const Disabled: Story = { args: { name: "field", label: "Duration", value: "45", disabled: true } };
export const ReadOnly: Story = { args: { name: "field", label: "Duration", value: "45", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <Probe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileField", label: "Long mobile duration field label", value: "45", helpText: "Mobile layout remains touch-friendly." } };
