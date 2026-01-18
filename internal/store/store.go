package store

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

// Store wraps the SQLite connection and data access helpers.
type Store struct {
	db *sql.DB
}

// Open initializes a SQLite-backed store and ensures schema exists.
func Open(path string) (*Store, error) {
	if path == "" {
		path = "file:decision-tree.db?_foreign_keys=on"
	}
	if path == ":memory:" {
		path = "file::memory:?cache=shared"
	}

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	if err := ensureSchema(db); err != nil {
		return nil, err
	}

	return &Store{db: db}, nil
}

// Close shuts down the database connection.
func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

// DecisionTree represents a decision tree record.
type DecisionTree struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	DSLContent  string    `json:"dslContent"`
	IsPublished bool      `json:"isPublished"`
	IsPreset    bool      `json:"isPreset"`
	Version     int       `json:"version"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Booking represents a booking record.
type Booking struct {
	ID             int64      `json:"id"`
	DecisionTreeID int64      `json:"decisionTreeId"`
	Selected       string     `json:"selectedServices"`
	TotalPrice     int        `json:"totalPrice"`
	TotalDuration  int        `json:"totalDuration"`
	AppliedRules   *string    `json:"appliedRules,omitempty"`
	ClientName     *string    `json:"clientName,omitempty"`
	ClientEmail    *string    `json:"clientEmail,omitempty"`
	ClientPhone    *string    `json:"clientPhone,omitempty"`
	PreferredAt    *time.Time `json:"preferredDateTime,omitempty"`
	Status         string     `json:"status"`
	Notes          *string    `json:"notes,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

// ListDecisionTrees returns published or all decision trees.
func (s *Store) ListDecisionTrees(publishedOnly bool) ([]DecisionTree, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("store not initialized")
	}

	query := `SELECT id, name, description, dsl_content, is_published, is_preset, version, created_at, updated_at FROM decision_trees`
	if publishedOnly {
		query += ` WHERE is_published = 1`
	}
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []DecisionTree
	for rows.Next() {
		var tree DecisionTree
		var isPublished int
		var isPreset int
		if err := rows.Scan(&tree.ID, &tree.Name, &tree.Description, &tree.DSLContent, &isPublished, &isPreset, &tree.Version, &tree.CreatedAt, &tree.UpdatedAt); err != nil {
			return nil, err
		}
		tree.IsPublished = isPublished == 1
		tree.IsPreset = isPreset == 1
		result = append(result, tree)
	}
	return result, rows.Err()
}

// GetDecisionTree returns a single tree by ID.
func (s *Store) GetDecisionTree(id int64) (*DecisionTree, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("store not initialized")
	}

	row := s.db.QueryRow(`SELECT id, name, description, dsl_content, is_published, is_preset, version, created_at, updated_at FROM decision_trees WHERE id = ?`, id)
	var tree DecisionTree
	var isPublished int
	var isPreset int
	if err := row.Scan(&tree.ID, &tree.Name, &tree.Description, &tree.DSLContent, &isPublished, &isPreset, &tree.Version, &tree.CreatedAt, &tree.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	tree.IsPublished = isPublished == 1
	tree.IsPreset = isPreset == 1
	return &tree, nil
}

