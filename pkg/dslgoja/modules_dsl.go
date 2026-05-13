package dslgoja

import "github.com/dop251/goja"

func installDSLModule(vm *goja.Runtime) error {
	_, err := vm.RunString(dslModuleSource)
	return err
}

const dslModuleSource = `
(function(global) {
  const modules = Object.create(null);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function node(kind, props, children) {
    return {
      kind,
      props: props || {},
      children: children || [],
      meta: undefined,
      id(id) {
        this.meta = Object.assign({}, this.meta || {}, { id });
        return this;
      },
      section(dataSection) {
        this.meta = Object.assign({}, this.meta || {}, { dataSection });
        return this;
      },
      part(dataPart) {
        this.meta = Object.assign({}, this.meta || {}, { dataPart });
        return this;
      },
      child(...items) {
        this.children.push(...items.map(toJSON));
        return this;
      },
      toJSON() {
        const out = { kind: this.kind };
        if (this.props && Object.keys(this.props).length) out.props = clone(this.props);
        if (this.children && this.children.length) out.children = this.children.map(toJSON);
        if (this.meta) out.meta = clone(this.meta);
        return out;
      },
    };
  }

  function toJSON(value) {
    if (value && typeof value.toJSON === "function") return value.toJSON();
    return clone(value);
  }

  function page(id, title) {
    const pageObj = {
      schemaVersion: 1,
      id,
      title,
      shell: { kind: "bare" },
      nodes: [],
      description: undefined,
      describe(description) {
        this.description = description;
        return this;
      },
      intake(props) {
        this.shell = { kind: "intake", props: props || {} };
        return this;
      },
      bare(props) {
        this.shell = { kind: "bare", props: props || {} };
        return this;
      },
      add(...items) {
        this.nodes.push(...items.map(toJSON));
        return this;
      },
      toJSON() {
        const out = {
          schemaVersion: 1,
          id: this.id,
          title: this.title,
          shell: clone(this.shell),
          nodes: this.nodes.map(toJSON),
        };
        if (this.description) out.description = this.description;
        return out;
      },
    };
    return pageObj;
  }

  const n = {
    text: (text, props) => node("text", Object.assign({ text }, props || {})),
    spacer: (height) => node("spacer", { height }),
    stack: (props, ...children) => node("stack", props || {}, children.map(toJSON)),
    grid: (columns, props, ...children) => node("grid", Object.assign({ columns }, props || {}), children.map(toJSON)),
    eyebrow: (children, props) => node("eyebrow", Object.assign({ children }, props || {})),
    button: (children, props) => node("button", Object.assign({ children }, props || {})),
    chipGroup: (options, value, props) => node("chipGroup", Object.assign({ options, value }, props || {})),
    note: (children, props) => node("note", Object.assign({ children }, props || {})),
    card: (props, ...children) => node("card", props || {}, children.map(toJSON)),
    ratingBar: (value, props) => node("ratingBar", Object.assign({ value }, props || {})),
    segmented: (options, value, props) => node("segmented", Object.assign({ options, value }, props || {})),
    serviceOptionGroup: (options, value, props) => node("serviceOptionGroup", Object.assign({ options, value }, props || {})),
    budgetOptionGroup: (options, value, props) => node("budgetOptionGroup", Object.assign({ options, value }, props || {})),
    timeSlotGroup: (options, value, props) => node("timeSlotGroup", Object.assign({ options, value }, props || {})),
    dayPickerGrid: (days, value, props) => node("dayPickerGrid", Object.assign({ days, value }, props || {})),
    photoTile: (label, props) => node("photoTile", Object.assign({ label }, props || {})),
    summaryRow: (label, value, props) => node("summaryRow", Object.assign({ label, value }, props || {})),
  };

  modules["fringe/dsl"] = { page, n };

  global.require = function(name) {
    if (!modules[name]) throw new Error("unknown module: " + name);
    return modules[name];
  };
})(globalThis);
`
