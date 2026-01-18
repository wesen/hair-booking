package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/go-go-golems/XXX/internal/server"
	"github.com/go-go-golems/XXX/internal/store"
)

func main() {
	var (
		addr     = flag.String("addr", ":3001", "listen address")
		dbPath   = flag.String("db-path", "decision-tree.db", "sqlite database path")
		logLevel = flag.String("log-level", "info", "log level (debug, info, warn, error)")
	)
	flag.Parse()

	level, err := zerolog.ParseLevel(*logLevel)
	if err != nil {
		fmt.Fprintf(os.Stderr, "invalid log level: %s\n", *logLevel)
		os.Exit(1)
	}
	zerolog.SetGlobalLevel(level)
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})

	store, err := store.Open(*dbPath)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to open store")
	}
	defer func() { _ = store.Close() }()

	srv := server.New(store, log.Logger)
	log.Info().Str("addr", *addr).Msg("decision tree server starting")
	if err := srv.Serve(*addr); err != nil {
		log.Fatal().Err(err).Msg("server stopped")
	}
}
