package dslhost

import (
	"context"
	"path/filepath"
	"testing"
)

func TestOpenDBMigratesSchema(t *testing.T) {
	path := filepath.Join(t.TempDir(), "nested", "fringe.sqlite")
	host, err := OpenDB(context.Background(), DBOptions{Path: path, Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = host.Close() }()

	for _, table := range []string{"dsl_flow_sessions", "dsl_intake_drafts", "dsl_uploads", "dsl_audit_events"} {
		var name string
		if err := host.DB.QueryRow(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`, table).Scan(&name); err != nil {
			t.Fatalf("table %s not found: %v", table, err)
		}
		if name != table {
			t.Fatalf("table name = %q, want %q", name, table)
		}
	}
}

func TestOpenDBWithoutMigrationDoesNotCreateSchema(t *testing.T) {
	path := filepath.Join(t.TempDir(), "fringe.sqlite")
	host, err := OpenDB(context.Background(), DBOptions{Path: path, Migrate: false})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = host.Close() }()

	var count int
	if err := host.DB.QueryRow(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'dsl_flow_sessions'`).Scan(&count); err != nil {
		t.Fatalf("count tables: %v", err)
	}
	if count != 0 {
		t.Fatalf("dsl_flow_sessions exists with migrate=false")
	}
}

func TestProvisionSchemaIsIdempotent(t *testing.T) {
	host, err := OpenDB(context.Background(), DBOptions{Path: ":memory:", Migrate: true})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = host.Close() }()

	if err := ProvisionSchema(context.Background(), host.DB); err != nil {
		t.Fatalf("ProvisionSchema second run: %v", err)
	}
}

func TestProvisionSchemaMigratesExistingSessionColumns(t *testing.T) {
	host, err := OpenDB(context.Background(), DBOptions{Path: ":memory:", Migrate: false})
	if err != nil {
		t.Fatalf("OpenDB: %v", err)
	}
	defer func() { _ = host.Close() }()

	_, err = host.DB.Exec(`CREATE TABLE dsl_flow_sessions (
		id TEXT PRIMARY KEY,
		flow_id TEXT NOT NULL,
		user_id TEXT,
		status TEXT NOT NULL DEFAULT 'active',
		current_page_id TEXT,
		current_page_version INTEGER NOT NULL DEFAULT 0,
		state_json TEXT NOT NULL DEFAULT '{}',
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`)
	if err != nil {
		t.Fatalf("create old schema: %v", err)
	}

	if err := ProvisionSchema(context.Background(), host.DB); err != nil {
		t.Fatalf("ProvisionSchema: %v", err)
	}

	for _, column := range []string{"config_version_id", "expires_at"} {
		var found bool
		rows, err := host.DB.Query(`PRAGMA table_info(dsl_flow_sessions)`)
		if err != nil {
			t.Fatalf("table info: %v", err)
		}
		for rows.Next() {
			var cid int
			var name string
			var columnType string
			var notNull int
			var defaultValue any
			var pk int
			if err := rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &pk); err != nil {
				_ = rows.Close()
				t.Fatalf("scan table info: %v", err)
			}
			if name == column {
				found = true
			}
		}
		if err := rows.Close(); err != nil {
			t.Fatalf("close rows: %v", err)
		}
		if !found {
			t.Fatalf("column %s was not migrated", column)
		}
	}
}

func TestOpenConfigDBMigratesAndSeedsSchema(t *testing.T) {
	host, err := OpenConfigDB(context.Background(), DBOptions{Path: filepath.Join(t.TempDir(), "config.sqlite"), Migrate: true})
	if err != nil {
		t.Fatalf("OpenConfigDB: %v", err)
	}
	defer func() { _ = host.Close() }()

	for _, table := range []string{"dsl_config_versions", "dsl_service_options", "dsl_tone_options", "dsl_budget_options", "dsl_availability_days", "dsl_time_slots"} {
		var name string
		if err := host.DB.QueryRow(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`, table).Scan(&name); err != nil {
			t.Fatalf("table %s not found: %v", table, err)
		}
	}
	var serviceCount int
	if err := host.DB.QueryRow(`SELECT count(*) FROM dsl_service_options WHERE config_version_id = 'cfg_default'`).Scan(&serviceCount); err != nil {
		t.Fatalf("query service seed: %v", err)
	}
	if serviceCount != 3 {
		t.Fatalf("service seed count = %d", serviceCount)
	}
}
