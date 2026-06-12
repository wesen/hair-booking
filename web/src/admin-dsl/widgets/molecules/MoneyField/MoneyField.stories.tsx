/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 127: Added MoneyField stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MoneyField } from "./MoneyField";
function Probe() { const [last, setLast] = useState("No changes yet."); return <div><MoneyField name="field" label="Money" value="45" onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/MoneyField", component: MoneyField } satisfies Meta<typeof MoneyField>;
export default meta;
type Story = StoryObj<typeof MoneyField>;
export const Default: Story = { args: { name: "field", label: "Money", value: "125" } };
export const WithHelp: Story = { args: { name: "field", label: "Money", value: "125", helpText: "Helper copy explains how admins should fill this field." } };
export const WithError: Story = { args: { name: "field", label: "Money", value: "", required: true, error: "This field is required." } };
export const Disabled: Story = { args: { name: "field", label: "Money", value: "125", disabled: true } };
export const ReadOnly: Story = { args: { name: "field", label: "Money", value: "125", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <Probe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileField", label: "Long mobile money field label", value: "125", helpText: "Mobile layout remains touch-friendly." } };
