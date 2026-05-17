package admindsl

import (
	"fmt"
	"math"
)

var allowedShellKinds = map[ShellKind]struct{}{
	ShellAdmin: {}, ShellDashboard: {}, ShellResource: {}, ShellCalendar: {}, ShellSettings: {}, ShellBare: {},
}

var allowedNodeKinds = map[NodeKind]struct{}{
	NodePageHeader: {}, NodeDashboardGrid: {}, NodeSection: {}, NodeToolbar: {}, NodeCardGrid: {}, NodePanel: {}, NodeSplitPane: {}, NodeTabs: {}, NodeEditableList: {}, NodeMonthAvailability: {}, NodePreviewFrame: {}, NodeComparisonTable: {}, NodeMonthCalendar: {}, NodeDiffView: {},
	NodeMetricCard: {}, NodeSummaryCard: {}, NodeStatusBadge: {}, NodeActivityFeed: {}, NodeKVList: {}, NodeImageGrid: {}, NodeImageGallery: {}, NodeMarkdownBlock: {}, NodeEmptyState: {}, NodeLoadingState: {}, NodeInlineError: {},
	NodeResourcePage: {}, NodeResourceList: {}, NodeResourceTable: {}, NodeResourceRow: {}, NodeResourceDetail: {}, NodeFilterBar: {}, NodeSearchBox: {}, NodeActionMenu: {},
	NodeForm: {}, NodeFieldGroup: {}, NodeTextField: {}, NodeTextareaField: {}, NodeMoneyField: {}, NodeDurationField: {}, NodeDateField: {}, NodeTimeField: {}, NodeSelectField: {}, NodeSwitchField: {}, NodeImageField: {}, NodeSaveBar: {},
	NodeCalendarWeek: {}, NodeAppointmentBlock: {}, NodeAvailabilityBlock: {}, NodeTimeOffBlock: {},
	NodeModal: {}, NodeDrawer: {}, NodeSheet: {}, NodeDetailPanel: {}, NodeInlinePanel: {}, NodeConfirmDialog: {},
}

var allowedActionTypes = map[ActionType]struct{}{
	ActionOpen: {}, ActionClose: {}, ActionNavigate: {}, ActionMutation: {}, ActionConfirm: {}, ActionRefresh: {}, ActionUpload: {},
}

var allowedActionIntents = map[ActionIntent]struct{}{
	"": {}, IntentNeutral: {}, IntentPrimary: {}, IntentDanger: {},
}

var allowedActionPriorities = map[ActionPriority]struct{}{
	"": {}, PriorityPrimary: {}, PrioritySecondary: {}, PriorityTertiary: {},
}

var allowedActionPlacements = map[ActionPlacement]struct{}{
	"": {}, PlacementToolbar: {}, PlacementPageHeader: {}, PlacementPanelToolbar: {}, PlacementPanelFooter: {}, PlacementRow: {}, PlacementRowOverflow: {}, PlacementBulkToolbar: {}, PlacementFormFooter: {}, PlacementCalendarCell: {}, PlacementSidebarNav: {}, PlacementFooter: {}, PlacementDetail: {}, PlacementOverflow: {},
}

func ValidatePage(page Page) error {
	if page.SchemaVersion != 1 && page.SchemaVersion != 2 {
		return fmt.Errorf("admin dsl page schemaVersion must be 1 or 2, got %d", page.SchemaVersion)
	}
	if page.ID == "" {
		return fmt.Errorf("admin dsl page id is required")
	}
	if page.Title == "" {
		return fmt.Errorf("admin dsl page title is required")
	}
	if _, ok := allowedShellKinds[page.Shell.Kind]; !ok {
		return fmt.Errorf("admin dsl page %q has invalid shell kind %q", page.ID, page.Shell.Kind)
	}
	if err := validateJSONValue("shell.props", page.Shell.Props); err != nil {
		return err
	}
	surfaceIDs := map[string]string{}
	for i, node := range page.Nodes {
		if err := ValidateNode(node); err != nil {
			return fmt.Errorf("nodes[%d]: %w", i, err)
		}
		if err := collectSurfaceIDs(surfaceIDs, fmt.Sprintf("nodes[%d]", i), node); err != nil {
			return err
		}
	}
	for i, node := range page.Modals {
		if err := ValidateNode(node); err != nil {
			return fmt.Errorf("modals[%d]: %w", i, err)
		}
		if err := collectSurfaceIDs(surfaceIDs, fmt.Sprintf("modals[%d]", i), node); err != nil {
			return err
		}
	}
	for i, node := range page.Drawers {
		if err := ValidateNode(node); err != nil {
			return fmt.Errorf("drawers[%d]: %w", i, err)
		}
		if err := collectSurfaceIDs(surfaceIDs, fmt.Sprintf("drawers[%d]", i), node); err != nil {
			return err
		}
	}
	return nil
}

func collectSurfaceIDs(seen map[string]string, path string, node Node) error {
	if isSurfaceKind(node.Kind) {
		id, _ := node.Props["id"].(string)
		if id == "" {
			return fmt.Errorf("%s: surface %q requires props.id", path, node.Kind)
		}
		if previous, ok := seen[id]; ok {
			return fmt.Errorf("%s: duplicate surface id %q already used at %s", path, id, previous)
		}
		seen[id] = path
	}
	for i, child := range node.Children {
		if err := collectSurfaceIDs(seen, fmt.Sprintf("%s.children[%d]", path, i), child); err != nil {
			return err
		}
	}
	return nil
}

func isSurfaceKind(kind NodeKind) bool {
	switch kind {
	case NodeModal, NodeDrawer, NodeSheet, NodeDetailPanel, NodeInlinePanel, NodeConfirmDialog:
		return true
	default:
		return false
	}
}

