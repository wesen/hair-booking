package admindsl

// JSONValue is the transport-safe value set allowed in Admin DSL props,
// payloads, and metadata. Builders validate recursively before serialization.
type JSONValue = any

type JSONObject map[string]JSONValue

type ShellKind string

const (
	ShellAdmin     ShellKind = "admin"
	ShellDashboard ShellKind = "dashboard"
	ShellResource  ShellKind = "resource"
	ShellCalendar  ShellKind = "calendar"
	ShellSettings  ShellKind = "settings"
	ShellBare      ShellKind = "bare"
)

type NodeKind string

const (
	NodeSection           NodeKind = "section"
	NodeToolbar           NodeKind = "toolbar"
	NodeCardGrid          NodeKind = "cardGrid"
	NodePanel             NodeKind = "panel"
	NodeSplitPane         NodeKind = "splitPane"
	NodeTabs              NodeKind = "tabs"
	NodeMetricCard        NodeKind = "metricCard"
	NodeSummaryCard       NodeKind = "summaryCard"
	NodeStatusBadge       NodeKind = "statusBadge"
	NodeActivityFeed      NodeKind = "activityFeed"
	NodeKVList            NodeKind = "kvList"
	NodeImageGrid         NodeKind = "imageGrid"
	NodeMarkdownBlock     NodeKind = "markdownBlock"
	NodeEmptyState        NodeKind = "emptyState"
	NodeLoadingState      NodeKind = "loadingState"
	NodeInlineError       NodeKind = "inlineError"
	NodeResourcePage      NodeKind = "resourcePage"
	NodeResourceList      NodeKind = "resourceList"
	NodeResourceRow       NodeKind = "resourceRow"
	NodeResourceDetail    NodeKind = "resourceDetail"
	NodeFilterBar         NodeKind = "filterBar"
	NodeSearchBox         NodeKind = "searchBox"
	NodeActionMenu        NodeKind = "actionMenu"
	NodeForm              NodeKind = "form"
	NodeFieldGroup        NodeKind = "fieldGroup"
	NodeTextField         NodeKind = "textField"
	NodeTextareaField     NodeKind = "textareaField"
	NodeMoneyField        NodeKind = "moneyField"
	NodeDurationField     NodeKind = "durationField"
	NodeDateField         NodeKind = "dateField"
	NodeTimeField         NodeKind = "timeField"
	NodeSelectField       NodeKind = "selectField"
	NodeSwitchField       NodeKind = "switchField"
	NodeImageField        NodeKind = "imageField"
	NodeSaveBar           NodeKind = "saveBar"
	NodeCalendarWeek      NodeKind = "calendarWeek"
	NodeAppointmentBlock  NodeKind = "appointmentBlock"
	NodeAvailabilityBlock NodeKind = "availabilityBlock"
	NodeTimeOffBlock      NodeKind = "timeOffBlock"
	NodeModal             NodeKind = "modal"
	NodeDrawer            NodeKind = "drawer"
	NodeSheet             NodeKind = "sheet"
	NodeDetailPanel       NodeKind = "detailPanel"
	NodeInlinePanel       NodeKind = "inlinePanel"
	NodeConfirmDialog     NodeKind = "confirmDialog"
)

type Region string

const (
	RegionMain    Region = "main"
	RegionSide    Region = "side"
	RegionToolbar Region = "toolbar"
	RegionModal   Region = "modal"
	RegionDrawer  Region = "drawer"
)

type ActionType string

const (
	ActionOpen     ActionType = "open"
	ActionClose    ActionType = "close"
	ActionNavigate ActionType = "navigate"
	ActionMutation ActionType = "mutation"
	ActionConfirm  ActionType = "confirm"
	ActionRefresh  ActionType = "refresh"
	ActionUpload   ActionType = "upload"
)

type ActionIntent string

const (
	IntentNeutral ActionIntent = "neutral"
	IntentPrimary ActionIntent = "primary"
	IntentDanger  ActionIntent = "danger"
)

type ActionPriority string

const (
	PriorityPrimary   ActionPriority = "primary"
	PrioritySecondary ActionPriority = "secondary"
	PriorityTertiary  ActionPriority = "tertiary"
)

type ActionPlacement string

const (
	PlacementToolbar  ActionPlacement = "toolbar"
	PlacementRow      ActionPlacement = "row"
	PlacementFooter   ActionPlacement = "footer"
	PlacementDetail   ActionPlacement = "detail"
	PlacementOverflow ActionPlacement = "overflow"
)

type Shell struct {
	Kind  ShellKind  `json:"kind"`
	Props JSONObject `json:"props,omitempty"`
}

type NodeMeta struct {
	ID            string `json:"id,omitempty"`
	Name          string `json:"name,omitempty"`
	Region        Region `json:"region,omitempty"`
	DataComponent string `json:"dataComponent,omitempty"`
	DataSection   string `json:"dataSection,omitempty"`
	DataPart      string `json:"dataPart,omitempty"`
	Note          string `json:"note,omitempty"`
}

type Node struct {
	Kind     NodeKind   `json:"kind"`
	Props    JSONObject `json:"props,omitempty"`
	Children []Node     `json:"children,omitempty"`
	Meta     *NodeMeta  `json:"meta,omitempty"`
}

type PageMeta struct {
	StoryTitle string   `json:"storyTitle,omitempty"`
	Tags       []string `json:"tags,omitempty"`
	Source     string   `json:"source,omitempty"`
	Notes      []string `json:"notes,omitempty"`
}

type Page struct {
	SchemaVersion int      `json:"schemaVersion"`
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description,omitempty"`
	Shell         Shell    `json:"shell"`
	Nodes         []Node   `json:"nodes"`
	Modals        []Node   `json:"modals,omitempty"`
	Drawers       []Node   `json:"drawers,omitempty"`
	Meta          PageMeta `json:"meta,omitempty"`
}

type ActionRef struct {
	ID                   string          `json:"id,omitempty"`
	Event                string          `json:"event,omitempty"`
	Type                 ActionType      `json:"type"`
	Target               string          `json:"target"`
	Label                string          `json:"label,omitempty"`
	Payload              JSONValue       `json:"payload,omitempty"`
	Options              JSONObject      `json:"options,omitempty"`
	Intent               ActionIntent    `json:"intent,omitempty"`
	Priority             ActionPriority  `json:"priority,omitempty"`
	Placement            ActionPlacement `json:"placement,omitempty"`
	Presentation         string          `json:"presentation,omitempty"`
	RequiresConfirmation bool            `json:"requiresConfirmation,omitempty"`
	Disabled             bool            `json:"disabled,omitempty"`
	Loading              bool            `json:"loading,omitempty"`
	AccessibilityLabel   string          `json:"accessibilityLabel,omitempty"`
}

type QueryRef struct {
	ID     string     `json:"id"`
	Params JSONObject `json:"params,omitempty"`
}
