import type {
  AdminActionRef,
  AdminJsonObject,
  AdminJsonValue,
  AdminNode,
  AdminNodeKind,
  AdminPage,
  AdminQueryRef,
  AdminShellKind,
} from "./schema";

type NodeInput = AdminNode | AdminNodeBuilder;
type ActionInput = AdminActionRef | AdminActionBuilder;
type QueryInput = AdminQueryRef | QueryBuilder | string;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function unwrapNode(input: NodeInput): AdminNode {
  return input instanceof AdminNodeBuilder ? input.toJSON() : input;
}

function unwrapAction(input: ActionInput): AdminActionRef {
  return input instanceof AdminActionBuilder ? input.toJSON() : input;
}

function unwrapQuery(input: QueryInput): AdminQueryRef {
  if (typeof input === "string") return { id: input };
  return input instanceof QueryBuilder ? input.toJSON() : input;
}

export class AdminNodeBuilder<P extends AdminJsonObject = AdminJsonObject> {
  protected node: AdminNode<P>;

  constructor(kind: AdminNodeKind, props?: P) {
    this.node = { kind, props } as AdminNode<P>;
  }

  id(id: string) {
    this.node.meta = { ...(this.node.meta || {}), id };
    return this;
  }

  name(name: string) {
    this.node.meta = { ...(this.node.meta || {}), name };
    return this;
  }

  region(region: NonNullable<NonNullable<AdminNode["meta"]>["region"]>) {
    this.node.meta = { ...(this.node.meta || {}), region };
    return this;
  }

  section(dataSection: string) {
    this.node.meta = { ...(this.node.meta || {}), dataSection };
    return this;
  }

  part(dataPart: string) {
    this.node.meta = { ...(this.node.meta || {}), dataPart };
    return this;
  }

  note(note: string) {
    this.node.meta = { ...(this.node.meta || {}), note };
    return this;
  }

  props(props: AdminJsonObject) {
    this.node.props = { ...this.node.props, ...props } as P;
    return this;
  }

  children(...children: NodeInput[]) {
    this.node.children = children.map(unwrapNode);
    return this;
  }

  add(...children: NodeInput[]) {
    this.node.children = [...(this.node.children || []), ...children.map(unwrapNode)];
    return this;
  }

  action(slot: string, actionRef: ActionInput) {
    const current = (this.node.props?.actions && typeof this.node.props.actions === "object" && !Array.isArray(this.node.props.actions))
      ? this.node.props.actions as AdminJsonObject
      : {};
    this.node.props = {
      ...(this.node.props || {}),
      actions: { ...current, [slot]: unwrapAction(actionRef) as unknown as AdminJsonValue },
    } as unknown as P;
    return this;
  }

  actions(...actions: ActionInput[]) {
    this.node.props = {
      ...(this.node.props || {}),
      actions: actions.map(unwrapAction) as unknown as AdminJsonValue,
    } as unknown as P;
    return this;
  }

  query(queryRef: QueryInput, params?: AdminJsonObject) {
    const q = typeof queryRef === "string" ? { id: queryRef, params } : unwrapQuery(queryRef);
    this.node.props = { ...(this.node.props || {}), query: q as unknown as AdminJsonValue } as unknown as P;
    return this;
  }

  empty(emptyState: NodeInput) {
    this.node.props = { ...(this.node.props || {}), empty: unwrapNode(emptyState) as unknown as AdminJsonValue } as unknown as P;
    return this;
  }

  state(state: "idle" | "loading" | "empty" | "error" | "dirty" | "pending" | "success") {
    this.node.props = { ...(this.node.props || {}), state } as unknown as P;
    return this;
  }

  values(values: AdminJsonObject) {
    this.node.props = { ...(this.node.props || {}), values } as unknown as P;
    return this;
  }

  errors(errors: AdminJsonObject) {
    this.node.props = { ...(this.node.props || {}), errors } as unknown as P;
    return this;
  }

  submit(actionRef: ActionInput) {
    return this.action("submit", actionRef);
  }

  cancel(actionRef: ActionInput) {
    return this.action("cancel", actionRef);
  }

  dirty(dirty = true) {
    this.node.props = { ...(this.node.props || {}), dirty } as unknown as P;
    return this;
  }

