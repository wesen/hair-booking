/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Trimmed generated imports and typed calendar event action context.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface CalendarEventBlockProps extends CommonWidgetProps {
  id: string;
  kind: "appointment" | "availability" | "timeOff";
  clientName?: string;
  title?: string;
  service?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  column?: number;
  row?: number;
  span?: number;
  action?: ActionViewModel;
  onAction?: (action: ActionViewModel, context: { blockId: string }) => void;
}
