/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Trimmed generated imports and typed block action context.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";
import type { CalendarEventBlockProps } from "../../molecules/CalendarEventBlock/CalendarEventBlock.types";

export interface CalendarWeekProps extends CommonWidgetProps {
  calendarId: string;
  days: string[];
  hours: string[];
  blocks: CalendarEventBlockProps[];
  onBlockAction?: (action: ActionViewModel, context: { block: CalendarEventBlockProps }) => void;
}
