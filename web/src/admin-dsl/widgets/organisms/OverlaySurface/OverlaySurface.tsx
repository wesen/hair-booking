/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 128: Replaced scaffold diagnostics with typed overlay surface implementation.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { overlaySurfaceWidgetMetadata } from "./OverlaySurface.metadata";
import type { OverlaySurfaceProps } from "./OverlaySurface.types";

function kindLabel(kind: string) {
  return kind === "detailPanel" ? "Detail" : kind === "inlinePanel" ? "Inline" : kind === "drawer" ? "Drawer" : kind === "sheet" ? "Sheet" : "Modal";
}

export function OverlaySurface({ id, className, style, dataAttributes, surfaceId, kind, title, open = false, children, closeAction, footerActions = [], onCloseAction, onFooterAction }: OverlaySurfaceProps) {
  const drawerLike = kind === "drawer" || kind === "sheet" || kind === "detailPanel";
  const context = { surfaceId, kind };
  return (
    <aside
      id={id || surfaceId}
      role={kind === "inlinePanel" ? "region" : "dialog"}
      aria-modal={kind === "modal" || kind === "drawer" || kind === "sheet" ? true : undefined}
      aria-labelledby={`${surfaceId}-title`}
      className={["adminDslOverlaySurface", `adminDslSurface-${kind}`, drawerLike ? "adminDslDrawerSurface" : "adminDslModalSurface", className].filter(Boolean).join(" ")}
      style={{
        border: `1px ${open ? "solid" : "dashed"} ${adminTokens.borders.default}`,
        borderRadius: adminTokens.radii.panel,
        background: drawerLike ? adminTokens.surfaces.muted : adminTokens.surfaces.panel,
        padding: 18,
        boxShadow: kind === "modal" || kind === "drawer" ? "0 18px 48px color-mix(in srgb, currentColor 16%, transparent)" : undefined,
        display: "grid",
        gap: 14,
        ...style,
      }}
      {...widgetDataAttributes(overlaySurfaceWidgetMetadata.widgetId, overlaySurfaceWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord({ surface: surfaceId, kind, open: open ? "true" : "false", ...dataAttributes })}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <div className="adminDslSurfaceKicker" style={{ ...adminTextStyle("eyebrow") }}>{kindLabel(kind)}</div>
          <h3 id={`${surfaceId}-title`} style={{ ...adminTextStyle("panelTitle"), margin: "8px 0 0" }}>{title}</h3>
        </div>
        {closeAction ? <ActionGroup actions={[closeAction]} slot="toolbar" context={context} onAction={(action) => onCloseAction?.(action, context)} /> : null}
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
      {footerActions.length ? <footer style={{ borderTop: `1px solid ${adminTokens.borders.default}`, paddingTop: 12 }}><ActionGroup actions={footerActions} slot="formFooter" context={context} onAction={(action) => onFooterAction?.(action, context)} /></footer> : null}
    </aside>
  );
}
