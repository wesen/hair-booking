/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 123: Added textarea stories for default/help/error/disabled/read-only/mobile/change probe states.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TextareaField } from "./TextareaField";

function ChangeProbe() {
  const [last, setLast] = useState("No changes yet.");
  return <div><TextareaField name="description" label="Service description" value="Dimensional color refresh." onValueChange={(value) => setLast(value)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd", whiteSpace: "pre-wrap" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Molecules/TextareaField", component: TextareaField } satisfies Meta<typeof TextareaField>;
export default meta;
type Story = StoryObj<typeof TextareaField>;

export const Default: Story = { args: { name: "description", label: "Service description", value: "Gloss, trim, and styling guidance.", rows: 4 } };
export const WithHelp: Story = { args: { name: "notes", label: "Internal notes", value: "Client prefers low-maintenance color.", helpText: "Visible only to salon staff.", rows: 5 } };
export const WithError: Story = { args: { name: "description", label: "Service description", value: "", required: true, error: "Description is required before publishing.", rows: 3 } };
export const Disabled: Story = { args: { name: "importedDescription", label: "Imported description", value: "Managed by the catalog import.", disabled: true, helpText: "Unlock by disconnecting the import source." } };
export const ReadOnly: Story = { args: { name: "lastPublishedCopy", label: "Last published copy", value: "Consultation required before booking.", readOnly: true } };
export const ChangeCallbackProbe: Story = { render: () => <ChangeProbe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileDescription", label: "Long customer-facing description for mobile booking cards", value: "A consultation-friendly service description that wraps across multiple mobile lines.", helpText: "Use concise language for mobile booking.", rows: 6 } };