  pending(pending = true) {
    this.node.props = { ...(this.node.props || {}), pending } as unknown as P;
    return this;
  }

  layoutPolicy(policy: AdminJsonObject) {
    this.node.props = { ...(this.node.props || {}), layoutPolicy: policy } as unknown as P;
    return this;
  }

  adaptive(views: AdminJsonObject) {
    this.node.props = { ...(this.node.props || {}), adaptive: views } as unknown as P;
    return this;
  }

  toJSON(): AdminNode<P> {
    return clone(this.node);
  }
}

export class AdminPageBuilder {
  private page: AdminPage;

  constructor(id: string, title: string, shell: AdminShellKind = "admin") {
    this.page = {
      schemaVersion: 1,
      id,
      title,
      shell: { kind: shell },
      nodes: [],
    };
  }

  title(title: string) {
    this.page.title = title;
    return this;
  }

  describe(description: string) {
    this.page.description = description;
    return this;
  }

  schemaVersion(schemaVersion: AdminPage["schemaVersion"]) {
    this.page.schemaVersion = schemaVersion;
    return this;
  }

  shell(kind: AdminShellKind, props: AdminJsonObject = {}) {
    this.page.shell = { kind, props };
    return this;
  }

  meta(meta: NonNullable<AdminPage["meta"]>) {
    this.page.meta = { ...(this.page.meta || {}), ...meta };
    return this;
  }

  content(...nodes: NodeInput[]) {
    this.page.nodes = nodes.map(unwrapNode);
    return this;
  }

  add(...nodes: NodeInput[]) {
    this.page.nodes.push(...nodes.map(unwrapNode));
    return this;
  }

  toolbar(...actions: ActionInput[]) {
    this.page.nodes.unshift(admin.toolbar(...actions).toJSON());
    return this;
  }

  modals(...nodes: NodeInput[]) {
    this.page.modals = nodes.map(unwrapNode);
    return this;
  }

  drawers(...nodes: NodeInput[]) {
    this.page.drawers = nodes.map(unwrapNode);
    return this;
  }

  toJSON(): AdminPage {
    return clone(this.page);
  }
}

export class AdminActionBuilder {
  constructor(private readonly ref: AdminActionRef) {}

  payload(payload: AdminJsonValue) {
    return new AdminActionBuilder({ ...this.ref, payload });
  }

  options(options: AdminJsonObject) {
    return new AdminActionBuilder({ ...this.ref, options: { ...(this.ref.options || {}), ...options } });
  }

  intent(intent: NonNullable<AdminActionRef["intent"]>) {
    return new AdminActionBuilder({ ...this.ref, intent });
  }

  priority(priority: NonNullable<AdminActionRef["priority"]>) {
    return new AdminActionBuilder({ ...this.ref, priority });
  }

  placement(placement: NonNullable<AdminActionRef["placement"]>) {
    return new AdminActionBuilder({ ...this.ref, placement });
  }

  presentation(presentation: NonNullable<AdminActionRef["presentation"]>) {
    return new AdminActionBuilder({ ...this.ref, presentation });
  }

  confirm(options: AdminJsonObject = {}) {
    return new AdminActionBuilder({
      ...this.ref,
      requiresConfirmation: true,
      options: { ...(this.ref.options || {}), confirmation: options },
    });
  }

  disabled(disabled = true) {
    return new AdminActionBuilder({ ...this.ref, disabled });
  }

  loading(loading = true) {
    return new AdminActionBuilder({ ...this.ref, loading });
  }

  accessibilityLabel(accessibilityLabel: string) {
    return new AdminActionBuilder({ ...this.ref, accessibilityLabel });
  }

  toJSON(): AdminActionRef {
    return clone(this.ref);
  }
}

export class QueryBuilder {
  constructor(private readonly ref: AdminQueryRef) {}

  params(params: AdminJsonObject) {
    return new QueryBuilder({ ...this.ref, params });
  }

  toJSON(): AdminQueryRef {
    return clone(this.ref);
  }
}

function makeAction(
  type: AdminActionRef["type"],
  target: string,
  label?: string,
  payload?: AdminJsonValue,
  options?: AdminJsonObject,
): AdminActionRef {
  return {
    type,
    target,
    ...(label === undefined ? {} : { label }),
    ...(payload === undefined ? {} : { payload }),
    ...(options === undefined ? {} : { options }),
  } as AdminActionRef;
}

