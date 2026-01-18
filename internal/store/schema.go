package store

import (
	"database/sql"
)

const schemaSQL = `
CREATE TABLE IF NOT EXISTS decision_trees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  dsl_content TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 0,
  is_preset INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  decision_tree_id INTEGER NOT NULL,
  selected_services TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  total_duration INTEGER NOT NULL,
  applied_rules TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  preferred_datetime DATETIME,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY(decision_tree_id) REFERENCES decision_trees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS decision_trees_published_idx ON decision_trees (is_published);
CREATE INDEX IF NOT EXISTS bookings_tree_idx ON bookings (decision_tree_id);
`

func ensureSchema(db *sql.DB) error {
	_, err := db.Exec(schemaSQL)
	return err
}