// CreateDecisionTree inserts a new decision tree.
func (s *Store) CreateDecisionTree(tree DecisionTree) (int64, error) {
	if s == nil || s.db == nil {
		return 0, errors.New("store not initialized")
	}

	now := time.Now()
	result, err := s.db.Exec(`INSERT INTO decision_trees (name, description, dsl_content, is_published, is_preset, version, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		tree.Name,
		tree.Description,
		tree.DSLContent,
		boolToInt(tree.IsPublished),
		boolToInt(tree.IsPreset),
		tree.Version,
		now,
		now,
	)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// UpdateDecisionTree updates a decision tree by ID.
func (s *Store) UpdateDecisionTree(id int64, updates DecisionTreeUpdates) error {
	if s == nil || s.db == nil {
		return errors.New("store not initialized")
	}

	setClause, args := updates.build()
	if setClause == "" {
		return nil
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE decision_trees SET %s WHERE id = ?", setClause)
	_, err := s.db.Exec(query, args...)
	return err
}

// DeleteDecisionTree removes a decision tree.
func (s *Store) DeleteDecisionTree(id int64) error {
	if s == nil || s.db == nil {
		return errors.New("store not initialized")
	}
	_, err := s.db.Exec(`DELETE FROM decision_trees WHERE id = ?`, id)
	return err
}

// CreateBooking inserts a booking record.
func (s *Store) CreateBooking(booking Booking) (int64, error) {
	if s == nil || s.db == nil {
		return 0, errors.New("store not initialized")
	}

	now := time.Now()
	status := booking.Status
	if status == "" {
		status = "pending"
	}

	result, err := s.db.Exec(`INSERT INTO bookings (decision_tree_id, selected_services, total_price, total_duration, applied_rules, client_name, client_email, client_phone, preferred_datetime, status, notes, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		booking.DecisionTreeID,
		booking.Selected,
		booking.TotalPrice,
		booking.TotalDuration,
		booking.AppliedRules,
		booking.ClientName,
		booking.ClientEmail,
		booking.ClientPhone,
		booking.PreferredAt,
		status,
		booking.Notes,
		now,
		now,
	)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// ListBookings returns all bookings.
func (s *Store) ListBookings() ([]Booking, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("store not initialized")
	}

	rows, err := s.db.Query(`SELECT id, decision_tree_id, selected_services, total_price, total_duration, applied_rules, client_name, client_email, client_phone, preferred_datetime, status, notes, created_at, updated_at FROM bookings ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Booking
	for rows.Next() {
		var booking Booking
		if err := rows.Scan(&booking.ID, &booking.DecisionTreeID, &booking.Selected, &booking.TotalPrice, &booking.TotalDuration, &booking.AppliedRules, &booking.ClientName, &booking.ClientEmail, &booking.ClientPhone, &booking.PreferredAt, &booking.Status, &booking.Notes, &booking.CreatedAt, &booking.UpdatedAt); err != nil {
			return nil, err
		}
		results = append(results, booking)
	}
	return results, rows.Err()
}

// GetBooking returns a booking by ID.
func (s *Store) GetBooking(id int64) (*Booking, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("store not initialized")
	}

	row := s.db.QueryRow(`SELECT id, decision_tree_id, selected_services, total_price, total_duration, applied_rules, client_name, client_email, client_phone, preferred_datetime, status, notes, created_at, updated_at FROM bookings WHERE id = ?`, id)
	var booking Booking
	if err := row.Scan(&booking.ID, &booking.DecisionTreeID, &booking.Selected, &booking.TotalPrice, &booking.TotalDuration, &booking.AppliedRules, &booking.ClientName, &booking.ClientEmail, &booking.ClientPhone, &booking.PreferredAt, &booking.Status, &booking.Notes, &booking.CreatedAt, &booking.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &booking, nil
}

// DecisionTreeUpdates allows partial updates.
type DecisionTreeUpdates struct {
	Name        *string
	Description *string
	DSLContent  *string
	IsPublished *bool
}

func (u DecisionTreeUpdates) build() (string, []any) {
	clauses := make([]string, 0, 4)
	args := make([]any, 0, 4)

	if u.Name != nil {
		clauses = append(clauses, "name = ?")
		args = append(args, *u.Name)
	}
	if u.Description != nil {
		clauses = append(clauses, "description = ?")
		args = append(args, *u.Description)
	}
	if u.DSLContent != nil {
		clauses = append(clauses, "dsl_content = ?")
		args = append(args, *u.DSLContent)
	}
	if u.IsPublished != nil {
		clauses = append(clauses, "is_published = ?")
		args = append(args, boolToInt(*u.IsPublished))
	}

	if len(clauses) == 0 {
		return "", nil
	}

	clauses = append(clauses, "updated_at = ?")
	args = append(args, time.Now())

	return joinClauses(clauses, ", "), args
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func joinClauses(parts []string, sep string) string {
	if len(parts) == 0 {
		return ""
	}

	out := parts[0]
	for i := 1; i < len(parts); i++ {
		out += sep + parts[i]
	}
	return out
}
