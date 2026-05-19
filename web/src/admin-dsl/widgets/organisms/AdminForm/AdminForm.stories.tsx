/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Replaced scaffold diagnostics with lifecycle, error, nested, and action-probe stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AdminForm } from "./AdminForm";
import { FieldGroup } from "../../molecules/FieldGroup";

const fields = <FieldGroup title="Identity"><label style={{ display: "grid", gap: 6 }}>Label<input name="label" defaultValue="Highlights" /></label></FieldGroup>;
const actions = [{ type: "submit", target: "form.save", label: "Save", intent: "primary", placement: "formFooter" as const }, { type: "cancel", target: "form.cancel", label: "Cancel", placement: "formFooter" as const }];
function Probe() { const [last, setLast] = useState("No form action clicked yet."); return <div><AdminForm formId="service-form" title="Service config" dirty actions={actions} onFormAction={(action, context) => setLast(`${action.target}:${context.formId}:${Object.keys(context.values).join(",") || "no-values"}`)}>{fields}</AdminForm><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Organisms/AdminForm", component: AdminForm } satisfies Meta<typeof AdminForm>;
export default meta;
type Story = StoryObj;
export const Default: Story = { render: () => <AdminForm formId="service-form" title="Service config">{fields}</AdminForm> };
export const DirtyState: Story = { render: () => <AdminForm formId="service-form" title="Service config" dirty>{fields}</AdminForm> };
export const PendingState: Story = { render: () => <AdminForm formId="service-form" title="Service config" pending>{fields}</AdminForm> };
export const SuccessState: Story = { render: () => <AdminForm formId="service-form" title="Service config" state="success">{fields}</AdminForm> };
export const WithErrors: Story = { render: () => <AdminForm formId="service-form" title="Service config" state="error" errors={{ label: "Label is required" }}>{fields}</AdminForm> };
export const SubmitActions: Story = { render: () => <Probe /> };
export const NestedFieldGroups: Story = { render: () => <AdminForm formId="nested" title="Nested groups"><FieldGroup title="Identity">{fields}</FieldGroup><FieldGroup title="Publishing"><label><input type="checkbox" name="published" /> Published</label></FieldGroup></AdminForm> };
