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
  | "note"
  | "card"
  | "rule"
  | "progress"
  | "ratingBar"
  | "segmented"
  | "serviceOption"
  | "budgetOption"
  | "timeSlot"
  | "colorLevelBar"
  | "lengthSilhouette"
  | "photoTile"
  | "summaryRow"
  | "stylistCard"
  | "masthead"
  | "dayCell";

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

export type DslActionMap = Record<string, () => void>;

export interface DslRenderContext {
  actions?: DslActionMap;
  overrides?: Record<string, ReactNode>;
}

export type StyleJson = CSSProperties;
