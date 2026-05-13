import type { DslNode, DslPage, JsonObject, StyleJson } from "./schema";

type NodeInput = DslNode | DslNodeBuilder;

function unwrap(input: NodeInput): DslNode {
  return input instanceof DslNodeBuilder ? input.toJSON() : input;
}

export class DslNodeBuilder<P extends JsonObject = JsonObject> {
  private node: DslNode<P>;

  constructor(kind: DslNode<P>["kind"], props?: P) {
    this.node = { kind, props };
  }

  id(id: string) {
    this.node.meta = { ...(this.node.meta || {}), id };
    return this;
  }

  name(name: string) {
    this.node.meta = { ...(this.node.meta || {}), name };
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

  region(region: "main" | "context") {
    this.node.meta = { ...(this.node.meta || {}), region };
    return this;
  }

  children(...children: NodeInput[]) {
    this.node.children = children.map(unwrap);
    return this;
  }

  toJSON(): DslNode<P> {
    return JSON.parse(JSON.stringify(this.node));
  }
}

export class DslPageBuilder {
  private page: DslPage;

  constructor(id: string, title: string) {
    this.page = {
      schemaVersion: 1,
      id,
      title,
      shell: { kind: "bare" },
      nodes: [],
    };
  }

  describe(description: string) {
    this.page.description = description;
    return this;
  }

  intake(props: JsonObject) {
    this.page.shell = { kind: "intake", props };
    return this;
  }

  bare(props: JsonObject = {}) {
    this.page.shell = { kind: "bare", props };
    return this;
  }

  shell(shell: DslPage["shell"]) {
    this.page.shell = shell;
    return this;
  }

  meta(meta: NonNullable<DslPage["meta"]>) {
    this.page.meta = { ...(this.page.meta || {}), ...meta };
    return this;
  }

  add(...nodes: NodeInput[]) {
    this.page.nodes.push(...nodes.map(unwrap));
    return this;
  }

  toJSON(): DslPage {
    return JSON.parse(JSON.stringify(this.page));
  }
}

export const page = (id: string, title: string) => new DslPageBuilder(id, title);

export const n = {
  // ── Layout primitives ──────────────────────────────────────
  text: (text: string, props: JsonObject = {}) => new DslNodeBuilder("text", { text, ...props }),
  spacer: (height: number) => new DslNodeBuilder("spacer", { height }),
  stack: (props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("stack", props).children(...children),
  grid: (columns: number | string, props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("grid", { columns, ...props }).children(...children),

  // ── Display primitives ─────────────────────────────────────
  eyebrow: (children: string, props: JsonObject = {}) => new DslNodeBuilder("eyebrow", { children, ...props }),
  button: (children: string, props: JsonObject = {}) => new DslNodeBuilder("button", { children, ...props }),
  note: (children: string, props: JsonObject = {}) => new DslNodeBuilder("note", { children, ...props }),
  card: (props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("card", props).children(...children),
  rule: (props: JsonObject = {}) => new DslNodeBuilder("rule", props),
  progress: (value: number, props: JsonObject = {}) => new DslNodeBuilder("progress", { value, ...props }),
  masthead: (title: string, props: JsonObject = {}) => new DslNodeBuilder("masthead", { title, ...props }),

  // ── Selection primitives ───────────────────────────────────
  selectable: (title: string, props: JsonObject = {}) => new DslNodeBuilder("selectable", { title, ...props }),
  selectableGroup: (options: JsonObject[], value: string | string[] | null = null, props: JsonObject = {}) => new DslNodeBuilder("selectableGroup", { options, value, ...props }),
  chip: (children: string, props: JsonObject = {}) => new DslNodeBuilder("chip", { children, ...props }),
  chipGroup: (options: JsonObject[], value: string[] = [], props: JsonObject = {}) => new DslNodeBuilder("chipGroup", { options, value, ...props }),
  segmented: (options: JsonObject[], value: string, props: JsonObject = {}) => new DslNodeBuilder("segmented", { options, value, ...props }),

  // ── Input primitives ───────────────────────────────────────
  scale: (value: number, props: JsonObject = {}) => new DslNodeBuilder("scale", { value, ...props }),
  uploadTile: (label: string, props: JsonObject = {}) => new DslNodeBuilder("uploadTile", { label, ...props }),

  // ── Data display primitives ────────────────────────────────
  kvRow: (label: string, value: string, props: JsonObject = {}) => new DslNodeBuilder("kvRow", { label, value, ...props }),
  stat: (value: string, props: JsonObject = {}) => new DslNodeBuilder("stat", { value, ...props }),
  personCard: (name: string, props: JsonObject = {}) => new DslNodeBuilder("personCard", { name, ...props }),

  // ── Date/time primitives ───────────────────────────────────
  dayCell: (day: string | number, props: JsonObject = {}) => new DslNodeBuilder("dayCell", { day: String(day), ...props }),
  calendarGrid: (year: number, month: number, days: JsonObject[], value: string | null = null, props: JsonObject = {}) => new DslNodeBuilder("calendarGrid", { year, month, days, value, ...props }),
};

export type { StyleJson };
