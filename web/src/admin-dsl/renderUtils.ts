import type { CSSProperties, Key } from "react";
import type { AdminJsonObject, AdminNode } from "./schema";
import { color } from "../fringe-ui/tokens";

export function str(props: AdminJsonObject | undefined, key: string, fallback = "") {
  const value = props?.[key];
  return typeof value === "string" ? value : fallback;
}

export function num(props: AdminJsonObject | undefined, key: string, fallback = 0) {
  const value = props?.[key];
  return typeof value === "number" ? value : fallback;
}

export function bool(props: AdminJsonObject | undefined, key: string, fallback = false) {
  const value = props?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function jsonArray<T = unknown>(props: AdminJsonObject | undefined, key: string): T[] {
  const value = props?.[key];
  return Array.isArray(value) ? value as T[] : [];
}

export function jsonObject(props: AdminJsonObject | undefined, key: string): AdminJsonObject | undefined {
  const value = props?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as AdminJsonObject : undefined;
}

export function style(props: AdminJsonObject | undefined): CSSProperties | undefined {
  const value = props?.style;
  return value && typeof value === "object" && !Array.isArray(value) ? value as CSSProperties : undefined;
}

export function toneColor(tone: string) {
  switch (tone) {
    case "success": return color.success;
    case "warn": return color.warn;
    case "danger": return color.danger;
    case "plum": return color.plum;
    case "muted": return color.soft;
    default: return color.ink;
  }
}

export function nodeKey(node: AdminNode, index: number): Key {
  return node.meta?.id || str(node.props, "id", `${node.kind}:${index}`);
}

export function dataAttrs(node: AdminNode) {
  return {
    "data-admin-dsl-kind": node.kind,
    "data-admin-dsl-id": node.meta?.id || str(node.props, "id", undefined as unknown as string),
    "data-section": node.meta?.dataSection,
    "data-part": node.meta?.dataPart,
  };
}
