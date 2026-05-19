/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Added overlay surface modal/drawer/sheet/detail/inline/footer/mobile/callback stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverlaySurface } from "./OverlaySurface";
const close = { type: "close", target: "surface.close", label: "Close", placement: "toolbar" as const };
const save = { type: "submit", target: "surface.save", label: "Save", intent: "primary", placement: "formFooter" as const };
function Body() { return <p style={{ margin: 0 }}>Surface content with form preview and operational details.</p>; }
function Probe() { const [last, setLast] = useState("No surface action yet."); return <div><OverlaySurface surfaceId="drawer" kind="drawer" title="Edit service" open closeAction={close} footerActions={[save]} onCloseAction={(a,c)=>setLast(`${a.target}:${c.kind}`)} onFooterAction={(a,c)=>setLast(`${a.target}:${c.surfaceId}`)}><Body /></OverlaySurface><output style={{ display:"block", marginTop:12, padding:10, border:"1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Organisms/OverlaySurface", component: OverlaySurface } satisfies Meta<typeof OverlaySurface>;
export default meta;
type Story = StoryObj<typeof OverlaySurface>;
export const Modal: Story = { render: () => <OverlaySurface surfaceId="modal" kind="modal" title="Modal review" open><Body /></OverlaySurface> };
export const Drawer: Story = { render: () => <OverlaySurface surfaceId="drawer" kind="drawer" title="Drawer editor" open><Body /></OverlaySurface> };
export const Sheet: Story = { render: () => <OverlaySurface surfaceId="sheet" kind="sheet" title="Bottom sheet" open><Body /></OverlaySurface> };
export const DetailPanel: Story = { render: () => <OverlaySurface surfaceId="detail" kind="detailPanel" title="Request detail" open><Body /></OverlaySurface> };
export const InlinePanel: Story = { render: () => <OverlaySurface surfaceId="inline" kind="inlinePanel" title="Inline panel"><Body /></OverlaySurface> };
export const ClosedDashedPreview: Story = { render: () => <OverlaySurface surfaceId="closed" kind="modal" title="Closed preview"><Body /></OverlaySurface> };
export const WithFooterActions: Story = { render: () => <Probe /> };
export const MobileSurface: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <OverlaySurface surfaceId="mobile" kind="drawer" title="Mobile surface" open closeAction={close} footerActions={[save]}><Body /></OverlaySurface> };
