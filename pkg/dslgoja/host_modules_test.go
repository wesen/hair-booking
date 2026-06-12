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

func TestRuntimeResumeFlowRestoresStateAndRegeneratesActions(t *testing.T) {
	source := `
		const { page, n } = require("fringe/dsl");
		function render(ctx) {
			return page("resume", "Resume").add(
				n.button(ctx.state.choice, { actions: { click: ctx.action("choose", function () { ctx.state.choice = "changed"; return render(ctx); }, "click") } }).id("choice")
			);
		}
	`
	rt := NewRuntime()
	session, result, err := rt.ResumeFlow(context.Background(), "test.flow", source, ResumeFlowOptions{
		SessionID:           "flow_existing",
		StateJSON:           []byte(`{"choice":"persisted"}`),
		PreviousPageVersion: 4,
	})
	if err != nil {
		t.Fatalf("ResumeFlow: %v", err)
	}
	if session.ID != "flow_existing" {
		t.Fatalf("session id = %q", session.ID)
	}
	if result.PageVersion != 5 {
		t.Fatalf("page version = %d", result.PageVersion)
	}
	text, _ := result.Page.Nodes[0].Props["children"].(string)
	if text != "persisted" {
		t.Fatalf("button children = %q", text)
	}
	if len(session.CurrentActions) != 1 {
		t.Fatalf("current actions = %d", len(session.CurrentActions))
	}
}

func TestRuntimeExposesConfigDbReadOnlyAndStateDbReadWrite(t *testing.T) {
	configDB, err := sql.Open("sqlite3", filepath.Join(t.TempDir(), "config.sqlite"))
	if err != nil {
		t.Fatalf("open config sqlite: %v", err)
	}
	defer func() { _ = configDB.Close() }()
	if _, err := configDB.Exec(`CREATE TABLE app_options (id TEXT PRIMARY KEY, label TEXT NOT NULL)`); err != nil {
		t.Fatalf("create config table: %v", err)
	}
	if _, err := configDB.Exec(`INSERT INTO app_options(id, label) VALUES ('svc_1', 'Highlights')`); err != nil {
		t.Fatalf("seed config table: %v", err)
	}

	stateDB, err := sql.Open("sqlite3", filepath.Join(t.TempDir(), "state.sqlite"))
	if err != nil {
		t.Fatalf("open state sqlite: %v", err)
	}
	defer func() { _ = stateDB.Close() }()
	if _, err := stateDB.Exec(`CREATE TABLE app_state (id TEXT PRIMARY KEY, value TEXT NOT NULL)`); err != nil {
		t.Fatalf("create state table: %v", err)
	}

	rt := NewRuntime(WithHost(RuntimeHost{ConfigDB: configDB, StateDB: stateDB}))
	_, result, err := rt.StartFlow(context.Background(), "test.flow", `
		const { page, n } = require("fringe/dsl");
		const configDb = require("configDb");
		const stateDb = require("stateDb");
		function initialState() {
			const rows = configDb.query("SELECT label FROM app_options WHERE id = ?", "svc_1");
			stateDb.exec("INSERT INTO app_state(id, value) VALUES (?, ?)", "choice", rows[0].label);
			let execRejected = false;
			try { configDb.exec("INSERT INTO app_options(id, label) VALUES ('bad', 'Bad')"); } catch (e) { execRejected = true; }
			let queryRejected = false;
			try { configDb.query("DELETE FROM app_options WHERE id = 'svc_1'"); } catch (e) { queryRejected = true; }
			if (!execRejected) throw new Error("configDb.exec should be rejected");
			if (!queryRejected) throw new Error("configDb non-read query should be rejected");
			return { label: rows[0].label };
		}
		function render(ctx) {
			return page("dbs", "DBs").add(n.text(ctx.state.label).id("label"));
		}
	`)
	if err != nil {
		t.Fatalf("StartFlow: %v", err)
	}
	if result.Page.ID != "dbs" {
		t.Fatalf("page id = %q", result.Page.ID)
	}

	var value string
	if err := stateDB.QueryRow(`SELECT value FROM app_state WHERE id = ?`, "choice").Scan(&value); err != nil {
		t.Fatalf("query state row: %v", err)
	}
	if value != "Highlights" {
		t.Fatalf("state value = %q", value)
	}
	var configCount int
	if err := configDB.QueryRow(`SELECT count(*) FROM app_options`).Scan(&configCount); err != nil {
		t.Fatalf("query config count: %v", err)
	}
	if configCount != 1 {
		t.Fatalf("config count = %d", configCount)
	}
}
