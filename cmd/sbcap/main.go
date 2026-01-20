package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
	"github.com/go-go-golems/sbcap/internal/sbcap/config"
	"github.com/go-go-golems/sbcap/internal/sbcap/driver"
	"github.com/go-go-golems/sbcap/internal/sbcap/modes"
	"github.com/go-go-golems/sbcap/internal/sbcap/runner"
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
	rootCmd.AddCommand(newChromedpProbeCommand())

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}

type chromedpProbeSettings struct {
	URL       string
	Selector  string
	WaitMS    int
	ViewportW int
	ViewportH int
	TimeoutMS int
}

func newChromedpProbeCommand() *cobra.Command {
	settings := &chromedpProbeSettings{}
	cmd := &cobra.Command{
		Use:   "chromedp-probe",
		Short: "Run a minimal chromedp probe against a URL",
		RunE: func(cmd *cobra.Command, args []string) error {
			if settings.URL == "" {
				return fmt.Errorf("--url is required")
			}
			timeout := time.Duration(settings.TimeoutMS) * time.Millisecond
			ctx, cancel := context.WithTimeout(context.Background(), timeout)
			defer cancel()

			browser, err := driver.NewBrowser(ctx)
			if err != nil {
				return err
			}
			defer browser.Close()

			page, err := browser.NewPage()
			if err != nil {
				return err
			}
			defer page.Close()

			if err := page.SetViewport(settings.ViewportW, settings.ViewportH); err != nil {
				return err
			}
			if err := page.Goto(settings.URL); err != nil {
				return err
			}
			if settings.WaitMS > 0 {
				page.Wait(time.Duration(settings.WaitMS) * time.Millisecond)
			}

			var title string
			if err := page.Evaluate("document.title", &title); err != nil {
				return err
			}

			selectorMatches := -1
			if settings.Selector != "" {
				var nodeIDs []cdp.NodeID
				if err := chromedp.Run(page.Context(), chromedp.NodeIDs(settings.Selector, &nodeIDs, chromedp.ByQuery)); err != nil {
					return err
				}
				selectorMatches = len(nodeIDs)
			}

			if settings.Selector != "" {
				fmt.Printf("chromedp ok url=%s title=%q selector=%s matches=%d\n", settings.URL, title, settings.Selector, selectorMatches)
				return nil
			}
			fmt.Printf("chromedp ok url=%s title=%q\n", settings.URL, title)
			return nil
		},
	}

	cmd.Flags().StringVar(&settings.URL, "url", "", "URL to navigate to")
	cmd.Flags().StringVar(&settings.Selector, "selector", "", "Optional CSS selector to verify")
	cmd.Flags().IntVar(&settings.WaitMS, "wait-ms", 0, "Wait time in milliseconds after navigation")
	cmd.Flags().IntVar(&settings.ViewportW, "viewport-width", 1280, "Viewport width")
	cmd.Flags().IntVar(&settings.ViewportH, "viewport-height", 720, "Viewport height")
	cmd.Flags().IntVar(&settings.TimeoutMS, "timeout-ms", 30000, "Overall timeout in milliseconds")

	return cmd
}
