package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/go-go-golems/XXX/internal/sbcap/config"
	"github.com/go-go-golems/XXX/internal/sbcap/modes"
	"github.com/go-go-golems/XXX/internal/sbcap/runner"
	"github.com/go-go-golems/glazed/pkg/cli"
	"github.com/go-go-golems/glazed/pkg/cmds"
	"github.com/go-go-golems/glazed/pkg/cmds/fields"
	"github.com/go-go-golems/glazed/pkg/cmds/schema"
	"github.com/go-go-golems/glazed/pkg/cmds/values"
	"github.com/go-go-golems/glazed/pkg/middlewares"
	"github.com/go-go-golems/glazed/pkg/types"
	"github.com/spf13/cobra"
)

type RunCommand struct {
	*cmds.CommandDescription
}

type RunSettings struct {
	Config string `glazed.parameter:"config"`
	Modes  string `glazed.parameter:"modes"`
	DryRun bool   `glazed.parameter:"dry-run"`
}

func NewRunCommand() (*RunCommand, error) {
	glazedLayer, err := schema.NewGlazedSchema()
	if err != nil {
		return nil, err
	}
	commandSettingsLayer, err := cli.NewCommandSettingsLayer()
	if err != nil {
		return nil, err
	}

	cmdDesc := cmds.NewCommandDescription(
		"run",
		cmds.WithShort("Run sbcap capture and analysis modes"),
		cmds.WithLong("Run sbcap using a YAML capture plan and one or more modes."),
		cmds.WithFlags(
			fields.New(
				"config",
				fields.TypeString,
				fields.WithHelp("Path to sbcap YAML config"),
			),
			fields.New(
				"modes",
				fields.TypeString,
				fields.WithDefault(""),
				fields.WithHelp("Comma-delimited list of modes (capture,cssdiff,matched-styles,ai-review,full)"),
			),
			fields.New(
				"dry-run",
				fields.TypeBool,
				fields.WithDefault(false),
				fields.WithHelp("Validate config and modes without running browser actions"),
			),
		),
		cmds.WithLayersList(glazedLayer, commandSettingsLayer),
	)

	return &RunCommand{CommandDescription: cmdDesc}, nil
}

func (c *RunCommand) RunIntoGlazeProcessor(
	ctx context.Context,
	vals *values.Values,
	gp middlewares.Processor,
) error {
	settings := &RunSettings{}
	if err := values.DecodeSectionInto(vals, schema.DefaultSlug, settings); err != nil {
		return err
	}
	if settings.Config == "" {
		return fmt.Errorf("--config is required")
	}

	cfg, err := config.Load(settings.Config)
	if err != nil {
		return err
	}

	modesRaw := settings.Modes
	if modesRaw == "" && len(cfg.Modes) > 0 {
		modesRaw = joinModes(cfg.Modes)
	}

	modesList, err := runner.NormalizeModes(modesRaw)
	if err != nil {
		return err
	}

	result, err := runner.Run(ctx, cfg, modesList, settings.DryRun)
	if err != nil && settings.DryRun {
		return err
	}

	for _, r := range result.Results {
		row := types.NewRow(
			types.MRP("mode", r.Mode),
			types.MRP("status", r.Status),
			types.MRP("message", r.Message),
		)
		if err := gp.AddRow(ctx, row); err != nil {
			return err
		}
	}

	if !settings.DryRun {
		if containsMode(modesList, "capture") {
			if err := emitCoverageRows(ctx, gp, cfg.Output.Dir); err != nil {
				return err
			}
		}
		if containsMode(modesList, "story-discovery") {
			if err := emitStoryRows(ctx, gp, cfg.Output.Dir); err != nil {
				return err
			}
		}
	}

	return err
}

func joinModes(modes []string) string {
	out := ""
	for i, m := range modes {
		if i == 0 {
			out = m
			continue
		}
		out += "," + m
	}
	return out
}

func containsMode(modesList []string, value string) bool {
	for _, m := range modesList {
		if m == value {
			return true
		}
	}
	return false
}

func emitCoverageRows(ctx context.Context, gp middlewares.Processor, outDir string) error {
	data, err := os.ReadFile(filepath.Join(outDir, "capture.json"))
	if err != nil {
		return err
	}
	var capture modes.CaptureResult
	if err := json.Unmarshal(data, &capture); err != nil {
		return err
	}
	row := types.NewRow(
		types.MRP("type", "coverage"),
		types.MRP("total", capture.Coverage.Total),
		types.MRP("original_missing", capture.Coverage.OriginalMissing),
		types.MRP("react_missing", capture.Coverage.ReactMissing),
		types.MRP("original_hidden", capture.Coverage.OriginalHidden),
		types.MRP("react_hidden", capture.Coverage.ReactHidden),
	)
	return gp.AddRow(ctx, row)
}

func emitStoryRows(ctx context.Context, gp middlewares.Processor, outDir string) error {
	data, err := os.ReadFile(filepath.Join(outDir, "stories.json"))
	if err != nil {
		return err
	}
	var stories modes.StoryDiscoveryResult
	if err := json.Unmarshal(data, &stories); err != nil {
		return err
	}
	for _, entry := range stories.Entries {
		row := types.NewRow(
			types.MRP("type", "story"),
			types.MRP("id", entry.ID),
			types.MRP("title", entry.Title),
			types.MRP("name", entry.Name),
		)
		if err := gp.AddRow(ctx, row); err != nil {
			return err
		}
	}
	return nil
}

func main() {
	runCmd, err := NewRunCommand()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating run command: %v\n", err)
		os.Exit(1)
	}

	cobraRunCmd, err := cli.BuildCobraCommand(runCmd)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error building run command: %v\n", err)
		os.Exit(1)
	}

	rootCmd := &cobra.Command{Use: "sbcap"}
	rootCmd.AddCommand(cobraRunCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}
