PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dsl_flow_sessions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_page_id TEXT,
  current_page_version INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dsl_flow_sessions_flow_status
  ON dsl_flow_sessions(flow_id, status);

CREATE INDEX IF NOT EXISTS idx_dsl_flow_sessions_user_status
  ON dsl_flow_sessions(user_id, status);

CREATE TABLE IF NOT EXISTS dsl_intake_drafts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(session_id) REFERENCES dsl_flow_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dsl_intake_drafts_session
  ON dsl_intake_drafts(session_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_dsl_intake_drafts_user
  ON dsl_intake_drafts(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS dsl_uploads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  purpose TEXT NOT NULL,
  slot TEXT,
  original_filename TEXT,
  content_type TEXT,
  size_bytes INTEGER,
  storage_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stored',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(session_id) REFERENCES dsl_flow_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dsl_uploads_session_purpose
  ON dsl_uploads(session_id, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dsl_uploads_user_purpose
  ON dsl_uploads(user_id, purpose, created_at DESC);

CREATE TABLE IF NOT EXISTS dsl_audit_events (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dsl_audit_events_session_kind
  ON dsl_audit_events(session_id, kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dsl_audit_events_user_kind
  ON dsl_audit_events(user_id, kind, created_at DESC);
