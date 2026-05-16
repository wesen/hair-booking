package admindsl

import (
	"encoding/json"
	"fmt"
)

// PageBuilder is the authoritative host-side fluent builder for Admin DSL pages.
// Goja modules should expose this builder (or a thin wrapper around it) rather
// than reimplementing Admin DSL validity rules in JavaScript.
type PageBuilder struct {
	page Page
	err  error
}

func PageResource(id, title string) *PageBuilder  { return NewPage(id, title, ShellResource) }
func PageAdmin(id, title string) *PageBuilder     { return NewPage(id, title, ShellAdmin) }
func PageDashboard(id, title string) *PageBuilder { return NewPage(id, title, ShellDashboard) }
func PageCalendar(id, title string) *PageBuilder  { return NewPage(id, title, ShellCalendar) }
func PageSettings(id, title string) *PageBuilder  { return NewPage(id, title, ShellSettings) }

func NewPage(id, title string, shell ShellKind) *PageBuilder {
	return &PageBuilder{page: Page{SchemaVersion: 1, ID: id, Title: title, Shell: Shell{Kind: shell}, Nodes: []Node{}}}
}

func (b *PageBuilder) Description(description string) *PageBuilder {
	b.page.Description = description
	return b
}

func (b *PageBuilder) Shell(kind ShellKind, props JSONObject) *PageBuilder {
	b.page.Shell = Shell{Kind: kind, Props: props}
	return b
}

func (b *PageBuilder) Meta(meta PageMeta) *PageBuilder {
	b.page.Meta = meta
	return b
}

func (b *PageBuilder) Toolbar(actions ...*ActionBuilder) *PageBuilder {
	b.page.Nodes = append([]Node{Toolbar(actions...).Build()}, b.page.Nodes...)
	return b
}

func (b *PageBuilder) Content(nodes ...*NodeBuilder) *PageBuilder {
	b.page.Nodes = buildNodes(nodes...)
	return b
}

func (b *PageBuilder) Add(nodes ...*NodeBuilder) *PageBuilder {
	b.page.Nodes = append(b.page.Nodes, buildNodes(nodes...)...)
	return b
}

func (b *PageBuilder) Modals(nodes ...*NodeBuilder) *PageBuilder {
	b.page.Modals = buildNodes(nodes...)
	return b
}

func (b *PageBuilder) Drawers(nodes ...*NodeBuilder) *PageBuilder {
	b.page.Drawers = buildNodes(nodes...)
	return b
}

func (b *PageBuilder) Build() (Page, error) {
	if b.err != nil {
		return Page{}, b.err
	}
	if err := ValidatePage(b.page); err != nil {
		return Page{}, err
	}
	return clonePage(b.page)
}

func (b *PageBuilder) MustBuild() Page {
	page, err := b.Build()
	if err != nil {
		panic(err)
	}
	return page
}

func (b *PageBuilder) JSON() ([]byte, error) {
	page, err := b.Build()
	if err != nil {
		return nil, err
	}
	return json.Marshal(page)
}

type NodeBuilder struct {
	node Node
}

func NodeOf(kind NodeKind, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return (&NodeBuilder{node: Node{Kind: kind, Props: props}}).Children(children...)
}

func (b *NodeBuilder) ID(id string) *NodeBuilder {
	b.ensureMeta().ID = id
	return b
}

func (b *NodeBuilder) Name(name string) *NodeBuilder {
	b.ensureMeta().Name = name
	return b
}

func (b *NodeBuilder) Region(region Region) *NodeBuilder {
	b.ensureMeta().Region = region
	return b
}

func (b *NodeBuilder) DataSection(section string) *NodeBuilder {
	b.ensureMeta().DataSection = section
	return b
}

func (b *NodeBuilder) DataPart(part string) *NodeBuilder {
	b.ensureMeta().DataPart = part
	return b
}

func (b *NodeBuilder) Note(note string) *NodeBuilder {
	b.ensureMeta().Note = note
	return b
}

