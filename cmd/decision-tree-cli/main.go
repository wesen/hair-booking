package main

import (
	"os"

	"github.com/spf13/cobra"
)

func main() {
	root := &cobra.Command{
		Use:   "decision-tree-cli",
		Short: "CLI to exercise the decision tree backend",
	}

	root.AddCommand(newLocalCommand())
	root.AddCommand(newRestCommand())

	if err := root.Execute(); err != nil {
		os.Exit(1)
	}
}
