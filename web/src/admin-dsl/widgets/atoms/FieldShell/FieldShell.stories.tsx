/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 121: Added shared field chrome stories for default/help/error/disabled/mobile states.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { FieldShell } from "./FieldShell";

const inputStyle = { border: "1px solid #dfd2bd", borderRadius: 12, padding: "10px 12px", font: "inherit" };
const meta = { title: "Admin DSL Widgets/Atoms/FieldShell", component: FieldShell } satisfies Meta<typeof FieldShell>;
export default meta;
type Story = StoryObj<typeof FieldShell>;

export const Default: Story = { args: { label: "Service label", name: "label", controlId: "field-label", children: <input id="field-label" style={inputStyle} defaultValue="Highlights" /> } };
export const WithHelp: Story = { args: { label: "Duration", name: "duration", controlId: "field-duration", helpText: "Shown to customers before checkout.", children: <input id="field-duration" style={inputStyle} defaultValue="45 minutes" /> } };
export const WithError: Story = { args: { label: "Price", name: "price", controlId: "field-price", error: "Price must be greater than zero.", required: true, children: <input id="field-price" aria-invalid style={inputStyle} defaultValue="0" /> } };
export const Disabled: Story = { args: { label: "Published slug", name: "slug", controlId: "field-slug", disabled: true, helpText: "Generated after the first publish.", children: <input id="field-slug" style={inputStyle} defaultValue="highlights" disabled /> } };
export const ReadOnly: Story = { args: { label: "Last synced", name: "synced", controlId: "field-synced", readOnly: true, children: <input id="field-synced" style={inputStyle} defaultValue="2026-05-19 09:30" readOnly /> } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { label: "Long mobile label for customer-facing service description", name: "description", controlId: "field-description", helpText: "The field shell keeps helper copy under the control on narrow screens.", children: <textarea id="field-description" style={{ ...inputStyle, minHeight: 96 }} defaultValue="Balayage consultation and tone refresh." /> } };
