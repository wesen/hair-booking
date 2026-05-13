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
