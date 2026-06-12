/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Replaced scaffold diagnostics with iframe, placeholder, action-probe, tall, and mobile previews.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PreviewFrame } from "./PreviewFrame";

const meta = { title: "Admin DSL Widgets/Organisms/PreviewFrame", component: PreviewFrame } satisfies Meta<typeof PreviewFrame>;
export default meta;
type Story = StoryObj;

export const IframeConnected: Story = { render: () => <PreviewFrame previewId="customer-preview" title="Customer preview" body="Live route embedded from the admin preview endpoint." url="/" height={320} /> };
export const Placeholder: Story = { render: () => <PreviewFrame previewId="draft-preview" title="Draft preview" placeholder="Publish a draft to enable preview." height={260} /> };
export const WithBodyAndActions: Story = { render: () => { const [last, setLast] = useState("No preview action clicked yet."); return <div><PreviewFrame previewId="customer-preview" title="Customer preview" body="Open the preview in a separate tab for full-page review." url="/" actions={[{ type: "open", target: "preview.open", label: "Open preview", placement: "panelFooter" }]} onAction={(action, context) => setLast(`${action.target}:${context.previewId}:${context.url || "no-url"}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; } };
export const TallPreview: Story = { render: () => <PreviewFrame previewId="long-preview" title="Long form preview" body="A taller embedded frame for full intake review." url="/" height={620} /> };
export const MobilePreview: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <PreviewFrame previewId="mobile-preview" title="Mobile preview" body="Narrow Storybook viewport." placeholder="No mobile route connected." height={420} /> };
