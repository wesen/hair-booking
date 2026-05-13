package dslgoja

// Page is the JSON contract rendered by the browser-side DSL interpreter.
// Keep field names aligned with web/src/page-dsl/schema.ts.
type Page struct {
	SchemaVersion int            `json:"schemaVersion"`
	ID            string         `json:"id"`
	Title         string         `json:"title"`
	Description   string         `json:"description,omitempty"`
	Shell         Shell          `json:"shell"`
	Nodes         []Node         `json:"nodes"`
	Meta          map[string]any `json:"meta,omitempty"`
}

type Shell struct {
	Kind  string         `json:"kind"`
	Props map[string]any `json:"props,omitempty"`
}

type Node struct {
	Kind     string         `json:"kind"`
	Props    map[string]any `json:"props,omitempty"`
	Children []Node         `json:"children,omitempty"`
	Meta     *NodeMeta      `json:"meta,omitempty"`
}

type NodeMeta struct {
	ID            string `json:"id,omitempty"`
	Name          string `json:"name,omitempty"`
	DataComponent string `json:"dataComponent,omitempty"`
	DataSection   string `json:"dataSection,omitempty"`
	DataPart      string `json:"dataPart,omitempty"`
	Note          string `json:"note,omitempty"`
}

// ActionRef is the opaque browser-visible reference to a server-side callback.
// The browser sends ID back on interaction; it never sees the Goja callback.
type ActionRef struct {
	ID    string `json:"id"`
	Event string `json:"event"`
}

// NodeActions is normally stored under node props as props.actions.
type NodeActions map[string]ActionRef

// Effect is an allow-listed side effect returned alongside a page.
type Effect struct {
	Kind    string         `json:"kind"`
	Tone    string         `json:"tone,omitempty"`
	Message string         `json:"message,omitempty"`
	Payload map[string]any `json:"payload,omitempty"`
}

type InteractionEvent struct {
	EventID     string         `json:"eventId"`
	SessionID   string         `json:"sessionId,omitempty"`
	PageVersion int64          `json:"pageVersion"`
	NodeID      string         `json:"nodeId"`
	NodeKind    string         `json:"nodeKind,omitempty"`
	ActionID    string         `json:"actionId"`
	Event       string         `json:"event"`
	Value       any            `json:"value,omitempty"`
	Meta        map[string]any `json:"meta,omitempty"`
}

type InteractionResult struct {
	SessionID   string   `json:"sessionId"`
	PageVersion int64    `json:"pageVersion"`
	Page        Page     `json:"page"`
	Effects     []Effect `json:"effects,omitempty"`
}

func NewPage(id, title string) Page {
	return Page{
		SchemaVersion: 1,
		ID:            id,
		Title:         title,
		Shell:         Shell{Kind: "bare"},
		Nodes:         []Node{},
	}
}
