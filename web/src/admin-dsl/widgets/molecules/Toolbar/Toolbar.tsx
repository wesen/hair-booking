/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to a thin ActionGroup wrapper for toolbar actions.
 */
import { ActionGroup } from "../ActionGroup";
import { dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { toolbarWidgetMetadata } from "./Toolbar.metadata";
import type { ToolbarProps } from "./Toolbar.types";

export function Toolbar({ id, className, style, dataAttributes, actions, onAction }: ToolbarProps) {
  return (
    <div
      id={id}
      className={["adminDslToolbar", className].filter(Boolean).join(" ") || undefined}
      style={{ marginBottom: 22, ...style }}
      {...widgetDataAttributes(toolbarWidgetMetadata.widgetId, toolbarWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <ActionGroup actions={actions} slot="toolbar" context={{ pageId: id }} onAction={onAction} />
    </div>
  );
}
