package cmds

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-go-golems/glazed/pkg/cli"
	"github.com/go-go-golems/glazed/pkg/cmds"
	"github.com/go-go-golems/glazed/pkg/cmds/fields"
	"github.com/go-go-golems/glazed/pkg/cmds/schema"
	"github.com/go-go-golems/glazed/pkg/cmds/values"
	hairauth "github.com/go-go-golems/hair-booking/pkg/auth"
	hairconfig "github.com/go-go-golems/hair-booking/pkg/config"
	hairdb "github.com/go-go-golems/hair-booking/pkg/db"
	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	"github.com/go-go-golems/hair-booking/pkg/server"
	hairstorage "github.com/go-go-golems/hair-booking/pkg/storage"
	pkgerrors "github.com/pkg/errors"
)

type ServeCommand struct {
	*cmds.CommandDescription
	version string
}

type ServeSettings struct {
	ListenHost             string `glazed:"listen-host"`
	ListenPort             int    `glazed:"listen-port"`
	DSLSQLitePath          string `glazed:"dsl-sqlite-path"`
	DSLSQLiteMigrate       bool   `glazed:"dsl-sqlite-migrate"`
	DSLConfigSQLitePath    string `glazed:"dsl-config-sqlite-path"`
	DSLConfigSQLiteMigrate bool   `glazed:"dsl-config-sqlite-migrate"`
}

var _ cmds.BareCommand = &ServeCommand{}

func NewServeCommand(version string) (*ServeCommand, error) {
	defaultSection, err := schema.NewSection(
		schema.DefaultSlug,
		"Server Settings",
		schema.WithFields(
			fields.New(
				"listen-host",
				fields.TypeString,
				fields.WithHelp("Host interface to bind"),
				fields.WithDefault("0.0.0.0"),
			),
			fields.New(
				"listen-port",
				fields.TypeInteger,
				fields.WithHelp("Port to listen on"),
				fields.WithDefault(8080),
			),
			fields.New(
				"dsl-sqlite-path",
				fields.TypeString,
				fields.WithHelp("SQLite database path used by Goja DSL host modules"),
				fields.WithDefault(dslhost.DefaultSQLitePath),
			),
			fields.New(
				"dsl-sqlite-migrate",
				fields.TypeBool,
				fields.WithHelp("Provision or migrate the Goja DSL state SQLite schema on startup"),
				fields.WithDefault(true),
			),
			fields.New(
				"dsl-config-sqlite-path",
				fields.TypeString,
				fields.WithHelp("SQLite database path used for read-only Goja DSL configDb content"),
				fields.WithDefault(dslhost.DefaultConfigSQLitePath),
			),
			fields.New(
				"dsl-config-sqlite-migrate",
				fields.TypeBool,
				fields.WithHelp("Provision or migrate the Goja DSL configDb schema and seed content on startup"),
				fields.WithDefault(true),
			),
		),
	)
	if err != nil {
		return nil, pkgerrors.Wrap(err, "failed to create default section")
	}

	authSection, err := hairauth.NewSection()
	if err != nil {
		return nil, pkgerrors.Wrap(err, "failed to create auth section")
	}

	backendSection, err := hairconfig.NewSection()
	if err != nil {
		return nil, pkgerrors.Wrap(err, "failed to create backend section")
	}

	commandSettingsSection, err := cli.NewCommandSettingsSection()
	if err != nil {
		return nil, pkgerrors.Wrap(err, "failed to create command settings section")
	}

	description := cmds.NewCommandDescription(
		"serve",
		cmds.WithShort("Start the hair-booking website"),
		cmds.WithLong(`Start the hair-booking website with Keycloak-backed login.

The app serves:
- an embedded browser UI on /, or a proxied frontend dev server when configured
- session-backed auth routes on /auth/*
- JSON endpoints on /api/*
- static assets on /static/*

Examples:
  hair-booking serve --auth-mode dev
  hair-booking serve --auth-mode oidc --oidc-issuer-url http://127.0.0.1:18080/realms/smailnail-dev --oidc-client-id hair-booking-web --oidc-client-secret secret --oidc-redirect-url http://127.0.0.1:8080/auth/callback --auth-session-secret local-session-secret
`),
		cmds.WithSections(defaultSection, authSection, backendSection, commandSettingsSection),
	)

	return &ServeCommand{
		CommandDescription: description,
		version:            version,
	}, nil
}

