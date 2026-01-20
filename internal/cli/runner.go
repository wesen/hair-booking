package cli

import (
	"errors"
	"fmt"
	"strings"

	"github.com/go-go-golems/sbcap/internal/dsl"
)

// RunSelections walks a decision tree by matching option labels in order.
func RunSelections(tree dsl.DecisionTreeDSL, selections []string) (dsl.DecisionTreeState, error) {
	if len(selections) == 0 {
		return dsl.DecisionTreeState{}, errors.New("no selections provided")
	}

	state := dsl.InitializeState(tree)

	for _, selection := range selections {
		node, ok := tree.Nodes[state.CurrentNodeID]
		if !ok {
			return dsl.DecisionTreeState{}, fmt.Errorf("node %s not found", state.CurrentNodeID)
		}
		if node.Type == "terminal" {
			return dsl.DecisionTreeState{}, fmt.Errorf("node %s is terminal; no options available", state.CurrentNodeID)
		}

		option, err := findOption(node, selection)
		if err != nil {
			return dsl.DecisionTreeState{}, err
		}

		state = dsl.SelectOption(tree, state, option)
	}

	return state, nil
}

func findOption(node dsl.DecisionTreeNode, label string) (dsl.DecisionTreeOption, error) {
	target := strings.TrimSpace(strings.ToLower(label))
	if target == "" {
		return dsl.DecisionTreeOption{}, errors.New("empty selection")
	}

	for _, option := range node.Options {
		if strings.ToLower(option.Label) == target {
			return option, nil
		}
	}

	return dsl.DecisionTreeOption{}, fmt.Errorf("option %q not found for node %q", label, node.Question)
}
