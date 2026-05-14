package dslhost

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

const DefaultSQLitePath = "./var/fringe-dsl.sqlite"
const DefaultConfigSQLitePath = "./var/fringe-dsl-config.sqlite"

//go:embed *.sql
var schemaFS embed.FS

type DBOptions struct {
	Path    string
	Migrate bool
}

type DBHost struct {
	DB   *sql.DB
	Path string
}

func OpenDB(ctx context.Context, opts DBOptions) (*DBHost, error) {
	return openDB(ctx, opts, DefaultSQLitePath, ProvisionSchema)
}

func OpenConfigDB(ctx context.Context, opts DBOptions) (*DBHost, error) {
	return openDB(ctx, opts, DefaultConfigSQLitePath, ProvisionConfigSchema)
}

func openDB(ctx context.Context, opts DBOptions, defaultPath string, provision func(context.Context, *sql.DB) error) (*DBHost, error) {
	path := strings.TrimSpace(opts.Path)
	if path == "" {
		path = defaultPath
	}

	if path != ":memory:" {
		dir := filepath.Dir(path)
		if dir != "." {
			if err := os.MkdirAll(dir, 0o755); err != nil {
				return nil, fmt.Errorf("create DSL SQLite directory: %w", err)
			}
		}
	}

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("open DSL SQLite database: %w", err)
	}
	host := &DBHost{DB: db, Path: path}
	if err := host.configure(ctx, opts.Migrate, provision); err != nil {
		_ = host.Close()
		return nil, err
	}
	return host, nil
}

func (h *DBHost) configure(ctx context.Context, migrate bool, provision func(context.Context, *sql.DB) error) error {
	if h == nil || h.DB == nil {
		return fmt.Errorf("DSL SQLite host is nil")
	}
	pragmas := []string{
		"PRAGMA foreign_keys = ON",
		"PRAGMA busy_timeout = 5000",
	}
	if h.Path != ":memory:" {
		pragmas = append(pragmas, "PRAGMA journal_mode = WAL")
	}
	for _, pragma := range pragmas {
		if _, err := h.DB.ExecContext(ctx, pragma); err != nil {
			return fmt.Errorf("apply %s: %w", pragma, err)
		}
	}
	if err := h.DB.PingContext(ctx); err != nil {
		return fmt.Errorf("ping DSL SQLite database: %w", err)
	}
	if migrate && provision != nil {
		if err := provision(ctx, h.DB); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionSchema(ctx context.Context, db *sql.DB) error {
	return provisionEmbeddedSchema(ctx, db, "schema.sql", "DSL schema")
}

func ProvisionConfigSchema(ctx context.Context, db *sql.DB) error {
	return provisionEmbeddedSchema(ctx, db, "config_schema.sql", "DSL config schema")
}

func provisionEmbeddedSchema(ctx context.Context, db *sql.DB, filename, label string) error {
	if db == nil {
		return fmt.Errorf("provision %s: database is nil", label)
	}
	schema, err := schemaFS.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("read embedded %s: %w", label, err)
	}
	if _, err := db.ExecContext(ctx, string(schema)); err != nil {
		return fmt.Errorf("provision %s: %w", label, err)
	}
	return nil
}

func (h *DBHost) Close() error {
	if h == nil || h.DB == nil {
		return nil
	}
	err := h.DB.Close()
	h.DB = nil
	return err
}
