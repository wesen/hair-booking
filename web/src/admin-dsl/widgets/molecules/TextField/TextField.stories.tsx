/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 122: Added text field stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

function ChangeProbe() {
  const [last, setLast] = useState("No changes yet.");
  return <div><TextField name="label" label="Service label" value="Highlights" onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Molecules/TextField", component: TextField } satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = { args: { name: "label", label: "Service label", value: "Highlights" } };
export const WithHelp: Story = { args: { name: "slug", label: "Public slug", value: "highlights", helpText: "Used in customer-facing booking links." } };
export const WithError: Story = { args: { name: "label", label: "Service label", value: "", required: true, error: "Label is required." } };
export const Disabled: Story = { args: { name: "externalId", label: "External ID", value: "svc_123", disabled: true, helpText: "Locked after import." } };
export const ReadOnly: Story = { args: { name: "createdBy", label: "Created by", value: "Ops admin", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <ChangeProbe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "longLabel", label: "Customer-facing headline shown on the mobile booking form", value: "Dimensional color refresh", helpText: "Keep this short enough for card layouts." } };
