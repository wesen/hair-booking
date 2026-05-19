/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 115: Trimmed generated imports and typed month/select action contexts.
 */
import type { ActionViewModel, CommonWidgetProps } from "../../shared/types";

export interface MonthCalendarMarker { date: string; kind: string; tone?: "success" | "warning" | "danger" | "neutral"; }
export interface MonthCalendarLegendItem { kind: string; label: string; tone?: "success" | "warning" | "danger" | "neutral"; }
export interface MonthCalendarCell { date: string; day: number; inMonth: boolean; }

export interface MonthCalendarProps extends CommonWidgetProps {
  calendarId: string;
  month: string;
  label?: string;
  selectedDate?: string;
  markers?: MonthCalendarMarker[];
  legend?: MonthCalendarLegendItem[];
  previousMonthAction?: ActionViewModel;
  nextMonthAction?: ActionViewModel;
  selectDateAction?: ActionViewModel;
  onMonthAction?: (action: ActionViewModel, context: { calendarId: string; month: string; direction: "previous" | "next" }) => void;
  onSelectDate?: (action: ActionViewModel, context: { calendarId: string; date: string }) => void;
}
