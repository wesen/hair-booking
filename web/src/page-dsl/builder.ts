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
  text: (text: string, props: JsonObject = {}) => new DslNodeBuilder("text", { text, ...props }),
  spacer: (height: number) => new DslNodeBuilder("spacer", { height }),
  stack: (props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("stack", props).children(...children),
  grid: (columns: number | string, props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("grid", { columns, ...props }).children(...children),
  eyebrow: (children: string, props: JsonObject = {}) => new DslNodeBuilder("eyebrow", { children, ...props }),
  button: (children: string, props: JsonObject = {}) => new DslNodeBuilder("button", { children, ...props }),
  chip: (children: string, props: JsonObject = {}) => new DslNodeBuilder("chip", { children, ...props }),
  note: (children: string, props: JsonObject = {}) => new DslNodeBuilder("note", { children, ...props }),
  card: (props: JsonObject = {}, ...children: NodeInput[]) => new DslNodeBuilder("card", props).children(...children),
  rule: (props: JsonObject = {}) => new DslNodeBuilder("rule", props),
  progress: (value: number, props: JsonObject = {}) => new DslNodeBuilder("progress", { value, ...props }),
  ratingBar: (value: number, props: JsonObject = {}) => new DslNodeBuilder("ratingBar", { value, ...props }),
  segmented: (options: JsonObject[], value: string, props: JsonObject = {}) => new DslNodeBuilder("segmented", { options, value, ...props }),
  serviceOption: (name: string, description: string, props: JsonObject = {}) => new DslNodeBuilder("serviceOption", { name, description, ...props }),
  budgetOption: (label: string, description: string, props: JsonObject = {}) => new DslNodeBuilder("budgetOption", { label, description, ...props }),
  timeSlot: (label: string, props: JsonObject = {}) => new DslNodeBuilder("timeSlot", { label, ...props }),
  colorLevelBar: (current: number, props: JsonObject = {}) => new DslNodeBuilder("colorLevelBar", { current, ...props }),
  lengthSilhouette: (label: string, props: JsonObject = {}) => new DslNodeBuilder("lengthSilhouette", { label, ...props }),
  photoTile: (label: string, props: JsonObject = {}) => new DslNodeBuilder("photoTile", { label, ...props }),
  summaryRow: (label: string, value: string, props: JsonObject = {}) => new DslNodeBuilder("summaryRow", { label, value, ...props }),
  stylistCard: (name: string, role: string, props: JsonObject = {}) => new DslNodeBuilder("stylistCard", { name, role, ...props }),
  masthead: (title: string, props: JsonObject = {}) => new DslNodeBuilder("masthead", { title, ...props }),
  dayCell: (day: string | number, props: JsonObject = {}) => new DslNodeBuilder("dayCell", { day: String(day), ...props }),
};

export type { StyleJson };
