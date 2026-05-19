/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 111: Trimmed generated imports while keeping ActivityFeed item/action contracts.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface ActivityFeedItem {
  /** Time label rendered beside the activity item. */
  time: string;
  /** Primary heading rendered by ActivityFeed. */
  title: string;
  /** Optional body copy rendered by ActivityFeed. */
  body?: string;
  /** Optional item-scoped action metadata. */
  action?: ActionViewModel;
}

/** Props for ActivityFeed. */
export interface ActivityFeedProps extends CommonWidgetProps {
  /** Items rendered by ActivityFeed. */
  items: ActivityFeedItem[];
  /** Callback invoked when an item-scoped action is clicked. */
  onItemAction?: (action: ActionViewModel, context: { item: ActivityFeedItem }) => void;
}
