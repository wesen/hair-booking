/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to responsive split-pane layout extracted from render.tsx.
 */
import { dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { splitPaneWidgetMetadata } from "./SplitPane.metadata";
import type { SplitPaneProps } from "./SplitPane.types";

const splitPaneCss = `
  @media (max-width: 760px) {
    .adminDslSplitPane { grid-template-columns: 1fr !important; }
  }
`;

export function SplitPane({ id, className, style, dataAttributes, leftWidth = "minmax(260px, 0.85fr)", rightWidth = "minmax(320px, 1.15fr)", gap = 16, children }: SplitPaneProps) {
  return (
    <div
      id={id}
      className={["adminDslSplitPane", className].filter(Boolean).join(" ") || undefined}
      style={{ display: "grid", gridTemplateColumns: `${leftWidth} ${rightWidth}`, gap, alignItems: "start", ...style }}
      {...widgetDataAttributes(splitPaneWidgetMetadata.widgetId, splitPaneWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <style>{splitPaneCss}</style>
      {children}
    </div>
  );
}
