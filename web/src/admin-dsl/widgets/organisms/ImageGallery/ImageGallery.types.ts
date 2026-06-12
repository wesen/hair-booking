/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 113: Trimmed generated imports while keeping image action context contract.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface GalleryImage {
  id?: string;
  slot?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  tone?: string;
  url?: string;
  alt?: string;
}

export interface ImageGalleryProps extends CommonWidgetProps {
  galleryId: string;
  images: GalleryImage[];
  emptyText?: string;
  imageAction?: ActionViewModel;
  onImageAction?: (action: ActionViewModel, context: { galleryId: string; image: GalleryImage }) => void;
}
