/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Replaced scaffold diagnostics with empty-state variants and callback probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import type { ActionViewModel } from "../../shared";

const createAction: ActionViewModel = { type: "open", target: "requests.new", label: "Create request", intent: "primary", placement: "detail" };

function Probe() {
  const [last, setLast] = useState("No empty-state action clicked yet.");
  return <div style={{ padding: 24, maxWidth: 720 }}><EmptyState title="No matching requests" body="Clear filters or create a new intake request." action={createAction} onAction={(action, context) => setLast(`${action.target}:${context.source}:${context.title}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Molecules/EmptyState", component: EmptyState } satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj;

export const Default: Story = { args: { title: "Nothing here yet", body: "New intake requests will appear here." } };
export const WithAction: Story = { render: () => <Probe /> };
export const ShortCopy: Story = { args: { title: "No drafts" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { title: "No photos", body: "Ask the client to upload references." } };
