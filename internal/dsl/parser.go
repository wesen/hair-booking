package dsl

import (
	"fmt"
	"regexp"

	"gopkg.in/yaml.v3"
)

// ParseError describes a DSL parsing/validation error.
type ParseError struct {
	Message string
}

func (e *ParseError) Error() string {
	return e.Message
}

// ValidationIssue captures a structured validation problem.
type ValidationIssue struct {
	Code        string `json:"code"`
	Message     string `json:"message"`
	NodeID      string `json:"nodeId,omitempty"`
	OptionLabel string `json:"optionLabel,omitempty"`
	Line        int    `json:"line,omitempty"`
	Column      int    `json:"column,omitempty"`
}

type position struct {
	Line   int
	Column int
}

type treePositions struct {
	Name        *position
	Root        *position
	Nodes       map[string]position
	OptionLabel map[string]map[string]position
	OptionIndex map[string]map[int]position
}

// ParseDSL parses and validates a YAML DSL document.
func ParseDSL(content string) (DecisionTreeDSL, error) {
	parsed, positions, err := parseWithPositions(content)
	if err != nil {
		return DecisionTreeDSL{}, err
	}

	issues := validateTree(parsed, positions)
	if len(issues) > 0 {
		issue := issues[0]
		return DecisionTreeDSL{}, &ParseError{Message: issue.Message}
	}

	return parsed, nil
}

// ValidateDSL parses and returns a validation result for UI consumption.
func ValidateDSL(content string) (bool, []string) {
	valid, issues := ValidateDSLWithIssues(content)
	if valid {
		return true, nil
	}
	messages := make([]string, 0, len(issues))
	for _, issue := range issues {
		messages = append(messages, issue.Message)
	}
	return false, messages
}

// ValidateDSLWithIssues returns structured validation issues for UI and API consumers.
func ValidateDSLWithIssues(content string) (bool, []ValidationIssue) {
	parsed, positions, err := parseWithPositions(content)
	if err != nil {
		if parseErr, ok := err.(*ParseError); ok {
			line, column := parseYAMLErrorLocation(parseErr.Message)
			return false, []ValidationIssue{{
				Code:    "YAML_PARSE_ERROR",
				Message: parseErr.Message,
				Line:    line,
				Column:  column,
			}}
		}
		return false, []ValidationIssue{{
			Code:    "YAML_PARSE_ERROR",
			Message: err.Error(),
		}}
	}

	issues := validateTree(parsed, positions)
	return len(issues) == 0, issues
}

func parseWithPositions(content string) (DecisionTreeDSL, treePositions, error) {
	var doc yaml.Node
	if err := yaml.Unmarshal([]byte(content), &doc); err != nil {
		line, _ := parseYAMLErrorLocation(err.Error())
		return DecisionTreeDSL{}, treePositions{}, &ParseError{Message: fmt.Sprintf("failed to parse DSL: %s (line %d)", err.Error(), line)}
	}

	var parsed DecisionTreeDSL
	if err := doc.Decode(&parsed); err != nil {
		line, _ := parseYAMLErrorLocation(err.Error())
		return DecisionTreeDSL{}, treePositions{}, &ParseError{Message: fmt.Sprintf("failed to decode DSL: %s (line %d)", err.Error(), line)}
	}

	positions := extractPositions(&doc)
	return parsed, positions, nil
}

func validateTree(tree DecisionTreeDSL, positions treePositions) []ValidationIssue {
	var issues []ValidationIssue

	if tree.Name == "" {
		issue := ValidationIssue{Code: "NAME_REQUIRED", Message: "missing required field: name"}
		applyPosition(&issue, positions.Name)
		issues = append(issues, issue)
	}
	if tree.Root == "" {
		issue := ValidationIssue{Code: "ROOT_REQUIRED", Message: "missing required field: root"}
		applyPosition(&issue, positions.Root)
		issues = append(issues, issue)
	}
	if tree.Nodes == nil || len(tree.Nodes) == 0 {
		issue := ValidationIssue{Code: "NODES_REQUIRED", Message: "missing or invalid required field: nodes"}
		issues = append(issues, issue)
		return issues
	}
	if tree.Root != "" {
		if _, ok := tree.Nodes[tree.Root]; !ok {
			issue := ValidationIssue{
				Code:    "ROOT_NOT_FOUND",
				Message: fmt.Sprintf("root node \"%s\" not found in nodes", tree.Root),
			}
			applyPosition(&issue, positions.Root)
			issues = append(issues, issue)
		}
	}

	for nodeID, node := range tree.Nodes {
		issues = append(issues, validateNode(nodeID, node, tree.Nodes, positions)...)
	}

	return issues
}

