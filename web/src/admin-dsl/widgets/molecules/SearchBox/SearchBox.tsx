/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 79: Promoted scaffold to search form extracted from render.tsx with shared action button styling.
 */
import { color, type } from "../../../../fringe-ui/tokens";
import { actionButtonStyle, adminSurfaceStyle, dataAttrsFromRecord, widgetDataAttributes } from "../../shared";
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
      style={{ ...adminSurfaceStyle, padding: 12, display: "flex", alignItems: "center", gap: 10, color: color.softInk, ...style }}
      {...widgetDataAttributes(searchBoxWidgetMetadata.widgetId, searchBoxWidgetMetadata.classification.level)}
      {...dataAttrsFromRecord(dataAttributes)}
    >
      <input name="search" defaultValue={value} placeholder={placeholder} aria-label={label} style={{ flex: 1, minHeight: 38, border: "none", outline: "none", background: "transparent", ...type.body }} />
      {action ? <button type="submit" className="adminDslActionButton" style={actionButtonStyle({ variant: "solid", size: "sm" })}>{action.label || "Search"}</button> : null}
    </form>
  );
}
