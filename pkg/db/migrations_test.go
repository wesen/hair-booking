package db

import "testing"

func TestMigrationNames(t *testing.T) {
	names, err := MigrationNames()
	if err != nil {
		t.Fatalf("MigrationNames returned error: %v", err)
	}

	if len(names) < 2 {
		t.Fatalf("expected at least 2 migrations, got %d", len(names))
	}
	if names[0] != "0001_init.sql" {
		t.Fatalf("expected first migration to be 0001_init.sql, got %q", names[0])
	}
	if names[1] != "0002_seed_services.sql" {
		t.Fatalf("expected second migration to be 0002_seed_services.sql, got %q", names[1])
	}
}