export const action = {
  open: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("open", target, label, payload)),
  close: (target = "current") => new AdminActionBuilder(makeAction("close", target)),
  navigate: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("navigate", target, label, payload)),
  mutation: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("mutation", target, label, payload)),
  confirm: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("confirm", target, label, payload)).intent("danger").confirm(),
  refresh: (target: string, label = "Refresh", payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("refresh", target, label, payload)),
  upload: (target: string, label?: string, options: AdminJsonObject = {}) => new AdminActionBuilder(makeAction("upload", target, label, undefined, options)),
  primary: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("mutation", target, label, payload)).intent("primary").priority("primary"),
  secondary: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("mutation", target, label, payload)).intent("neutral").priority("secondary"),
  danger: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("mutation", target, label, payload)).intent("danger").priority("secondary").confirm(),
  ghost: (target: string, label?: string, payload?: AdminJsonValue) => new AdminActionBuilder(makeAction("mutation", target, label, payload)).intent("neutral").priority("tertiary").presentation("link"),
};

export const query = {
  ref: (id: string, params?: AdminJsonObject) => new QueryBuilder({ id, ...(params === undefined ? {} : { params }) } as AdminQueryRef),
};

function node(kind: AdminNodeKind, props: AdminJsonObject = {}, ...children: NodeInput[]) {
  return new AdminNodeBuilder(kind, props).children(...children);
}