func (c *ServeCommand) Run(ctx context.Context, parsedValues *values.Values) error {
	settings := &ServeSettings{}
	if err := parsedValues.DecodeSectionInto(schema.DefaultSlug, settings); err != nil {
		return pkgerrors.Wrap(err, "failed to decode serve settings")
	}

	authSettings, err := hairauth.LoadSettingsFromParsedValues(parsedValues)
	if err != nil {
		return pkgerrors.Wrap(err, "failed to load auth settings")
	}

	backendSettings, err := hairconfig.LoadSettingsFromParsedValues(parsedValues)
	if err != nil {
		return pkgerrors.Wrap(err, "failed to load backend settings")
	}

	applicationDB, err := hairdb.Open(ctx, backendSettings.DatabaseURL)
	if err != nil {
		return pkgerrors.Wrap(err, "failed to open application database")
	}
	if applicationDB != nil {
		defer applicationDB.Close()
	}
	if applicationDB != nil && backendSettings.AutoMigrate {
		if err := applicationDB.Migrate(ctx); err != nil {
			return pkgerrors.Wrap(err, "failed to apply embedded migrations")
		}
	}

	dslDB, err := dslhost.OpenDB(ctx, dslhost.DBOptions{Path: settings.DSLSQLitePath, Migrate: settings.DSLSQLiteMigrate})
	if err != nil {
		return pkgerrors.Wrap(err, "failed to open DSL SQLite database")
	}
	defer func() { _ = dslDB.Close() }()

	dslConfigDB, err := dslhost.OpenConfigDB(ctx, dslhost.DBOptions{Path: settings.DSLConfigSQLitePath, Migrate: settings.DSLConfigSQLiteMigrate})
	if err != nil {
		return pkgerrors.Wrap(err, "failed to open DSL config SQLite database")
	}
	defer func() { _ = dslConfigDB.Close() }()

	var blobStore hairstorage.BlobStore
	switch backendSettings.StorageMode {
	case hairconfig.StorageModeLocal:
		blobStore = hairstorage.NewLocalStore(backendSettings.StorageLocalDir)
	case hairconfig.StorageModeS3:
		return errors.New("s3 storage mode is not implemented yet")
	default:
		return pkgerrors.Errorf("unsupported storage mode %q", backendSettings.StorageMode)
	}

	serverCtx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	httpServer, err := server.NewHTTPServer(serverCtx, server.ServerOptions{
		Host:                settings.ListenHost,
		Port:                settings.ListenPort,
		Version:             c.version,
		AuthSettings:        authSettings,
		Database:            applicationDB,
		Storage:             blobStore,
		LocalUploadsDir:     backendSettings.StorageLocalDir,
		FrontendDevProxyURL: backendSettings.FrontendDevProxyURL,
		DSLSQLitePath:       dslDB.Path,
		DSLSQLiteMigrate:    settings.DSLSQLiteMigrate,
		DSLDB:               dslDB.DB,
		DSLStateSQLitePath:  dslDB.Path,
		DSLStateDB:          dslDB.DB,
		DSLConfigSQLitePath: dslConfigDB.Path,
		DSLConfigDB:         dslConfigDB.DB,
	})
	if err != nil {
		return pkgerrors.Wrap(err, "failed to create http server")
	}

	go func() {
		<-serverCtx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Warn().Err(err).Msg("failed to shutdown server cleanly")
		}
	}()

	log.Info().
		Str("address", httpServer.Addr).
		Str("auth_mode", authSettings.Mode).
		Bool("database_configured", backendSettings.DatabaseURL != "").
		Bool("auto_migrate", backendSettings.AutoMigrate).
		Str("frontend_dev_proxy_url", backendSettings.FrontendDevProxyURL).
		Str("dsl_sqlite_path", dslDB.Path).
		Bool("dsl_sqlite_migrate", settings.DSLSQLiteMigrate).
		Str("dsl_config_sqlite_path", dslConfigDB.Path).
		Bool("dsl_config_sqlite_migrate", settings.DSLConfigSQLiteMigrate).
		Str("issuer", authSettings.OIDCIssuerURL).
		Str("client_id", authSettings.OIDCClientID).
		Msg("Starting hair-booking server")

	err = httpServer.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("server exited with error: %w", err)
	}

	return nil
}
