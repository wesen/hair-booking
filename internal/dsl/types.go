package dsl

// DecisionTreeOption defines an option in a decision tree node.
type DecisionTreeOption struct {
	Label        string `yaml:"label" json:"label"`
	Price        *int   `yaml:"price,omitempty" json:"price,omitempty"`
	PriceWithCut *int   `yaml:"price_with_cut,omitempty" json:"price_with_cut,omitempty"`
	Duration     string `yaml:"duration,omitempty" json:"duration,omitempty"`
	BooksFor     string `yaml:"books_for,omitempty" json:"books_for,omitempty"`
	Note         string `yaml:"note,omitempty" json:"note,omitempty"`
	Next         string `yaml:"next,omitempty" json:"next,omitempty"`
}

// DecisionTreeNode defines a node in the decision tree.
type DecisionTreeNode struct {
	Question string               `yaml:"question,omitempty" json:"question,omitempty"`
	Optional bool                 `yaml:"optional,omitempty" json:"optional,omitempty"`
	Options  []DecisionTreeOption `yaml:"options,omitempty" json:"options,omitempty"`
	Type     string               `yaml:"type,omitempty" json:"type,omitempty"`
	Action   string               `yaml:"action,omitempty" json:"action,omitempty"`
}

// DecisionTreeRule defines conditional rules for pricing/duration.
type DecisionTreeRule struct {
	IfServiceIncludes []string `yaml:"if_service_includes,omitempty" json:"if_service_includes,omitempty"`
	IfService         string   `yaml:"if_service,omitempty" json:"if_service,omitempty"`
	Duration          string   `yaml:"duration,omitempty" json:"duration,omitempty"`
	Then              string   `yaml:"then" json:"then"`
}

// DecisionTreeDSL is the top-level DSL document.
type DecisionTreeDSL struct {
	Name  string                      `yaml:"name" json:"name"`
	Root  string                      `yaml:"root" json:"root"`
	Nodes map[string]DecisionTreeNode `yaml:"nodes" json:"nodes"`
	Rules []DecisionTreeRule          `yaml:"rules,omitempty" json:"rules,omitempty"`
}

// DecisionTreeState tracks runtime state while navigating a tree.
type DecisionTreeState struct {
	CurrentNodeID string            `json:"currentNodeId"`
	Selected      []SelectedService `json:"selectedServices"`
	TotalPrice    int               `json:"totalPrice"`
	TotalDuration int               `json:"totalDuration"`
	AppliedRules  []string          `json:"appliedRules"`
}

// SelectedService records a selected option and computed totals.
type SelectedService struct {
	NodeID         string             `json:"nodeId"`
	Question       string             `json:"question"`
	SelectedOption DecisionTreeOption `json:"selectedOption"`
	Price          int                `json:"price"`
	Duration       int                `json:"duration"`
}

// ParsedDuration is a parsed duration in minutes with the original value.
type ParsedDuration struct {
	Minutes  int
	Original string
}
