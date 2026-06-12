PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dsl_config_versions (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  activated_at TEXT
);

CREATE TABLE IF NOT EXISTS dsl_service_options (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_tone_options (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_budget_options (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  value TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_price_ranges (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  service_value TEXT,
  budget_value TEXT,
  label TEXT NOT NULL,
  min_cents INTEGER,
  max_cents INTEGER,
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_availability_days (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  value TEXT NOT NULL,
  day TEXT NOT NULL,
  date TEXT NOT NULL,
  dot INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  disabled_reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_time_slots (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  value TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

CREATE TABLE IF NOT EXISTS dsl_copy_blocks (
  id TEXT PRIMARY KEY,
  config_version_id TEXT NOT NULL,
  key TEXT NOT NULL,
  text TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(config_version_id) REFERENCES dsl_config_versions(id)
);

INSERT OR IGNORE INTO dsl_config_versions(id, label, status, activated_at)
VALUES ('cfg_default', 'Default Fringe intake config', 'active', datetime('now'));

INSERT OR IGNORE INTO dsl_service_options(id, config_version_id, category, value, title, subtitle, badge, sort_order) VALUES
  ('svc_cut', 'cfg_default', 'color', 'cut', 'Cut', 'Trim · restyle · bangs', '$80+', 10),
  ('svc_highlights', 'cfg_default', 'color', 'highlights', 'Highlights', 'Partial · full · balayage', '$180+', 20),
  ('svc_gloss', 'cfg_default', 'color', 'gloss', 'Gloss refresh', 'Tone · shine · maintenance', '$120+', 30);

INSERT OR IGNORE INTO dsl_tone_options(id, config_version_id, value, label, sort_order) VALUES
  ('tone_neutral', 'cfg_default', 'neutral', 'Neutral', 10),
  ('tone_warm', 'cfg_default', 'warm', 'Warm', 20),
  ('tone_cool', 'cfg_default', 'cool', 'Cool', 30),
  ('tone_dimensional', 'cfg_default', 'dimensional', 'Dimensional', 40),
  ('tone_low_maintenance', 'cfg_default', 'low-maintenance', 'Low upkeep', 50);

INSERT OR IGNORE INTO dsl_budget_options(id, config_version_id, value, title, subtitle, sort_order) VALUES
  ('budget_under_200', 'cfg_default', 'under-200', 'Under $200', 'Refresh, trim, gloss, or maintenance.', 10),
  ('budget_200_350', 'cfg_default', '200-350', '$200–$350', 'Most color refresh and partial highlight plans.', 20),
  ('budget_350_plus', 'cfg_default', '350-plus', '$350+', 'Transformations, extensions, and multi-step color.', 30),
  ('budget_flexible', 'cfg_default', 'flexible', 'Flexible', 'Show me the best plan first.', 40);

INSERT OR IGNORE INTO dsl_price_ranges(id, config_version_id, service_value, budget_value, label, min_cents, max_cents) VALUES
  ('range_under_200', 'cfg_default', NULL, 'under-200', '$120–$190', 12000, 19000),
  ('range_200_350', 'cfg_default', NULL, '200-350', '$220–$340', 22000, 34000),
  ('range_350_plus', 'cfg_default', NULL, '350-plus', '$360–$520', 36000, 52000),
  ('range_cut_default', 'cfg_default', 'cut', NULL, '$80–$160', 8000, 16000),
  ('range_default', 'cfg_default', NULL, NULL, '$220–$420', 22000, 42000);

INSERT OR IGNORE INTO dsl_availability_days(id, config_version_id, value, day, date, dot, disabled, sort_order) VALUES
  ('day_2026_06_18', 'cfg_default', '2026-06-18', '18', '2026-06-18', 1, 0, 10),
  ('day_2026_06_19', 'cfg_default', '2026-06-19', '19', '2026-06-19', 1, 0, 20),
  ('day_2026_06_20', 'cfg_default', '2026-06-20', '20', '2026-06-20', 0, 0, 30),
  ('day_2026_06_21', 'cfg_default', '2026-06-21', '21', '2026-06-21', 1, 0, 40),
  ('day_2026_06_22', 'cfg_default', '2026-06-22', '22', '2026-06-22', 0, 0, 50),
  ('day_2026_06_23', 'cfg_default', '2026-06-23', '23', '2026-06-23', 0, 1, 60),
  ('day_2026_06_24', 'cfg_default', '2026-06-24', '24', '2026-06-24', 0, 1, 70);

INSERT OR IGNORE INTO dsl_time_slots(id, config_version_id, value, title, sort_order) VALUES
  ('time_1030', 'cfg_default', '10:30', '10:30a', 10),
  ('time_1200', 'cfg_default', '12:00', '12:00p', 20),
  ('time_1400', 'cfg_default', '14:00', '2:00p', 30),
  ('time_1630', 'cfg_default', '16:30', '4:30p', 40);
