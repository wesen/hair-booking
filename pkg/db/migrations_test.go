package db

import "testing"

func TestMigrationNames(t *testing.T) {
	names, err := MigrationNames()
	if err != nil {
		t.Fatalf("MigrationNames returned error: %v", err)
	}

	if len(names) < 5 {
		t.Fatalf("expected at least 5 migrations, got %d", len(names))
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
	if names[3] != "0004_add_intake_reviews.sql" {
		t.Fatalf("expected fourth migration to be 0004_add_intake_reviews.sql, got %q", names[3])
	}
	if names[4] != "0005_add_stylist_support.sql" {
		t.Fatalf("expected fifth migration to be 0005_add_stylist_support.sql, got %q", names[4])
	}
}
