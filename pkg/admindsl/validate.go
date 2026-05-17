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
		if err := ValidateNodeForSchema(page.SchemaVersion, node); err != nil {
			return fmt.Errorf("nodes[%d]: %w", i, err)
		}
		if err := collectSurfaceIDs(surfaceIDs, fmt.Sprintf("nodes[%d]", i), node); err != nil {
			return err
		}
	}
	for i, node := range page.Modals {
		if err := ValidateNodeForSchema(page.SchemaVersion, node); err != nil {
			return fmt.Errorf("modals[%d]: %w", i, err)
		}
		if err := collectSurfaceIDs(surfaceIDs, fmt.Sprintf("modals[%d]", i), node); err != nil {
			return err
		}
	}
	for i, node := range page.Drawers {
		if err := ValidateNodeForSchema(page.SchemaVersion, node); err != nil {
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
	return ValidateNodeForSchema(1, node)
}

func ValidateNodeForSchema(schemaVersion int, node Node) error {
	if _, ok := allowedNodeKinds[node.Kind]; !ok {
		return fmt.Errorf("invalid node kind %q", node.Kind)
	}
	if err := validateJSONValue("props", node.Props); err != nil {
		return err
	}
	if err := validateNodeActions(node); err != nil {
		return err
	}
	if schemaVersion == 2 {
		if err := validateV2NodeShape(node); err != nil {
			return err
		}
	}
	for i, child := range node.Children {
		if err := ValidateNodeForSchema(schemaVersion, child); err != nil {
			return fmt.Errorf("children[%d]: %w", i, err)
		}
	}
	return nil
}

func validateNodeActions(node Node) error {
	for _, key := range []string{"actions", "footerActions", "toolbarActions", "bulkActions"} {
		if err := validateActions(node.Props[key]); err != nil {
			return fmt.Errorf("%s: %w", key, err)
		}
	}
	return nil
}

func validateV2NodeShape(node Node) error {
	switch node.Kind {
	case NodePageHeader:
		if stringProp(node.Props, "title") == "" {
			return fmt.Errorf("pageHeader requires props.title")
		}
	case NodeDashboardGrid:
		if columns := objectProp(node.Props, "columns"); columns != nil {
			if desktop, ok := numericProp(columns, "desktop"); ok && desktop <= 0 {
				return fmt.Errorf("dashboardGrid columns.desktop must be positive")
			}
		}
		for i, child := range node.Children {
			if err := validateV2Layout(fmt.Sprintf("dashboardGrid.children[%d]", i), child.Props); err != nil {
				return err
			}
		}
	case NodePanel:
		if stringProp(node.Props, "title") == "" && stringProp(node.Props, "ariaLabel") == "" {
			return fmt.Errorf("panel requires props.title or props.ariaLabel")
		}
		if density := stringProp(node.Props, "density"); density != "" {
			if density != "compact" && density != "normal" && density != "spacious" {
				return fmt.Errorf("panel density must be compact, normal, or spacious")
			}
		}
		if err := validateV2Layout("panel", node.Props); err != nil {
			return err
		}
	case NodeResourceTable:
		columns := arrayProp(node.Props, "columns")
		if len(columns) == 0 {
			return fmt.Errorf("resourceTable requires non-empty props.columns")
		}
		for i, column := range columns {
			columnObj, ok := asObject(column)
			if !ok {
				return fmt.Errorf("resourceTable columns[%d] must be object", i)
			}
			if stringProp(columnObj, "id") == "" {
				return fmt.Errorf("resourceTable columns[%d] requires id", i)
			}
		}
		rows := arrayProp(node.Props, "rows")
		rowIDKey := stringProp(node.Props, "rowId")
		if rowIDKey == "" {
			rowIDKey = "id"
		}
		for i, row := range rows {
			rowObj, ok := asObject(row)
			if !ok {
				return fmt.Errorf("resourceTable rows[%d] must be object", i)
			}
			if stringProp(rowObj, rowIDKey) == "" {
				return fmt.Errorf("resourceTable rows[%d] requires %q", i, rowIDKey)
			}
			if err := validateActions(rowObj["actions"]); err != nil {
				return fmt.Errorf("resourceTable rows[%d].actions: %w", i, err)
			}
		}
	case NodeComparisonTable:
		rows := arrayProp(node.Props, "rows")
		if len(rows) == 0 {
			return fmt.Errorf("comparisonTable requires non-empty props.rows")
		}
		for i, row := range rows {
			rowObj, ok := asObject(row)
			if !ok {
				return fmt.Errorf("comparisonTable rows[%d] must be object", i)
			}
			for _, key := range []string{"id", "field", "current", "draft"} {
				if stringProp(rowObj, key) == "" {
					return fmt.Errorf("comparisonTable rows[%d] requires %q", i, key)
				}
			}
			if err := validateActions(rowObj["actions"]); err != nil {
				return fmt.Errorf("comparisonTable rows[%d].actions: %w", i, err)
			}
		}
	case NodeMonthCalendar:
		if stringProp(node.Props, "month") == "" {
			return fmt.Errorf("monthCalendar requires props.month")
		}
		if actions := objectProp(node.Props, "actions"); actions != nil {
			for slot, item := range actions {
				action, err := actionFromJSONValue(item)
				if err != nil {
					return fmt.Errorf("monthCalendar actions[%q]: %w", slot, err)
				}
				if err := ValidateAction(action); err != nil {
					return fmt.Errorf("monthCalendar actions[%q]: %w", slot, err)
				}
			}
		}
	case NodeForm:
		for i, child := range node.Children {
			if isFieldKind(child.Kind) {
				if err := validateV2Field(fmt.Sprintf("form.children[%d]", i), child); err != nil {
					return err
				}
			}
		}
	case NodeTextField, NodeTextareaField, NodeMoneyField, NodeDurationField, NodeDateField, NodeTimeField, NodeSelectField, NodeSwitchField, NodeImageField:
		return validateV2Field(string(node.Kind), node)
	}
	return nil
}

func validateV2Layout(path string, props JSONObject) error {
	layout := objectProp(props, "layout")
	if layout == nil {
		return nil
	}
	span := objectProp(layout, "span")
	for _, key := range []string{"desktop", "tablet", "mobile"} {
		if value, ok := numericProp(span, key); ok && value <= 0 {
			return fmt.Errorf("%s layout.span.%s must be positive", path, key)
		}
	}
	return nil
}

func isFieldKind(kind NodeKind) bool {
	switch kind {
	case NodeTextField, NodeTextareaField, NodeMoneyField, NodeDurationField, NodeDateField, NodeTimeField, NodeSelectField, NodeSwitchField, NodeImageField:
		return true
	default:
		return false
	}
}

func validateV2Field(path string, node Node) error {
	name := stringProp(node.Props, "name")
	if name == "" {
		return fmt.Errorf("%s requires props.name", path)
	}
	if stringProp(node.Props, "label") == "" {
		return fmt.Errorf("%s requires props.label", path)
	}
	value, hasValue := node.Props["value"]
	if !hasValue || value == nil {
		return nil
	}
	switch node.Kind {
	case NodeSwitchField:
		if _, ok := value.(bool); !ok {
			return fmt.Errorf("%s switchField value must be boolean", path)
		}
	case NodeSelectField:
		if _, ok := value.(string); !ok {
			return fmt.Errorf("%s selectField value must be string", path)
		}
	case NodeMoneyField, NodeDurationField:
		switch value.(type) {
		case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64, float32, float64:
		default:
			return fmt.Errorf("%s %s value must be numeric", path, node.Kind)
		}
	}
	return nil
}

func asObject(value JSONValue) (JSONObject, bool) {
	switch obj := value.(type) {
	case JSONObject:
		return obj, true
	case map[string]any:
		return JSONObject(obj), true
	default:
		return nil, false
	}
}

func objectProp(props JSONObject, key string) JSONObject {
	if props == nil {
		return nil
	}
	obj, _ := asObject(props[key])
	return obj
}

func arrayProp(props JSONObject, key string) []JSONValue {
	if props == nil {
		return nil
	}
	switch values := props[key].(type) {
	case []JSONValue:
		return values
	default:
		return nil
	}
}

func stringProp(props JSONObject, key string) string {
	if props == nil {
		return ""
	}
	value, _ := props[key].(string)
	return value
}

func numericProp(props JSONObject, key string) (float64, bool) {
	if props == nil {
		return 0, false
	}
	switch value := props[key].(type) {
	case int:
		return float64(value), true
	case int8:
		return float64(value), true
	case int16:
		return float64(value), true
	case int32:
		return float64(value), true
	case int64:
		return float64(value), true
	case uint:
		return float64(value), true
	case uint8:
		return float64(value), true
	case uint16:
		return float64(value), true
	case uint32:
		return float64(value), true
	case uint64:
		return float64(value), true
	case float32:
		return float64(value), true
	case float64:
		return value, true
	default:
		return 0, false
	}
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
