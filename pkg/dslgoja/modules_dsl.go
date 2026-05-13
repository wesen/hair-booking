package dslgoja

import (
	"fmt"

	"github.com/dop251/goja"
	"github.com/dop251/goja_nodejs/require"
	databasemod "github.com/go-go-golems/go-go-goja/modules/database"
)

func (rt *Runtime) installModules(vm *goja.Runtime, session *FlowSession) error {
	registry := require.NewRegistry()
	registry.RegisterNativeModule("fringe/dsl", loadFringeDSLModule)
	registry.RegisterNativeModule("host/user", loadUserModule(session))
	registry.RegisterNativeModule("host/images", loadImagesModule(session))
	if rt.host.HasDB() {
		dbModule := databasemod.New(
			databasemod.WithName("db"),
			databasemod.WithPreconfiguredDB(rt.host.DB),
			databasemod.WithConfigureEnabled(false),
		)
		registry.RegisterNativeModule(dbModule.Name(), dbModule.Loader)
	}
	registry.Enable(vm)
	return nil
}

func loadUserModule(session *FlowSession) func(*goja.Runtime, *goja.Object) {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		exports := moduleObj.Get("exports").(*goja.Object)
		_ = exports.Set("current", func() map[string]any { return userSnapshotJS(session.User) })
		_ = exports.Set("isAuthenticated", func() bool { return session.User.Authenticated })
		_ = exports.Set("hasRole", func(role string) bool { return session.User.HasRole(role) })
	}
}

func loadImagesModule(session *FlowSession) func(*goja.Runtime, *goja.Object) {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		exports := moduleObj.Get("exports").(*goja.Object)
		_ = exports.Set("createUploadIntent", func(call goja.FunctionCall) goja.Value {
			options := uploadIntentOptionsFromCall(vm, call)
			intent, err := session.CreateUploadIntent(options)
			if err != nil {
				panic(vm.ToValue("host/images.createUploadIntent: " + err.Error()))
			}
			return vm.ToValue(uploadIntentJS(intent))
		})
		_ = exports.Set("get", func(uploadID string) any {
			image, ok := session.Uploads[uploadID]
			if !ok {
				return nil
			}
			return uploadedImageJS(image)
		})
		_ = exports.Set("list", func(call goja.FunctionCall) goja.Value {
			purpose := ""
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				obj := call.Argument(0).ToObject(vm)
				if value := obj.Get("purpose"); !goja.IsUndefined(value) && !goja.IsNull(value) {
					purpose = value.String()
				}
			}
			images := session.Uploads
			out := make([]map[string]any, 0, len(images))
			for _, image := range images {
				if purpose != "" && image.Purpose != purpose {
					continue
				}
				out = append(out, uploadedImageJS(image))
			}
			return vm.ToValue(out)
		})
	}
}

func loadFringeDSLModule(vm *goja.Runtime, moduleObj *goja.Object) {
	value, err := vm.RunString(dslModuleSource)
	if err != nil {
		panic(vm.ToValue(fmt.Sprintf("install fringe/dsl: %v", err)))
	}
	_ = moduleObj.Set("exports", value)
}

const dslModuleSource = `
(function() {
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
    // Layout
    text: (text, props) => node("text", Object.assign({ text }, props || {})),
    spacer: (height) => node("spacer", { height }),
    stack: (props, ...children) => node("stack", props || {}, children.map(toJSON)),
    grid: (columns, props, ...children) => node("grid", Object.assign({ columns }, props || {}), children.map(toJSON)),
    // Display
    eyebrow: (children, props) => node("eyebrow", Object.assign({ children }, props || {})),
    button: (children, props) => node("button", Object.assign({ children }, props || {})),
    note: (children, props) => node("note", Object.assign({ children }, props || {})),
    card: (props, ...children) => node("card", props || {}, children.map(toJSON)),
    rule: (props) => node("rule", props || {}),
    progress: (value, props) => node("progress", Object.assign({ value }, props || {})),
    masthead: (title, props) => node("masthead", Object.assign({ title }, props || {})),
    // Selection
    selectable: (title, props) => node("selectable", Object.assign({ title }, props || {})),
    selectableGroup: (options, value, props) => node("selectableGroup", Object.assign({ options, value }, props || {})),
    chip: (label, props) => node("chip", Object.assign({ label }, props || {})),
    chipGroup: (options, value, props) => node("chipGroup", Object.assign({ options, value }, props || {})),
    segmented: (options, value, props) => node("segmented", Object.assign({ options, value }, props || {})),
    // Input
    scale: (value, props) => node("scale", Object.assign({ value }, props || {})),
    uploadTile: (label, props) => node("uploadTile", Object.assign({ label }, props || {})),
    // Data display
    kvRow: (label, value, props) => node("kvRow", Object.assign({ label, value }, props || {})),
    stat: (value, props) => node("stat", Object.assign({ value }, props || {})),
    personCard: (name, props) => node("personCard", Object.assign({ name }, props || {})),
    // Date/time
    dayCell: (day, props) => node("dayCell", Object.assign({ day: String(day) }, props || {})),
    calendarGrid: (year, month, days, value, props) => node("calendarGrid", Object.assign({ year, month, days, value: value || null }, props || {})),
  };

  return { page, n };
})()
`
