import type { CSSProperties, ReactNode } from "react";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type DslNodeKind =
  | "text"
  | "spacer"
  | "stack"
  | "grid"
  | "eyebrow"
  | "button"
  | "chip"
  | "chipGroup"
  | "note"
  | "card"
  | "rule"
  | "progress"
  | "ratingBar"
  | "segmented"
  | "serviceOption"
  | "serviceOptionGroup"
  | "budgetOption"
  | "budgetOptionGroup"
  | "timeSlot"
  | "timeSlotGroup"
  | "colorLevelBar"
  | "lengthSilhouette"
  | "photoTile"
  | "summaryRow"
  | "stylistCard"
  | "masthead"
  | "dayCell"
  | "dayPickerGrid";

export interface DslNode<P extends JsonObject = JsonObject> {
  kind: DslNodeKind;
  props?: P;
  children?: DslNode[];
  meta?: {
    id?: string;
    name?: string;
    dataComponent?: string;
    dataSection?: string;
    dataPart?: string;
    note?: string;
  };
}

export interface DslPage {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  shell: {
    kind: "intake" | "bare";
    props?: JsonObject;
  };
  nodes: DslNode[];
  meta?: {
    storyTitle?: string;
    tags?: string[];
    source?: string;
    notes?: string[];
  };
}

export interface DslActionPayload {
  node: DslNode;
  action: string;
  value?: JsonValue;
  meta?: unknown;
}

export type DslAction = (payload?: DslActionPayload) => void;
export type DslActionMap = Record<string, DslAction>;

export interface DslRenderContext {
  actions?: DslActionMap;
  overrides?: Record<string, ReactNode>;
}

export type StyleJson = CSSProperties;
