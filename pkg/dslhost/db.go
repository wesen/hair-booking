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

//go:embed schema.sql
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
	path := strings.TrimSpace(opts.Path)
	if path == "" {
		path = DefaultSQLitePath
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
	if err := host.configure(ctx, opts.Migrate); err != nil {
		_ = host.Close()
		return nil, err
	}
	return host, nil
}

func (h *DBHost) configure(ctx context.Context, migrate bool) error {
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
	if migrate {
		if err := ProvisionSchema(ctx, h.DB); err != nil {
			return err
		}
	}
	return nil
}

func ProvisionSchema(ctx context.Context, db *sql.DB) error {
	if db == nil {
		return fmt.Errorf("provision DSL schema: database is nil")
	}
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return fmt.Errorf("read embedded DSL schema: %w", err)
	}
	if _, err := db.ExecContext(ctx, string(schema)); err != nil {
		return fmt.Errorf("provision DSL schema: %w", err)
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
