package db

import "testing"

func TestMigrationNames(t *testing.T) {
	names, err := MigrationNames()
	if err != nil {
		t.Fatalf("MigrationNames returned error: %v", err)
	}

	if len(names) < 3 {
		t.Fatalf("expected at least 3 migrations, got %d", len(names))
	}
	if names[0] != "0001_init.sql" {
		t.Fatalf("expected first migration to be 0001_init.sql, got %q", names[0])
	}
	if names[1] != "0002_seed_services.sql" {
		t.Fatalf("expected second migration to be 0002_seed_services.sql, got %q", names[1])
	}
	if names[2] != "0003_seed_schedule.sql" {
		t.Fatalf("expected third migration to be 0003_seed_schedule.sql, got %q", names[2])
	}
}
