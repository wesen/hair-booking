/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 117: Replaced scaffold diagnostics with save states and primary-action callback probe.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SaveBar } from "./SaveBar";
const action = { type: "submit", target: "save.publish", label: "Publish", intent: "primary", placement: "formFooter" as const };
function Probe() { const [last, setLast] = useState("No save action clicked yet."); return <div><SaveBar status="Unsaved changes" primaryAction={action} onPrimaryAction={(clicked, context) => setLast(`${clicked.target}:${context.status}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/SaveBar", component: SaveBar } satisfies Meta<typeof SaveBar>;
export default meta;
type Story = StoryObj;
export const Ready: Story = { render: () => <SaveBar status="Ready" /> };
export const UnsavedChanges: Story = { render: () => <SaveBar status="Unsaved changes" /> };
export const Saving: Story = { render: () => <SaveBar status="Saving…" /> };
export const PrimaryAction: Story = { render: () => <Probe /> };
export const MobileStacked: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <SaveBar status="Unsaved changes" primaryAction={action} /> };
