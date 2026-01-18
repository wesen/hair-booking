package dsl

import (
	"regexp"
	"strings"
)

var (
	hrRegex  = regexp.MustCompile(`(\d+)\s*hr`)
	minRegex = regexp.MustCompile(`(\d+)\s*min`)
)

// ParseDuration converts a duration string into minutes.
func ParseDuration(duration string) ParsedDuration {
	original := duration
	minutes := 0

	if match := hrRegex.FindStringSubmatch(strings.ToLower(duration)); len(match) == 2 {
		minutes += atoi(match[1]) * 60
	}
	if match := minRegex.FindStringSubmatch(strings.ToLower(duration)); len(match) == 2 {
		minutes += atoi(match[1])
	}

	return ParsedDuration{Minutes: minutes, Original: original}
}

// HasCutService returns true if any selected service implies a cut.
func HasCutService(services []SelectedService) bool {
	for _, service := range services {
		if strings.Contains(strings.ToLower(service.Question), "cut") ||
			strings.Contains(strings.ToLower(service.SelectedOption.Label), "cut") {
			return true
		}
	}
	return false
}

// CalculateOptionPrice determines the price for an option based on state.
func CalculateOptionPrice(option DecisionTreeOption, state DecisionTreeState) int {
	if option.PriceWithCut != nil && HasCutService(state.Selected) {
		return *option.PriceWithCut
	}
	if option.Price != nil {
		return *option.Price
	}
	return 0
}

// CalculateOptionDuration resolves booking duration in minutes.
func CalculateOptionDuration(option DecisionTreeOption) int {
	if option.BooksFor != "" {
		return ParseDuration(option.BooksFor).Minutes
	}
	if option.Duration != "" {
		return ParseDuration(option.Duration).Minutes
	}
	return 0
}

// ApplyComboRules applies DSL rules and updates state.
func ApplyComboRules(tree DecisionTreeDSL, state DecisionTreeState) DecisionTreeState {
	if len(tree.Rules) == 0 {
		return state
	}

	newState := state
	applied := make([]string, 0, len(tree.Rules))

	for _, rule := range tree.Rules {
		if len(rule.IfServiceIncludes) > 0 {
			hasAll := true
			for _, svc := range rule.IfServiceIncludes {
				match := false
				for _, selected := range state.Selected {
					label := strings.ToLower(selected.SelectedOption.Label)
					question := strings.ToLower(selected.Question)
					if strings.Contains(label, strings.ToLower(svc)) || strings.Contains(question, strings.ToLower(svc)) {
						match = true
						break
					}
				}
				if !match {
					hasAll = false
					break
				}
			}
			if hasAll && rule.Then == "apply_combo_pricing" {
				applied = append(applied, "Combo discount: "+strings.Join(rule.IfServiceIncludes, " + "))
			}
		}

		if rule.IfService != "" {
			for _, selected := range state.Selected {
				if strings.Contains(strings.ToLower(selected.SelectedOption.Label), strings.ToLower(rule.IfService)) {
					if rule.Then == "apply_cut_discount" {
						applied = append(applied, "Cut discount applied for "+rule.IfService)
					}
					if rule.Duration != "" {
						newState.TotalDuration += ParseDuration(rule.Duration).Minutes
					}
					break
				}
			}
		}
	}

	newState.AppliedRules = append(newState.AppliedRules, applied...)
	return newState
}

// InitializeState constructs a fresh state for a tree.
func InitializeState(tree DecisionTreeDSL) DecisionTreeState {
	return DecisionTreeState{
		CurrentNodeID: tree.Root,
		Selected:      nil,
		TotalPrice:    0,
		TotalDuration: 0,
		AppliedRules:  nil,
	}
}

// SelectOption advances the state with a selected option.
func SelectOption(tree DecisionTreeDSL, state DecisionTreeState, option DecisionTreeOption) DecisionTreeState {
	node, ok := tree.Nodes[state.CurrentNodeID]
	if !ok {
		return state
	}

	price := CalculateOptionPrice(option, state)
	duration := CalculateOptionDuration(option)

	selected := SelectedService{
		NodeID:         state.CurrentNodeID,
		Question:       node.Question,
		SelectedOption: option,
		Price:          price,
		Duration:       duration,
	}

	next := state.CurrentNodeID
	if option.Next != "" {
		next = option.Next
	}

	newState := DecisionTreeState{
		CurrentNodeID: next,
		Selected:      append(append([]SelectedService{}, state.Selected...), selected),
		TotalPrice:    state.TotalPrice + price,
		TotalDuration: state.TotalDuration + duration,
		AppliedRules:  append([]string{}, state.AppliedRules...),
	}

	return ApplyComboRules(tree, newState)
}

// IsTerminalNode returns true if the node is terminal.
func IsTerminalNode(tree DecisionTreeDSL, nodeID string) bool {
	node, ok := tree.Nodes[nodeID]
	if !ok {
		return false
	}
	return node.Type == "terminal"
}

// FormatDuration formats minutes for display.
func FormatDuration(minutes int) string {
	if minutes < 60 {
		return itoa(minutes) + "min"
	}
	hours := minutes / 60
	mins := minutes % 60
	if mins == 0 {
		return itoa(hours) + "hr"
	}
	return itoa(hours) + "hr " + itoa(mins) + "min"
}

func atoi(value string) int {
	var result int
	for _, char := range value {
		result = result*10 + int(char-'0')
	}
	return result
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}

	neg := false
	if value < 0 {
		neg = true
		value = -value
	}

	var digits [20]byte
	idx := len(digits)
	for value > 0 {
		idx--
		digits[idx] = byte('0' + value%10)
		value /= 10
	}

	if neg {
		idx--
		digits[idx] = '-'
	}

	return string(digits[idx:])
}
