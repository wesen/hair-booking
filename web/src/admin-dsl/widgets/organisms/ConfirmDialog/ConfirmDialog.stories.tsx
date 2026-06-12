/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Added confirm dialog neutral/danger/long-body/cancel/callback stories.
 * - 2026-05-19 / HAIR-041 Step 134: Added mobile destructive confirm story from the Storybook coverage manifest.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog } from "./ConfirmDialog";
const cancel = { type: "cancel", target: "dialog.cancel", label: "Cancel", placement: "formFooter" as const };
const remove = { type: "delete", target: "service.delete", label: "Delete", intent: "danger", placement: "formFooter" as const };
function Probe() { const [last, setLast] = useState("No dialog action yet."); return <div><ConfirmDialog dialogId="delete" title="Delete service?" body="This cannot be undone." tone="danger" confirmAction={remove} cancelAction={cancel} onConfirm={(a,c)=>setLast(`${a.target}:${c.dialogId}`)} onCancel={(a,c)=>setLast(`${a.target}:${c.dialogId}`)} /><output style={{ display:"block", marginTop:12, padding:10, border:"1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Organisms/ConfirmDialog", component: ConfirmDialog } satisfies Meta<typeof ConfirmDialog>;
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;
export const Default: Story = { args: { dialogId: "confirm", title: "Publish changes?", body: "Customers will see the updated service." } };
export const Danger: Story = { args: { dialogId: "delete", title: "Delete service?", body: "This cannot be undone.", tone: "danger", confirmAction: remove } };
export const LongBody: Story = { args: { dialogId: "long", title: "Replace booking rules?", body: "This updates duration, price, visibility, and all downstream booking availability windows. Existing appointments remain unchanged." } };
export const WithCancel: Story = { args: { dialogId: "cancel", title: "Discard draft?", body: "Unsaved edits will be lost.", cancelAction: cancel } };
export const DispatchConfirm: Story = { render: () => <Probe /> };
export const MobileDialog: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { dialogId: "mobile-delete", title: "Delete service on mobile?", body: "This destructive confirmation must remain readable and easy to cancel on narrow screens.", tone: "danger", confirmAction: remove, cancelAction: cancel } };
