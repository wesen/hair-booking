import type { CSSProperties, ReactNode } from "react";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type DslNodeKind =
  // Layout
  | "text"
  | "spacer"
  | "stack"
  | "grid"
  // Display
  | "eyebrow"
  | "button"
  | "note"
  | "card"
  | "rule"
  | "progress"
  | "masthead"
  // Selection
  | "selectable"
  | "selectableGroup"
  | "chip"
  | "chipGroup"
  | "segmented"
  // Input
  | "scale"
  | "uploadTile"
  // Data display
  | "kvRow"
  | "stat"
  | "personCard"
  // Date/time
  | "dayCell"
  | "calendarGrid";

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
    kind: "intake" | "bare" | "desktop";
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

export interface DslActionRef {
  id: string;
  event: string;
}

export interface DslActionPayload {
  node: DslNode;
  action: string;
  value?: JsonValue;
  meta?: unknown;
}

export interface DslBackendEvent {
  nodeId: string;
  nodeKind: DslNodeKind | string;
  actionId: string;
  event: string;
  value?: JsonValue;
  meta?: unknown;
}

export type DslAction = (payload?: DslActionPayload) => void;
export type DslActionMap = Record<string, DslAction>;
export type DslBackendDispatch = (event: DslBackendEvent) => void | Promise<void>;

export interface DslRenderContext {
  actions?: DslActionMap;
  backendDispatch?: DslBackendDispatch;
  overrides?: Record<string, ReactNode>;
}

export type StyleJson = CSSProperties;
