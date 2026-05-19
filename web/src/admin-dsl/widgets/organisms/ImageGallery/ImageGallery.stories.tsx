/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Replaced scaffold diagnostics with photo, missing-media, empty, callback-probe, and mobile stories.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ImageGallery } from "./ImageGallery";
import type { GalleryImage } from "./ImageGallery.types";

const images: GalleryImage[] = [
  { id: "front", title: "Front reference", subtitle: "Client upload", status: "Uploaded", tone: "success" },
  { id: "side", title: "Side profile", subtitle: "Missing upload", status: "Missing", tone: "danger" },
  { id: "inspo", title: "Inspiration", subtitle: "Color target", status: "Reference", tone: "neutral" },
];

function Probe() {
  const [last, setLast] = useState("No image action clicked yet.");
  return <div><ImageGallery galleryId="request-photos" images={images} imageAction={{ type: "open", target: "photo.open", label: "Open", placement: "detail" }} onImageAction={(action, context) => setLast(`${action.target}:${context.galleryId}:${context.image.id}`)} /><output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output></div>;
}

const meta = { title: "Admin DSL Widgets/Organisms/ImageGallery", component: ImageGallery } satisfies Meta<typeof ImageGallery>;
export default meta;
type Story = StoryObj;

export const DefaultPhotos: Story = { render: () => <ImageGallery galleryId="request-photos" images={images.slice(0, 2)} /> };
export const MissingPhoto: Story = { render: () => <ImageGallery galleryId="request-photos" images={[images[1]]} /> };
export const EmptyGallery: Story = { render: () => <ImageGallery galleryId="request-photos" images={[]} emptyText="No references uploaded yet." /> };
export const ClickableImages: Story = { render: () => <Probe /> };
export const MobileGrid: Story = { parameters: { viewport: { defaultViewport: "mobile1" } }, render: () => <ImageGallery galleryId="request-photos" images={images} /> };
