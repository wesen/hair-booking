/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to the real Panel chrome extracted from render.tsx.
 * - 2026-05-18 / HAIR-041 Step 79: Delegated toolbar/footer actions to ActionGroup and reused shared design helpers.
 */
import { ActionGroup } from "../../molecules/ActionGroup";
import { adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { panelWidgetMetadata } from "./Panel.metadata";
import type { PanelProps } from "./Panel.types";

function densityPadding(density: PanelProps["density"], normal = 18) {
  if (density === "compact") return Math.max(12, normal - 4);
  if (density === "spacious") return normal + 6;
  return normal;
}

export function Panel({
  id,
  className,
  style,
  dataAttributes,
  density = "normal",
  title,
  subtitle,
  eyebrow,
  body,
  padding = "normal",
  toolbarActions = [],
  footerActions = [],
  children,
  onToolbarAction,
  onFooterAction,
}: PanelProps) {
  const panelPadding = padding === "none" ? 0 : densityPadding(density, 18);
  const hasHeader = Boolean(title || subtitle || eyebrow || toolbarActions.length);
  const hasFooter = footerActions.length > 0;
  const dataAttrs = dataAttrsFromRecord(dataAttributes);

  return (
    <article
      id={id}
      className={["adminDslPanel", className].filter(Boolean).join(" ") || undefined}
      data-admin-dsl-density={density}
      style={{ ...adminSurfaceStyle, overflow: "hidden", ...style }}
      {...widgetDataAttributes(panelWidgetMetadata.widgetId, panelWidgetMetadata.classification.level)}
      {...dataAttrs}
    >
      {hasHeader ? (
        <div
          className="adminDslPanelHeader"
          style={{
            display: "grid",
            gridTemplateColumns: toolbarActions.length ? "minmax(0, 1fr) auto" : "1fr",
            gap: 12,
            alignItems: "start",
            padding: densityPadding(density, 16),
            borderBottom: `1px solid ${adminTokens.borders.soft}`,
          }}
        >
          <div>
            {eyebrow ? <div style={{ ...adminTextStyle("eyebrow"), marginBottom: 4 }}>{eyebrow}</div> : null}
            {title ? <h3 style={{ ...adminTextStyle("panelTitle"), margin: 0 }}>{title}</h3> : null}
            {subtitle ? <p style={{ ...adminTextStyle("bodyMuted"), color: adminTokens.text.muted, margin: "6px 0 0" }}>{subtitle}</p> : null}
          </div>
          <ActionGroup actions={toolbarActions} slot="panelToolbar" align="end" context={{ panelId: id }} onAction={onToolbarAction} />
        </div>
      ) : null}
      {body ? <p style={{ ...adminTextStyle("body"), color: adminTokens.text.muted, margin: 0, padding: panelPadding }}>{body}</p> : null}
      {children ? (
        <div className="adminDslPanelBody" style={{ padding: panelPadding, display: "grid", gap: density === "compact" ? 10 : 14 }}>
          {children}
        </div>
      ) : null}
      {hasFooter ? (
        <div className="adminDslPanelFooter" style={{ borderTop: `1px solid ${adminTokens.borders.soft}`, padding: densityPadding(density, 14) }}>
          <ActionGroup actions={footerActions} slot="panelFooter" context={{ panelId: id }} onAction={onFooterAction} />
        </div>
      ) : null}
    </article>
  );
}