func (b *NodeBuilder) Props(props JSONObject) *NodeBuilder {
	if b.node.Props == nil {
		b.node.Props = JSONObject{}
	}
	for k, v := range props {
		b.node.Props[k] = v
	}
	return b
}

func (b *NodeBuilder) Children(children ...*NodeBuilder) *NodeBuilder {
	b.node.Children = buildNodes(children...)
	return b
}

func (b *NodeBuilder) Add(children ...*NodeBuilder) *NodeBuilder {
	b.node.Children = append(b.node.Children, buildNodes(children...)...)
	return b
}

func (b *NodeBuilder) Action(slot string, action *ActionBuilder) *NodeBuilder {
	if slot == "" {
		panic("admin dsl action slot must not be empty")
	}
	if b.node.Props == nil {
		b.node.Props = JSONObject{}
	}
	actions, _ := b.node.Props["actions"].(JSONObject)
	if actions == nil {
		actions = JSONObject{}
	}
	actions[slot] = action.Build()
	b.node.Props["actions"] = actions
	return b
}

func (b *NodeBuilder) Actions(actions ...*ActionBuilder) *NodeBuilder {
	values := make([]JSONValue, 0, len(actions))
	for _, action := range actions {
		values = append(values, action.Build())
	}
	if b.node.Props == nil {
		b.node.Props = JSONObject{}
	}
	b.node.Props["actions"] = values
	return b
}

func (b *NodeBuilder) Query(query *QueryBuilder) *NodeBuilder {
	if b.node.Props == nil {
		b.node.Props = JSONObject{}
	}
	b.node.Props["query"] = query.Build()
	return b
}

func (b *NodeBuilder) State(state string) *NodeBuilder {
	return b.Props(JSONObject{"state": state})
}

func (b *NodeBuilder) Values(values JSONObject) *NodeBuilder {
	return b.Props(JSONObject{"values": values})
}

func (b *NodeBuilder) Errors(errors JSONObject) *NodeBuilder {
	return b.Props(JSONObject{"errors": errors})
}

func (b *NodeBuilder) Submit(action *ActionBuilder) *NodeBuilder {
	return b.Action("submit", action)
}

func (b *NodeBuilder) Cancel(action *ActionBuilder) *NodeBuilder {
	return b.Action("cancel", action)
}

func (b *NodeBuilder) Dirty(dirty bool) *NodeBuilder {
	return b.Props(JSONObject{"dirty": dirty})
}

func (b *NodeBuilder) Pending(pending bool) *NodeBuilder {
	return b.Props(JSONObject{"pending": pending})
}

func (b *NodeBuilder) LayoutPolicy(policy JSONObject) *NodeBuilder {
	return b.Props(JSONObject{"layoutPolicy": policy})
}

func (b *NodeBuilder) Adaptive(views JSONObject) *NodeBuilder {
	return b.Props(JSONObject{"adaptive": views})
}

func (b *NodeBuilder) Build() Node {
	return b.node
}

func (b *NodeBuilder) ensureMeta() *NodeMeta {
	if b.node.Meta == nil {
		b.node.Meta = &NodeMeta{}
	}
	return b.node.Meta
}

type ActionBuilder struct {
	ref ActionRef
}

func Action(kind ActionType, target string, label string) *ActionBuilder {
	return &ActionBuilder{ref: ActionRef{Type: kind, Target: target, Label: label}}
}

func Open(target, label string) *ActionBuilder     { return Action(ActionOpen, target, label) }
func Close(target string) *ActionBuilder           { return Action(ActionClose, target, "") }
func Navigate(target, label string) *ActionBuilder { return Action(ActionNavigate, target, label) }
func Mutation(target, label string) *ActionBuilder { return Action(ActionMutation, target, label) }
func Confirm(target, label string) *ActionBuilder  { return Action(ActionConfirm, target, label) }
func Refresh(target, label string) *ActionBuilder  { return Action(ActionRefresh, target, label) }
func Upload(target, label string) *ActionBuilder   { return Action(ActionUpload, target, label) }

