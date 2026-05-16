PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS intake_requests (
  id TEXT PRIMARY KEY,
  flow_session_id TEXT,
  user_id TEXT,
  config_version_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  service_category TEXT NOT NULL,
  service_value TEXT NOT NULL,
  tones_json TEXT NOT NULL DEFAULT '[]',
  damage INTEGER,
  photos_json TEXT NOT NULL DEFAULT '{}',
  budget_value TEXT,
  day_value TEXT,
  time_value TEXT,
  estimate_label TEXT,
  request_json TEXT NOT NULL DEFAULT '{}',
  internal_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  booked_at TEXT,
  archived_at TEXT,
  FOREIGN KEY(flow_session_id) REFERENCES dsl_flow_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_intake_requests_status_created
  ON intake_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intake_requests_config
  ON intake_requests(config_version_id, created_at DESC);

CREATE TABLE IF NOT EXISTS intake_request_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  actor_user_id TEXT,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(request_id) REFERENCES intake_requests(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_intake_request_events_request
  ON intake_request_events(request_id, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  actor_role TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_entity
  ON admin_audit_events(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_actor
  ON admin_audit_events(actor_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_flow_sessions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  page_version INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT
);
