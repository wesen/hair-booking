/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to search form extracted from render.tsx with shared action button styling.
 * - 2026-05-19 / HAIR-041 Step 87: Replaced raw token usage with generated adminTokens/adminTextStyle helpers.
 */
import { actionButtonStyle, adminSurfaceStyle, adminTextStyle, adminTokens, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
import { searchBoxWidgetMetadata } from "./SearchBox.metadata";
import type { SearchBoxProps } from "./SearchBox.types";

export function SearchBox({ id, className, style, dataAttributes, label = "Search", placeholder = "Search", value, action, onSearch }: SearchBoxProps) {
  return (
    <form
      id={id}
      role="search"
      className={["adminDslSearchBox", className].filter(Boolean).join(" ") || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        const query = String(new FormData(event.currentTarget).get("search") || "");
        onSearch?.(action, { query });
      }}
      style={{ ...adminSurfaceStyle, padding: 12, display: "flex", alignItems: "center", gap: 10, color: adminTokens.text.muted, ...style }}
      {...widgetDataAttributes(searchBoxWidgetMetadata.widgetId, searchBoxWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <input name="search" defaultValue={value} placeholder={placeholder} aria-label={label} style={{ flex: 1, minHeight: 38, border: "none", outline: "none", background: "transparent", ...adminTextStyle("body") }} />
      {action ? <button type="submit" className="adminDslActionButton" style={actionButtonStyle({ variant: "solid", size: "sm" })}>{action.label || "Search"}</button> : null}
    </form>
  );
}
