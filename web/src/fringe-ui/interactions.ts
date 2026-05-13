import type { ReactNode } from "react";

export type InteractionSource = "pointer" | "keyboard" | "programmatic";

export type SelectionAction = "select" | "deselect" | "toggle" | "clear" | "edit" | "upload" | "remove";

export interface SelectionChangeMeta<TValue extends string = string, TItem = unknown> {
  value?: TValue;
  label?: ReactNode;
  item?: TItem;
  action: SelectionAction;
  source: InteractionSource;
  previousValue?: TValue | TValue[] | number | null;
}
