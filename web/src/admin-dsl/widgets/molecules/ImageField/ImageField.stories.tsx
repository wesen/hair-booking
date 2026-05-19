/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Added image field empty/filled/error/disabled/read-only/mobile/action stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ImageField } from "./ImageField";
const action = { type: "open", target: "image.choose", label: "Choose image", placement: "formFooter" as const };
function Probe() { const [last, setLast] = useState("No image action yet."); return <div><ImageField name="hero" label="Hero image" action={action} onFieldAction={(a, ctx) => setLast(`${a.target}:${ctx.name}:${ctx.src || "empty"}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>; }
const meta = { title: "Admin DSL Widgets/Molecules/ImageField", component: ImageField } satisfies Meta<typeof ImageField>;
export default meta;
type Story = StoryObj<typeof ImageField>;
export const Empty: Story = { args: { name: "hero", label: "Hero image", placeholder: "Drop or choose a salon photo", action } };
export const Filled: Story = { args: { name: "hero", label: "Hero image", src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900", alt: "Salon chair", action } };
export const WithError: Story = { args: { name: "hero", label: "Hero image", error: "Choose an image before publishing.", required: true, action } };
export const Disabled: Story = { args: { name: "hero", label: "Hero image", disabled: true, placeholder: "Image selection disabled", action } };
export const ReadOnly: Story = { args: { name: "hero", label: "Hero image", readOnly: true, src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900", alt: "Hair styling" } };
export const ActionCallbackProbe: Story = { render: () => <Probe /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, args: { name: "mobileHero", label: "Long mobile image field label", placeholder: "No image selected", helpText: "Image field remains usable on narrow screens.", action } };
