package main

import (
	"os"

	"github.com/go-go-golems/glazed/pkg/cli"
	"github.com/go-go-golems/glazed/pkg/cmds/logging"
	hairbookingcmds "github.com/go-go-golems/hair-booking/cmd/hair-booking/cmds"
	"github.com/spf13/cobra"
)

var version = "dev"

var rootCmd = &cobra.Command{
	Use:     "hair-booking",
	Short:   "hair-booking serves the Keycloak-backed hair booking website",
	Version: version,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		return logging.InitLoggerFromCobra(cmd)
	},
}

func main() {
	cobra.CheckErr(logging.AddLoggingSectionToRootCommand(rootCmd, "hair-booking"))

	serveCmd, err := hairbookingcmds.NewServeCommand(version)
	cobra.CheckErr(err)

	cobraServeCmd, err := cli.BuildCobraCommandFromCommand(serveCmd,
		cli.WithParserConfig(cli.CobraParserConfig{
			AppName:           "hair-booking",
			ShortHelpSections: []string{"default", "auth"},
			MiddlewaresFunc:   cli.CobraCommandDefaultMiddlewares,
		}),
	)
	cobra.CheckErr(err)
	rootCmd.AddCommand(cobraServeCmd)

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