export const admin = {
  page: (id: string, title: string) => new AdminPageBuilder(id, title, "admin"),
  dashboard: (id = "dashboard", title = "Dashboard") => new AdminPageBuilder(id, title, "dashboard"),
  calendarPage: (id = "calendar", title = "Calendar") => new AdminPageBuilder(id, title, "calendar"),
  settings: (id: string, title: string) => new AdminPageBuilder(id, title, "settings"),

  pageHeader: (props: AdminJsonObject = {}) => node("pageHeader", props),
  dashboardGrid: (props: AdminJsonObject = {}, ...children: NodeInput[]) => node("dashboardGrid", props, ...children),
  section: (title: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("section", { title, ...props }, ...children),
  toolbar: (...actions: ActionInput[]) => node("toolbar", { actions: actions.map((a) => unwrapAction(a)) as unknown as AdminJsonValue }),
  cardGrid: (...children: NodeInput[]) => node("cardGrid", {}, ...children),
  panel: (title: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("panel", { title, ...props }, ...children),
  splitPane: (props: AdminJsonObject = {}, ...children: NodeInput[]) => node("splitPane", props, ...children),
  tabs: (tabs: AdminJsonObject[], value: string, props: AdminJsonObject = {}) => node("tabs", { tabs, value, ...props }),
  editableList: (id: string, items: AdminJsonObject[], props: AdminJsonObject = {}) => node("editableList", { id, items, ...props }).id(id),
  monthAvailabilityGrid: (id: string, days: AdminJsonObject[], props: AdminJsonObject = {}) => node("monthAvailabilityGrid", { id, days, ...props }).id(id),
  previewFrame: (id: string, props: AdminJsonObject = {}) => node("previewFrame", { id, ...props }).id(id),
  comparisonTable: (id: string, rows: AdminJsonObject[], props: AdminJsonObject = {}) => node("comparisonTable", { id, rows, ...props }).id(id),
  monthCalendar: (id: string, props: AdminJsonObject = {}) => node("monthCalendar", { id, ...props }).id(id),
  diffView: (id: string, changes: AdminJsonObject[], props: AdminJsonObject = {}) => node("diffView", { id, changes, ...props }).id(id),

  metric: (label: string, value: string | number, props: AdminJsonObject = {}) => node("metricCard", { label, value, ...props }),
  summary: (title: string, props: AdminJsonObject = {}) => node("summaryCard", { title, ...props }),
  badge: (label: string, tone = "neutral") => node("statusBadge", { label, tone }),
  emptyState: (title: string, props: AdminJsonObject = {}) => node("emptyState", { title, ...props }),
  inlineError: (title: string, props: AdminJsonObject = {}) => node("inlineError", { title, ...props }),
  markdown: (markdown: string, props: AdminJsonObject = {}) => node("markdownBlock", { markdown, ...props }),
  kvList: (items: AdminJsonObject[], props: AdminJsonObject = {}) => node("kvList", { items, ...props }),
  activityFeed: (items: AdminJsonObject[], props: AdminJsonObject = {}) => node("activityFeed", { items, ...props }),
  imageGrid: (items: AdminJsonObject[], props: AdminJsonObject = {}) => node("imageGrid", { items, ...props }),
  imageGallery: (id: string, images: AdminJsonObject[], props: AdminJsonObject = {}) => node("imageGallery", { id, images, ...props }).id(id),
  loadingState: (title: string, props: AdminJsonObject = {}) => node("loadingState", { title, ...props }),

  resourceList: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("resourceList", { id, ...props }, ...children),
  filterBar: (filters: AdminJsonObject[], value?: string, props: AdminJsonObject = {}) => node("filterBar", { filters, value: value || null, ...props }),
  searchBox: (placeholder = "Search", props: AdminJsonObject = {}) => node("searchBox", { placeholder, ...props }),

  form: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("form", { id, ...props }, ...children),
  fieldGroup: (title: string, ...children: NodeInput[]) => node("fieldGroup", { title }, ...children),
  saveBar: (props: AdminJsonObject = {}) => node("saveBar", props),

  calendarWeek: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("calendarWeek", { id, ...props }, ...children),
  appointmentBlock: (id: string, props: AdminJsonObject = {}) => node("appointmentBlock", { id, ...props }),
  availabilityBlock: (id: string, props: AdminJsonObject = {}) => node("availabilityBlock", { id, ...props }),
  timeOffBlock: (id: string, props: AdminJsonObject = {}) => node("timeOffBlock", { id, ...props }),

};

export const surface = {
  drawer: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("drawer", { id, presentation: "drawer", ...props }, ...children).region("drawer"),
  modal: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("modal", { id, presentation: "modal", ...props }, ...children).region("modal"),
  sheet: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("sheet", { id, presentation: "sheet", ...props }, ...children).region("drawer"),
  confirm: (id: string, props: AdminJsonObject = {}) => node("confirmDialog", { id, presentation: "confirm", ...props }).region("modal"),
  detailPanel: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("detailPanel", { id, presentation: "detailPanel", ...props }, ...children).region("side"),
  inlinePanel: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("inlinePanel", { id, presentation: "inlinePanel", ...props }, ...children),
};

export const resource = {
  page: (id: string, title = id) => new AdminPageBuilder(id, title, "resource"),
  list: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("resourceList", { id, ...props }, ...children),
  table: (id: string, columns: AdminJsonObject[], rows: AdminJsonObject[], props: AdminJsonObject = {}) => node("resourceTable", { id, columns, rows, ...props }).id(id),
  row: (id: string, props: AdminJsonObject = {}) => node("resourceRow", { id, ...props }).id(id),
  detail: (id: string, props: AdminJsonObject = {}, ...children: NodeInput[]) => node("resourceDetail", { id, ...props }, ...children),
};

export const field = {
  text: (name: string, props: AdminJsonObject = {}) => node("textField", { name, ...props }),
  textarea: (name: string, props: AdminJsonObject = {}) => node("textareaField", { name, ...props }),
  money: (name: string, props: AdminJsonObject = {}) => node("moneyField", { name, ...props }),
  duration: (name: string, props: AdminJsonObject = {}) => node("durationField", { name, ...props }),
  date: (name: string, props: AdminJsonObject = {}) => node("dateField", { name, ...props }),
  time: (name: string, props: AdminJsonObject = {}) => node("timeField", { name, ...props }),
  select: (name: string, options: AdminJsonObject[], props: AdminJsonObject = {}) => node("selectField", { name, options, ...props }),
  switch: (name: string, props: AdminJsonObject = {}) => node("switchField", { name, ...props }),
  image: (name: string, props: AdminJsonObject = {}) => node("imageField", { name, ...props }),
};

export const view = {
  list: (id: string, label = id, props: AdminJsonObject = {}) => ({ id, label, kind: "list", ...props }),
  calendar: (id: string, label = id, props: AdminJsonObject = {}) => ({ id, label, kind: "calendar", ...props }),
};
