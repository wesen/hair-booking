package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/go-go-golems/XXX/internal/cli"
	"github.com/go-go-golems/XXX/internal/dsl"
)

func newLocalCommand() *cobra.Command {
	localCmd := &cobra.Command{
		Use:   "local",
		Short: "Run local (in-process) DSL exercises",
	}

	localCmd.AddCommand(newLocalParseCommand())
	localCmd.AddCommand(newLocalRunCommand())

	return localCmd
}

func newLocalParseCommand() *cobra.Command {
	var filePath string

	cmd := &cobra.Command{
		Use:   "parse",
		Short: "Parse and validate a DSL file",
		RunE: func(cmd *cobra.Command, args []string) error {
			content, err := os.ReadFile(filePath)
			if err != nil {
				return err
			}
			if _, err := dsl.ParseDSL(string(content)); err != nil {
				return err
			}
			fmt.Fprintln(cmd.OutOrStdout(), "OK")
			return nil
		},
	}

	cmd.Flags().StringVar(&filePath, "file", "", "path to DSL yaml file")
	_ = cmd.MarkFlagRequired("file")

	return cmd
}

func newLocalRunCommand() *cobra.Command {
	var filePath string
	var selections []string

	cmd := &cobra.Command{
		Use:   "run",
		Short: "Run a decision tree locally with ordered selections",
		RunE: func(cmd *cobra.Command, args []string) error {
			content, err := os.ReadFile(filePath)
			if err != nil {
				return err
			}
			tree, err := dsl.ParseDSL(string(content))
			if err != nil {
				return err
			}

			state, err := cli.RunSelections(tree, selections)
			if err != nil {
				return err
			}

			payload, err := json.MarshalIndent(state, "", "  ")
			if err != nil {
				return err
			}
			fmt.Fprintln(cmd.OutOrStdout(), string(payload))
			return nil
		},
	}

	cmd.Flags().StringVar(&filePath, "file", "", "path to DSL yaml file")
	cmd.Flags().StringArrayVar(&selections, "select", nil, "option labels to select in order")
	_ = cmd.MarkFlagRequired("file")
	_ = cmd.MarkFlagRequired("select")

	return cmd
}