func validateNode(nodeID string, node DecisionTreeNode, allNodes map[string]DecisionTreeNode, positions treePositions) []ValidationIssue {
	var issues []ValidationIssue
	if node.Type == "terminal" {
		if node.Action == "" {
			issue := ValidationIssue{
				Code:    "TERMINAL_ACTION_REQUIRED",
				Message: fmt.Sprintf("node \"%s\" missing required field: action", nodeID),
				NodeID:  nodeID,
			}
			applyPosition(&issue, positionForNode(positions, nodeID))
			issues = append(issues, issue)
		}
		return issues
	}

	if node.Question == "" {
		issue := ValidationIssue{
			Code:    "QUESTION_REQUIRED",
			Message: fmt.Sprintf("node \"%s\" missing required field: question", nodeID),
			NodeID:  nodeID,
		}
		applyPosition(&issue, positionForNode(positions, nodeID))
		issues = append(issues, issue)
	}
	if len(node.Options) == 0 {
		issue := ValidationIssue{
			Code:    "OPTIONS_REQUIRED",
			Message: fmt.Sprintf("node \"%s\" must have at least one option", nodeID),
			NodeID:  nodeID,
		}
		applyPosition(&issue, positionForNode(positions, nodeID))
		issues = append(issues, issue)
	}

	for i, option := range node.Options {
		if option.Label == "" {
			issue := ValidationIssue{
				Code:    "OPTION_LABEL_REQUIRED",
				Message: fmt.Sprintf("node \"%s\" option %d missing required field: label", nodeID, i),
				NodeID:  nodeID,
			}
			applyPosition(&issue, positionForOptionIndex(positions, nodeID, i))
			issues = append(issues, issue)
		}
		if option.Next != "" {
			if _, ok := allNodes[option.Next]; !ok {
				issue := ValidationIssue{
					Code:        "OPTION_NEXT_NOT_FOUND",
					Message:     fmt.Sprintf("node \"%s\" option \"%s\" references non-existent node: %s", nodeID, option.Label, option.Next),
					NodeID:      nodeID,
					OptionLabel: option.Label,
				}
				applyPosition(&issue, positionForOptionLabel(positions, nodeID, option.Label))
				if issue.Line == 0 {
					applyPosition(&issue, positionForOptionIndex(positions, nodeID, i))
				}
				issues = append(issues, issue)
			}
		}
	}

	return issues
}

var yamlLineRegex = regexp.MustCompile(`line (\\d+)(?:, column (\\d+))?`)

func parseYAMLErrorLocation(message string) (int, int) {
	match := yamlLineRegex.FindStringSubmatch(message)
	if len(match) == 0 {
		return 0, 0
	}
	line := atoiSafe(match[1])
	column := 0
	if len(match) > 2 && match[2] != "" {
		column = atoiSafe(match[2])
	}
	return line, column
}

func atoiSafe(value string) int {
	result := 0
	for _, char := range value {
		if char < '0' || char > '9' {
			continue
		}
		result = result*10 + int(char-'0')
	}
	return result
}

func extractPositions(doc *yaml.Node) treePositions {
	positions := treePositions{
		Nodes:       map[string]position{},
		OptionLabel: map[string]map[string]position{},
		OptionIndex: map[string]map[int]position{},
	}

	root := rootMapping(doc)
	if root == nil {
		return positions
	}

	if node := mappingValue(root, "name"); node != nil {
		positions.Name = &position{Line: node.Line, Column: node.Column}
	}
	if node := mappingValue(root, "root"); node != nil {
		positions.Root = &position{Line: node.Line, Column: node.Column}
	}

	nodesNode := mappingValue(root, "nodes")
	if nodesNode == nil || nodesNode.Kind != yaml.MappingNode {
		return positions
	}

	for i := 0; i < len(nodesNode.Content); i += 2 {
		key := nodesNode.Content[i]
		value := nodesNode.Content[i+1]
		nodeID := key.Value
		positions.Nodes[nodeID] = position{Line: key.Line, Column: key.Column}

		optionsNode := mappingValue(value, "options")
		if optionsNode == nil || optionsNode.Kind != yaml.SequenceNode {
			continue
		}
		for idx, optionNode := range optionsNode.Content {
			if optionNode.Kind != yaml.MappingNode {
				continue
			}
			if positions.OptionIndex[nodeID] == nil {
				positions.OptionIndex[nodeID] = map[int]position{}
			}
			positions.OptionIndex[nodeID][idx] = position{Line: optionNode.Line, Column: optionNode.Column}

			labelNode := mappingValue(optionNode, "label")
			if labelNode != nil {
				if positions.OptionLabel[nodeID] == nil {
					positions.OptionLabel[nodeID] = map[string]position{}
				}
				positions.OptionLabel[nodeID][labelNode.Value] = position{Line: labelNode.Line, Column: labelNode.Column}
			}
		}
	}

	return positions
}

func rootMapping(doc *yaml.Node) *yaml.Node {
	if doc == nil {
		return nil
	}
	if doc.Kind == yaml.DocumentNode && len(doc.Content) > 0 {
		doc = doc.Content[0]
	}
	if doc.Kind != yaml.MappingNode {
		return nil
	}
	return doc
}

func mappingValue(node *yaml.Node, key string) *yaml.Node {
	if node == nil || node.Kind != yaml.MappingNode {
		return nil
	}
	for i := 0; i < len(node.Content); i += 2 {
		k := node.Content[i]
		v := node.Content[i+1]
		if k.Value == key {
			return v
		}
	}
	return nil
}

func positionForNode(positions treePositions, nodeID string) *position {
	if pos, ok := positions.Nodes[nodeID]; ok {
		return &pos
	}
	return nil
}

func positionForOptionLabel(positions treePositions, nodeID, label string) *position {
	if positions.OptionLabel[nodeID] == nil {
		return nil
	}
	if pos, ok := positions.OptionLabel[nodeID][label]; ok {
		return &pos
	}
	return nil
}

func positionForOptionIndex(positions treePositions, nodeID string, index int) *position {
	if positions.OptionIndex[nodeID] == nil {
		return nil
	}
	if pos, ok := positions.OptionIndex[nodeID][index]; ok {
		return &pos
	}
	return nil
}

func applyPosition(issue *ValidationIssue, pos *position) {
	if pos == nil {
		return
	}
	issue.Line = pos.Line
	issue.Column = pos.Column
}
