package dslgoja

import (
	"context"
	"database/sql"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func TestRuntimeWithoutHostStillRunsFringeDSL(t *testing.T) {
	rt := NewRuntime()
	_, result, err := rt.StartFlow(context.Background(), "test.flow", `
		const { page, n } = require("fringe/dsl");
		function render(ctx) {
			return page("hello", "Hello").add(n.text("works").id("message"));
		}
	`)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "hello" {
		t.Fatalf("page id = %q", result.Page.ID)
	}
}

func TestRuntimeWithHostDBExposesDBModule(t *testing.T) {
	db, err := sql.Open("sqlite3", filepath.Join(t.TempDir(), "host.sqlite"))
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	defer func() { _ = db.Close() }()
	if _, err := db.Exec(`CREATE TABLE dsl_audit_events (id TEXT PRIMARY KEY, kind TEXT NOT NULL)`); err != nil {
		t.Fatalf("create table: %v", err)
	}

	rt := NewRuntime(WithHost(RuntimeHost{DB: db, DBPath: "host.sqlite"}))
	_, _, err = rt.StartFlow(context.Background(), "test.flow", `
		const { page, n } = require("fringe/dsl");
		const db = require("db");
		function initialState() {
			db.exec("INSERT INTO dsl_audit_events(id, kind) VALUES (?, ?)", "evt_1", "host-db-test");
			return {};
		}
		function render(ctx) {
			const rows = db.query("SELECT kind FROM dsl_audit_events WHERE id = ?", "evt_1");
			return page("db", "DB").add(n.text(rows[0].kind).id("kind"));
		}
	`)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}

	var kind string
	if err := db.QueryRow(`SELECT kind FROM dsl_audit_events WHERE id = ?`, "evt_1").Scan(&kind); err != nil {
		t.Fatalf("query inserted row: %v", err)
	}
	if kind != "host-db-test" {
		t.Fatalf("kind = %q", kind)
	}
}

func TestRuntimeWithoutHostDBRejectsDBRequire(t *testing.T) {
	rt := NewRuntime()
	_, _, err := rt.StartFlow(context.Background(), "test.flow", `
		require("db");
		function render(ctx) { return require("fringe/dsl").page("bad", "Bad"); }
	`)
	if err == nil {
		t.Fatalf("expected unknown db module error")
	}
}
