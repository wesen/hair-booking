package intakeadmin

import (
	"context"
	"database/sql"
	"testing"

	"github.com/go-go-golems/hair-booking/pkg/dslhost"
	_ "github.com/mattn/go-sqlite3"
)

func openStateDB(t *testing.T) *sql.DB {
	t.Helper()
	host, err := dslhost.OpenDB(context.Background(), dslhost.DBOptions{Path: ":memory:", Migrate: true})
	if err != nil {
		t.Fatalf("open DSL DB: %v", err)
	}
	t.Cleanup(func() { _ = host.Close() })
	if err := ProvisionSchema(context.Background(), host.DB); err != nil {
		t.Fatalf("provision intake admin schema: %v", err)
	}
	return host.DB
}

func openConfigDB(t *testing.T) *sql.DB {
	t.Helper()
	host, err := dslhost.OpenConfigDB(context.Background(), dslhost.DBOptions{Path: ":memory:", Migrate: true})
	if err != nil {
		t.Fatalf("open config DB: %v", err)
	}
	t.Cleanup(func() { _ = host.Close() })
	return host.DB
}

func TestStoreCreateListAndUpdateRequest(t *testing.T) {
	store := NewStore(openStateDB(t), openConfigDB(t))
	damage := 2
	created, err := store.CreateRequest(context.Background(), RequestInput{
		UserID:          "user_1",
		ConfigVersionID: "cfg_default",
		ServiceCategory: "color",
		ServiceValue:    "highlights",
		Tones:           []string{"dimensional"},
		Damage:          &damage,
		Photos:          map[string]any{"front": map[string]any{"uploadId": "upl_1"}},
		BudgetValue:     "flexible",
		DayValue:        "2026-06-19",
		TimeValue:       "12:00",
		EstimateLabel:   "$220–$420",
	})
	if err != nil {
		t.Fatalf("CreateRequest: %v", err)
	}
	if created.ID == "" || created.Status != "new" || created.ServiceValue != "highlights" {
		t.Fatalf("unexpected created request: %#v", created)
	}

	requests, err := store.ListRequests(context.Background(), RequestFilters{Status: "new"})
	if err != nil {
		t.Fatalf("ListRequests: %v", err)
	}
	if len(requests) != 1 || requests[0].ID != created.ID {
		t.Fatalf("unexpected list: %#v", requests)
	}

	updated, err := store.UpdateRequestStatus(context.Background(), created.ID, "reviewing", Actor{UserID: "admin_1", Role: "admin"}, "Looks good")
	if err != nil {
		t.Fatalf("UpdateRequestStatus: %v", err)
	}
	if updated.Status != "reviewing" || updated.InternalNotes == "" {
		t.Fatalf("unexpected updated request: %#v", updated)
	}
}

func TestStoreDashboardStatsAndConfigDraftPublish(t *testing.T) {
	store := NewStore(openStateDB(t), openConfigDB(t))
	if _, err := store.CreateRequest(context.Background(), RequestInput{ConfigVersionID: "cfg_default", ServiceCategory: "color", ServiceValue: "cut"}); err != nil {
		t.Fatalf("CreateRequest: %v", err)
	}
	stats, err := store.DashboardStats(context.Background())
	if err != nil {
		t.Fatalf("DashboardStats: %v", err)
	}
	if stats.NewRequests != 1 || stats.ActiveConfigID != "cfg_default" {
		t.Fatalf("unexpected stats: %#v", stats)
	}

	draft, err := store.CreateDraftFromActive(context.Background(), "Summer draft", Actor{UserID: "admin_1", Role: "admin"})
	if err != nil {
		t.Fatalf("CreateDraftFromActive: %v", err)
	}
	if draft.Status != "draft" || draft.ID == "cfg_default" {
		t.Fatalf("unexpected draft: %#v", draft)
	}
	var copied int
	if err := store.ConfigDB.QueryRow(`SELECT count(*) FROM dsl_service_options WHERE config_version_id = ?`, draft.ID).Scan(&copied); err != nil {
		t.Fatalf("count copied services: %v", err)
	}
	if copied == 0 {
		t.Fatalf("expected copied service options")
	}

	published, err := store.PublishConfigVersion(context.Background(), draft.ID, Actor{UserID: "admin_1", Role: "admin"})
	if err != nil {
		t.Fatalf("PublishConfigVersion: %v", err)
	}
	if published.Status != "active" {
		t.Fatalf("expected active published config, got %#v", published)
	}
}