func (b *ActionBuilder) Payload(payload JSONValue) *ActionBuilder {
	b.ref.Payload = payload
	return b
}

func (b *ActionBuilder) Options(options JSONObject) *ActionBuilder {
	if b.ref.Options == nil {
		b.ref.Options = JSONObject{}
	}
	for k, v := range options {
		b.ref.Options[k] = v
	}
	return b
}

func (b *ActionBuilder) Intent(intent ActionIntent) *ActionBuilder {
	b.ref.Intent = intent
	return b
}

func (b *ActionBuilder) Priority(priority ActionPriority) *ActionBuilder {
	b.ref.Priority = priority
	return b
}

func (b *ActionBuilder) Placement(placement ActionPlacement) *ActionBuilder {
	b.ref.Placement = placement
	return b
}

func (b *ActionBuilder) Presentation(presentation string) *ActionBuilder {
	b.ref.Presentation = presentation
	return b
}

func (b *ActionBuilder) ConfirmRequired() *ActionBuilder {
	b.ref.RequiresConfirmation = true
	return b
}

func (b *ActionBuilder) Disabled(disabled bool) *ActionBuilder {
	b.ref.Disabled = disabled
	return b
}

func (b *ActionBuilder) Loading(loading bool) *ActionBuilder {
	b.ref.Loading = loading
	return b
}

func (b *ActionBuilder) AccessibilityLabel(label string) *ActionBuilder {
	b.ref.AccessibilityLabel = label
	return b
}

func (b *ActionBuilder) Build() ActionRef {
	return b.ref
}

func Primary(target, label string) *ActionBuilder {
	return Mutation(target, label).Intent(IntentPrimary).Priority(PriorityPrimary)
}

func Secondary(target, label string) *ActionBuilder {
	return Mutation(target, label).Intent(IntentNeutral).Priority(PrioritySecondary)
}

func Danger(target, label string) *ActionBuilder {
	return Mutation(target, label).Intent(IntentDanger).Priority(PrioritySecondary).ConfirmRequired()
}

type QueryBuilder struct {
	ref QueryRef
}

func Query(id string, params JSONObject) *QueryBuilder {
	return &QueryBuilder{ref: QueryRef{ID: id, Params: params}}
}

func (b *QueryBuilder) Params(params JSONObject) *QueryBuilder {
	b.ref.Params = params
	return b
}

func (b *QueryBuilder) Build() QueryRef {
	return QueryRef{ID: b.ref.ID, Params: cloneObject(b.ref.Params)}
}

func Section(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeSection, merge(JSONObject{"title": title}, props), children...)
}

func Toolbar(actions ...*ActionBuilder) *NodeBuilder {
	return NodeOf(NodeToolbar, JSONObject{}).Actions(actions...)
}

func Panel(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodePanel, merge(JSONObject{"title": title}, props), children...)
}

func CardGrid(props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeCardGrid, props, children...)
}

func Tabs(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeTabs, merge(JSONObject{"id": id}, props)).ID(id)
}

func EditableList(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeEditableList, merge(JSONObject{"id": id}, props)).ID(id)
}

func MonthAvailabilityGrid(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeMonthAvailability, merge(JSONObject{"id": id}, props)).ID(id)
}

func PreviewFrame(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodePreviewFrame, merge(JSONObject{"id": id}, props)).ID(id)
}

func DiffView(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeDiffView, merge(JSONObject{"id": id}, props)).ID(id)
}

func Metric(label string, value JSONValue, props JSONObject) *NodeBuilder {
	return NodeOf(NodeMetricCard, merge(JSONObject{"label": label, "value": value}, props))
}

func SummaryCard(title string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeSummaryCard, merge(JSONObject{"title": title}, props), children...)
}

func EmptyState(title string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeEmptyState, merge(JSONObject{"title": title}, props))
}

func ImageGallery(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeImageGallery, merge(JSONObject{"id": id}, props)).ID(id)
}

func Markdown(markdown string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeMarkdownBlock, merge(JSONObject{"markdown": markdown}, props))
}