func ValidateNode(node Node) error {
	if _, ok := allowedNodeKinds[node.Kind]; !ok {
		return fmt.Errorf("invalid node kind %q", node.Kind)
	}
	if err := validateJSONValue("props", node.Props); err != nil {
		return err
	}
	if err := validateActions(node.Props["actions"]); err != nil {
		return err
	}
	for i, child := range node.Children {
		if err := ValidateNode(child); err != nil {
			return fmt.Errorf("children[%d]: %w", i, err)
		}
	}
	return nil
}

func ValidateAction(action ActionRef) error {
	if _, ok := allowedActionTypes[action.Type]; !ok {
		return fmt.Errorf("invalid action type %q", action.Type)
	}
	if action.Target == "" {
		return fmt.Errorf("action target is required")
	}
	if _, ok := allowedActionIntents[action.Intent]; !ok {
		return fmt.Errorf("invalid action intent %q", action.Intent)
	}
	if _, ok := allowedActionPriorities[action.Priority]; !ok {
		return fmt.Errorf("invalid action priority %q", action.Priority)
	}
	if _, ok := allowedActionPlacements[action.Placement]; !ok {
		return fmt.Errorf("invalid action placement %q", action.Placement)
	}
	if err := validateJSONValue("action.payload", action.Payload); err != nil {
		return err
	}
	if err := validateJSONValue("action.options", action.Options); err != nil {
		return err
	}
	return nil
}

func validateActions(value JSONValue) error {
	if value == nil {
		return nil
	}
	switch actions := value.(type) {
	case []JSONValue:
		for i, item := range actions {
			action, err := actionFromJSONValue(item)
			if err != nil {
				return fmt.Errorf("actions[%d]: %w", i, err)
			}
			if err := ValidateAction(action); err != nil {
				return fmt.Errorf("actions[%d]: %w", i, err)
			}
		}
	case []ActionRef:
		for i, action := range actions {
			if err := ValidateAction(action); err != nil {
				return fmt.Errorf("actions[%d]: %w", i, err)
			}
		}
	case JSONObject:
		for slot, item := range actions {
			action, err := actionFromJSONValue(item)
			if err != nil {
				return fmt.Errorf("actions[%q]: %w", slot, err)
			}
			if err := ValidateAction(action); err != nil {
				return fmt.Errorf("actions[%q]: %w", slot, err)
			}
		}
	case map[string]any:
		for slot, item := range actions {
			action, err := actionFromJSONValue(item)
			if err != nil {
				return fmt.Errorf("actions[%q]: %w", slot, err)
			}
			if err := ValidateAction(action); err != nil {
				return fmt.Errorf("actions[%q]: %w", slot, err)
			}
		}
	default:
		return fmt.Errorf("actions must be an array or keyed object, got %T", value)
	}
	return nil
}

func actionFromJSONValue(value JSONValue) (ActionRef, error) {
	switch action := value.(type) {
	case ActionRef:
		return action, nil
	case JSONObject:
		return actionFromObject(action)
	case map[string]any:
		return actionFromObject(JSONObject(action))
	default:
		return ActionRef{}, fmt.Errorf("action must be object, got %T", value)
	}
}

func actionFromObject(obj JSONObject) (ActionRef, error) {
	typeRaw, _ := obj["type"].(string)
	target, _ := obj["target"].(string)
	label, _ := obj["label"].(string)
	intent, _ := obj["intent"].(string)
	priority, _ := obj["priority"].(string)
	placement, _ := obj["placement"].(string)
	presentation, _ := obj["presentation"].(string)
	accessibilityLabel, _ := obj["accessibilityLabel"].(string)
	requiresConfirmation, _ := obj["requiresConfirmation"].(bool)
	disabled, _ := obj["disabled"].(bool)
	loading, _ := obj["loading"].(bool)
	options, _ := obj["options"].(JSONObject)
	if options == nil {
		if m, ok := obj["options"].(map[string]any); ok {
			options = JSONObject(m)
		}
	}
	return ActionRef{
		Type: ActionType(typeRaw), Target: target, Label: label, Payload: obj["payload"], Options: options,
		Intent: ActionIntent(intent), Priority: ActionPriority(priority), Placement: ActionPlacement(placement), Presentation: presentation,
		RequiresConfirmation: requiresConfirmation, Disabled: disabled, Loading: loading, AccessibilityLabel: accessibilityLabel,
	}, nil
}

func validateJSONValue(path string, value JSONValue) error {
	switch v := value.(type) {
	case nil, string, bool:
		return nil
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return nil
	case float32:
		if math.IsInf(float64(v), 0) || math.IsNaN(float64(v)) {
			return fmt.Errorf("%s must be finite JSON number", path)
		}
		return nil
	case float64:
		if math.IsInf(v, 0) || math.IsNaN(v) {
			return fmt.Errorf("%s must be finite JSON number", path)
		}
		return nil
	case JSONObject:
		for key, child := range v {
			if err := validateJSONValue(path+"."+key, child); err != nil {
				return err
			}
		}
		return nil
	case map[string]any:
		for key, child := range v {
			if err := validateJSONValue(path+"."+key, child); err != nil {
				return err
			}
		}
		return nil
	case []JSONValue:
		for i, child := range v {
			if err := validateJSONValue(fmt.Sprintf("%s[%d]", path, i), child); err != nil {
				return err
			}
		}
		return nil
	case ActionRef:
		return ValidateAction(v)
	case QueryRef:
		return validateJSONValue(path+".params", v.Params)
	default:
		return fmt.Errorf("%s contains non-json value of type %T", path, value)
	}
}
