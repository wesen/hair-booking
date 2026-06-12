/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added DateField stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateField } from "./DateField";
function Probe() { const [last, setLast] = useState("No changes yet."); return <div><DateField name="field" label="Date" value="2026-05-19" onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/DateField", component: DateField } satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof DateField>;
export const Default: Story = { args: { name: "field", label: "Date", value: "2026-05-19" } };
export const WithHelp: Story = { args: { name: "field", label: "Date", value: "2026-05-19", helpText: "Helper copy explains how admins should fill this field." } };
export const WithError: Story = { args: { name: "field", label: "Date", value: "", required: true, error: "This field is required." } };
export const Disabled: Story = { args: { name: "field", label: "Date", value: "2026-05-19", disabled: true } };
export const ReadOnly: Story = { args: { name: "field", label: "Date", value: "2026-05-19", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <Probe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileField", label: "Long mobile date field label", value: "2026-05-19", helpText: "Mobile layout remains touch-friendly." } };
