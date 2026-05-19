/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Replaced scaffold diagnostics with field group composition stories.
 * - 2026-05-19 / HAIR-041 Step 134: Added mobile field group layout story from the Storybook coverage manifest.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { FieldGroup } from "./FieldGroup";
const meta = { title: "Admin DSL Widgets/Molecules/FieldGroup", component: FieldGroup } satisfies Meta<typeof FieldGroup>;
export default meta;
type Story = StoryObj;
export const Default: Story = { render: () => <FieldGroup title="Identity"><label>Label <input defaultValue="Highlights" /></label></FieldGroup> };
export const MultipleFields: Story = { render: () => <FieldGroup title="Service details"><label>Name <input defaultValue="Gloss" /></label><label>Duration <input defaultValue="45" /></label></FieldGroup> };
export const LongTitle: Story = { render: () => <FieldGroup title="Publishing rules and customer-facing appointment availability"><label><input type="checkbox" /> Require admin review</label></FieldGroup> };
export const MobileFieldGroup: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <FieldGroup title="Mobile publishing rules and appointment availability"><label style={{ display: "grid", gap: 6 }}>Name <input defaultValue="Color refresh" /></label><label style={{ display: "grid", gap: 6 }}>Duration <input defaultValue="90 minutes" /></label></FieldGroup> };
