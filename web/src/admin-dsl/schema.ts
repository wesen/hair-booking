import type { CSSProperties, ReactNode } from "react";

export type AdminJsonPrimitive = string | number | boolean | null;
export type AdminJsonValue = AdminJsonPrimitive | AdminJsonValue[] | { [key: string]: AdminJsonValue };
export type AdminJsonObject = { [key: string]: AdminJsonValue };

export type AdminShellKind = "admin" | "dashboard" | "resource" | "calendar" | "settings" | "bare";

export type AdminNodeKind =
  // Layout
  | "pageHeader"
  | "dashboardGrid"
  | "toolbar"
  | "panel"
  | "splitPane"
  | "tabs"
  | "previewFrame"
  | "comparisonTable"
  | "monthCalendar"
  // Display
  | "metricCard"
  | "statusBadge"
  | "activityFeed"
  | "kvList"
  | "imageGrid"
  | "imageGallery"
  | "markdownBlock"
  | "emptyState"
  | "loadingState"
  | "inlineError"
  // Resource/list
  | "resourcePage"
  | "resourceTable"
  | "resourceDetail"
  | "filterBar"
  | "searchBox"
  | "actionMenu"
  // Forms
  | "form"
  | "fieldGroup"
  | "textField"
  | "textareaField"
  | "moneyField"
  | "durationField"
  | "dateField"
  | "timeField"
  | "selectField"
  | "switchField"
  | "imageField"
  | "saveBar"
  // Calendar
  | "calendarWeek"
  | "appointmentBlock"
  | "availabilityBlock"
  | "timeOffBlock"
  // Dialog/detail surfaces
  | "modal"
  | "drawer"
  | "sheet"
  | "detailPanel"
  | "inlinePanel"
  | "confirmDialog";

export interface AdminNode<P extends AdminJsonObject = AdminJsonObject> {
  kind: AdminNodeKind;
  props?: P;
  children?: AdminNode[];
  meta?: {
    id?: string;
    name?: string;
    region?: "main" | "side" | "toolbar" | "modal" | "drawer";
    dataComponent?: string;
    dataSection?: string;
    dataPart?: string;
    note?: string;
  };
}

export interface AdminPage {
  schemaVersion: 2;
  id: string;
  title: string;
  description?: string;
  shell: {
    kind: AdminShellKind;
    props?: AdminJsonObject;
  };
  nodes: AdminNode[];
  modals?: AdminNode[];
  drawers?: AdminNode[];
  meta?: {
    storyTitle?: string;
    tags?: string[];
    source?: string;
    notes?: string[];
  };
}

export type AdminActionRef = AdminJsonObject & {
  type: "open" | "close" | "navigate" | "mutation" | "confirm" | "refresh" | "upload";
  target: string;
  label?: string;
  payload?: AdminJsonValue;
  options?: AdminJsonObject;
  intent?: "neutral" | "primary" | "danger";
  priority?: "primary" | "secondary" | "tertiary";
  presentation?: "button" | "icon" | "menuItem" | "overflow" | "link";
  placement?: "toolbar" | "pageHeader" | "panelToolbar" | "panelFooter" | "row" | "rowOverflow" | "bulkToolbar" | "formFooter" | "calendarCell" | "sidebarNav" | "footer" | "detail" | "overflow";
  requiresConfirmation?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export type AdminQueryRef = AdminJsonObject & {
  id: string;
  params?: AdminJsonObject;
};

export interface AdminRenderEvent {
  nodeId: string;
  nodeKind: AdminNodeKind | string;
  action: AdminActionRef;
  value?: AdminJsonValue;
  meta?: unknown;
}

export type AdminRenderDispatch = (event: AdminRenderEvent) => void | Promise<void>;

export interface AdminRenderContext {
  dispatch?: AdminRenderDispatch;
  overrides?: Record<string, ReactNode>;
}

export type AdminStyleJson = CSSProperties;