func ResourceList(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeResourceList, merge(JSONObject{"id": id}, props), children...)
}

func ResourceTable(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeResourceTable, merge(JSONObject{"id": id}, props)).ID(id)
}

func FilterBar(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeFilterBar, merge(JSONObject{"id": id}, props)).ID(id)
}

func SearchBox(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeSearchBox, merge(JSONObject{"id": id}, props)).ID(id)
}

func ResourceRow(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeResourceRow, merge(JSONObject{"id": id}, props)).ID(id)
}

func ResourceDetail(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeResourceDetail, merge(JSONObject{"id": id}, props), children...)
}

func Form(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeForm, merge(JSONObject{"id": id}, props), children...)
}

func FieldGroup(title string, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeFieldGroup, JSONObject{"title": title}, children...)
}

func TextField(name string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeTextField, merge(JSONObject{"name": name}, props))
}

func Drawer(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeDrawer, merge(JSONObject{"id": id, "presentation": "drawer"}, props), children...).Region(RegionDrawer)
}

func Modal(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeModal, merge(JSONObject{"id": id, "presentation": "modal"}, props), children...).Region(RegionModal)
}

func Sheet(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeSheet, merge(JSONObject{"id": id, "presentation": "sheet"}, props), children...).Region(RegionDrawer)
}

func DetailPanel(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeDetailPanel, merge(JSONObject{"id": id, "presentation": "detailPanel"}, props), children...).Region(RegionSide)
}

func InlinePanel(id string, props JSONObject, children ...*NodeBuilder) *NodeBuilder {
	return NodeOf(NodeInlinePanel, merge(JSONObject{"id": id, "presentation": "inlinePanel"}, props), children...)
}

func ConfirmDialog(id string, props JSONObject) *NodeBuilder {
	return NodeOf(NodeConfirmDialog, merge(JSONObject{"id": id, "presentation": "confirm"}, props)).Region(RegionModal)
}

func buildNodes(builders ...*NodeBuilder) []Node {
	nodes := make([]Node, 0, len(builders))
	for _, builder := range builders {
		if builder == nil {
			panic("admin dsl node builder must not be nil")
		}
		nodes = append(nodes, builder.Build())
	}
	return nodes
}

func merge(base JSONObject, extra JSONObject) JSONObject {
	out := JSONObject{}
	for k, v := range base {
		out[k] = v
	}
	for k, v := range extra {
		out[k] = v
	}
	return out
}

func clonePage(page Page) (Page, error) {
	data, err := json.Marshal(page)
	if err != nil {
		return Page{}, fmt.Errorf("marshal admin dsl page: %w", err)
	}
	var out Page
	if err := json.Unmarshal(data, &out); err != nil {
		return Page{}, fmt.Errorf("unmarshal admin dsl page clone: %w", err)
	}
	return out, nil
}

func cloneNode(node Node) Node {
	data, err := json.Marshal(node)
	if err != nil {
		panic(fmt.Errorf("marshal admin dsl node: %w", err))
	}
	var out Node
	if err := json.Unmarshal(data, &out); err != nil {
		panic(fmt.Errorf("unmarshal admin dsl node clone: %w", err))
	}
	return out
}

func cloneAction(action ActionRef) ActionRef {
	data, err := json.Marshal(action)
	if err != nil {
		panic(fmt.Errorf("marshal admin dsl action: %w", err))
	}
	var out ActionRef
	if err := json.Unmarshal(data, &out); err != nil {
		panic(fmt.Errorf("unmarshal admin dsl action clone: %w", err))
	}
	return out
}

func cloneObject(obj JSONObject) JSONObject {
	if obj == nil {
		return nil
	}
	data, err := json.Marshal(obj)
	if err != nil {
		panic(fmt.Errorf("marshal admin dsl object: %w", err))
	}
	var out JSONObject
	if err := json.Unmarshal(data, &out); err != nil {
		panic(fmt.Errorf("unmarshal admin dsl object clone: %w", err))
	}
	return out
}
