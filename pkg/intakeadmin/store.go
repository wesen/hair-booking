package intakeadmin

import (
	"context"
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

//go:embed schema.sql
var schemaFS embed.FS

var ErrNotFound = errors.New("intake admin record not found")

type Store struct {
	StateDB  *sql.DB
	ConfigDB *sql.DB
}

type Actor struct {
	UserID string
	Role   string
}

type RequestInput struct {
	FlowSessionID   string         `json:"flowSessionId,omitempty"`
	UserID          string         `json:"userId,omitempty"`
	ConfigVersionID string         `json:"configVersionId"`
	ServiceCategory string         `json:"serviceCategory"`
	ServiceValue    string         `json:"serviceValue"`
	Tones           []string       `json:"tones,omitempty"`
	Damage          *int           `json:"damage,omitempty"`
	Photos          map[string]any `json:"photos,omitempty"`
	BudgetValue     string         `json:"budgetValue,omitempty"`
	DayValue        string         `json:"dayValue,omitempty"`
	TimeValue       string         `json:"timeValue,omitempty"`
	EstimateLabel   string         `json:"estimateLabel,omitempty"`
	CustomerName    string         `json:"customerName,omitempty"`
	CustomerEmail   string         `json:"customerEmail,omitempty"`
	CustomerPhone   string         `json:"customerPhone,omitempty"`
	Request         map[string]any `json:"request,omitempty"`
}

type IntakeRequest struct {
	ID              string         `json:"id"`
	FlowSessionID   string         `json:"flowSessionId,omitempty"`
	UserID          string         `json:"userId,omitempty"`
	ConfigVersionID string         `json:"configVersionId"`
	Status          string         `json:"status"`
	CustomerName    string         `json:"customerName,omitempty"`
	CustomerEmail   string         `json:"customerEmail,omitempty"`
	CustomerPhone   string         `json:"customerPhone,omitempty"`
	ServiceCategory string         `json:"serviceCategory"`
	ServiceValue    string         `json:"serviceValue"`
	Tones           []string       `json:"tones"`
	Damage          *int           `json:"damage,omitempty"`
	Photos          map[string]any `json:"photos"`
	BudgetValue     string         `json:"budgetValue,omitempty"`
	DayValue        string         `json:"dayValue,omitempty"`
	TimeValue       string         `json:"timeValue,omitempty"`
	EstimateLabel   string         `json:"estimateLabel,omitempty"`
	Request         map[string]any `json:"request"`
	InternalNotes   string         `json:"internalNotes,omitempty"`
	CreatedAt       string         `json:"createdAt"`
	UpdatedAt       string         `json:"updatedAt"`
}

type RequestFilters struct {
	Status string
	Limit  int
}

type DashboardStats struct {
	NewRequests       int             `json:"newRequests"`
	NeedsInfo         int             `json:"needsInfo"`
	RecentRequests    []IntakeRequest `json:"recentRequests"`
	RecentAuditEvents []AuditEvent    `json:"recentAuditEvents"`
	ActiveConfigID    string          `json:"activeConfigId,omitempty"`
	ActiveConfigLabel string          `json:"activeConfigLabel,omitempty"`
	HasDraftConfig    bool            `json:"hasDraftConfig"`
}

type ConfigVersion struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
	ActivatedAt string `json:"activatedAt,omitempty"`
}

type ConfigServiceOption struct {
	ID        string         `json:"id"`
	Category  string         `json:"category"`
	Value     string         `json:"value"`
	Title     string         `json:"title"`
	Subtitle  string         `json:"subtitle,omitempty"`
	Badge     string         `json:"badge,omitempty"`
	SortOrder int            `json:"sortOrder"`
	Enabled   bool           `json:"enabled"`
	Metadata  map[string]any `json:"metadata,omitempty"`
}

type ConfigServiceOptionInput struct {
	ID        string `json:"id"`
	Category  string `json:"category"`
	Value     string `json:"value"`
	Title     string `json:"title"`
	Subtitle  string `json:"subtitle,omitempty"`
	Badge     string `json:"badge,omitempty"`
	SortOrder int    `json:"sortOrder"`
	Enabled   bool   `json:"enabled"`
}

type ConfigToneOption struct {
	ID        string `json:"id"`
	Value     string `json:"value"`
	Label     string `json:"label"`
	SortOrder int    `json:"sortOrder"`
	Enabled   bool   `json:"enabled"`
}

type ConfigBudgetOption struct {
	ID        string         `json:"id"`
	Value     string         `json:"value"`
	Title     string         `json:"title"`
	Subtitle  string         `json:"subtitle,omitempty"`
	SortOrder int            `json:"sortOrder"`
	Enabled   bool           `json:"enabled"`
	Metadata  map[string]any `json:"metadata,omitempty"`
}

type ConfigPriceRange struct {
	ID           string `json:"id"`
	ServiceValue string `json:"serviceValue,omitempty"`
	BudgetValue  string `json:"budgetValue,omitempty"`
	Label        string `json:"label"`
	MinCents     *int   `json:"minCents,omitempty"`
	MaxCents     *int   `json:"maxCents,omitempty"`
}

type ConfigAvailabilityDay struct {
	ID             string `json:"id"`
	Value          string `json:"value"`
	Day            string `json:"day"`
	Date           string `json:"date"`
	Dot            bool   `json:"dot"`
	Disabled       bool   `json:"disabled"`
	DisabledReason string `json:"disabledReason,omitempty"`
	SortOrder      int    `json:"sortOrder"`
}

type ConfigTimeSlot struct {
	ID        string `json:"id"`
	Value     string `json:"value"`
	Title     string `json:"title"`
	SortOrder int    `json:"sortOrder"`
	Enabled   bool   `json:"enabled"`
}

type ConfigValidationIssue struct {
	Severity string `json:"severity"`
	Message  string `json:"message"`
	Entity   string `json:"entity,omitempty"`
}

type ConfigValidationReport struct {
	OK     bool                    `json:"ok"`
	Issues []ConfigValidationIssue `json:"issues"`
}

type ConfigEditorData struct {
	Version          ConfigVersion           `json:"version"`
	Services         []ConfigServiceOption   `json:"services"`
	Tones            []ConfigToneOption      `json:"tones"`
	Budgets          []ConfigBudgetOption    `json:"budgets"`
	PriceRanges      []ConfigPriceRange      `json:"priceRanges"`
	AvailabilityDays []ConfigAvailabilityDay `json:"availabilityDays"`
	TimeSlots        []ConfigTimeSlot        `json:"timeSlots"`
	Validation       ConfigValidationReport  `json:"validation"`
}

type AuditEvent struct {
	ID          string         `json:"id"`
	ActorUserID string         `json:"actorUserId,omitempty"`
	ActorRole   string         `json:"actorRole,omitempty"`
	EntityType  string         `json:"entityType"`
	EntityID    string         `json:"entityId"`
	Action      string         `json:"action"`
	Before      map[string]any `json:"before,omitempty"`
	After       map[string]any `json:"after,omitempty"`
	Metadata    map[string]any `json:"metadata,omitempty"`
	CreatedAt   string         `json:"createdAt"`
}

func NewStore(stateDB, configDB *sql.DB) *Store {
	return &Store{StateDB: stateDB, ConfigDB: configDB}
}

func ProvisionSchema(ctx context.Context, db *sql.DB) error {
	if db == nil {
		return fmt.Errorf("provision intake admin schema: database is nil")
	}
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return fmt.Errorf("read intake admin schema: %w", err)
	}
	if _, err := db.ExecContext(ctx, string(schema)); err != nil {
		return fmt.Errorf("provision intake admin schema: %w", err)
	}
	return nil
}

func (s *Store) CreateRequest(ctx context.Context, input RequestInput) (IntakeRequest, error) {
	if s == nil || s.StateDB == nil {
		return IntakeRequest{}, fmt.Errorf("intake admin state DB is not configured")
	}
	if strings.TrimSpace(input.ConfigVersionID) == "" {
		return IntakeRequest{}, fmt.Errorf("configVersionId is required")
	}
	if strings.TrimSpace(input.ServiceCategory) == "" {
		return IntakeRequest{}, fmt.Errorf("serviceCategory is required")
	}
	if strings.TrimSpace(input.ServiceValue) == "" {
		return IntakeRequest{}, fmt.Errorf("serviceValue is required")
	}
	id := "req_" + uuid.NewString()
	tx, err := s.StateDB.BeginTx(ctx, nil)
	if err != nil {
		return IntakeRequest{}, err
	}
	defer func() { _ = tx.Rollback() }()

	toneJSON := mustJSON(input.Tones)
	photosJSON := mustJSON(nonNilMap(input.Photos))
	requestJSON := mustJSON(nonNilMap(input.Request))
	var damage any
	if input.Damage != nil {
		damage = *input.Damage
	}
	_, err = tx.ExecContext(ctx, `INSERT INTO intake_requests(id, flow_session_id, user_id, config_version_id, status, customer_name, customer_email, customer_phone, service_category, service_value, tones_json, damage, photos_json, budget_value, day_value, time_value, estimate_label, request_json)
VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, nullString(input.FlowSessionID), nullString(input.UserID), input.ConfigVersionID,
		nullString(input.CustomerName), nullString(input.CustomerEmail), nullString(input.CustomerPhone), input.ServiceCategory, input.ServiceValue,
		toneJSON, damage, photosJSON, nullString(input.BudgetValue), nullString(input.DayValue), nullString(input.TimeValue), nullString(input.EstimateLabel), requestJSON)
	if err != nil {
		return IntakeRequest{}, err
	}
	if err := insertRequestEvent(ctx, tx, id, input.UserID, "created", map[string]any{"status": "new"}); err != nil {
		return IntakeRequest{}, err
	}
	if err := tx.Commit(); err != nil {
		return IntakeRequest{}, err
	}
	return s.GetRequest(ctx, id)
}

func (s *Store) ListRequests(ctx context.Context, filters RequestFilters) ([]IntakeRequest, error) {
	if s == nil || s.StateDB == nil {
		return nil, fmt.Errorf("intake admin state DB is not configured")
	}
	limit := filters.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	query := `SELECT id, COALESCE(flow_session_id, ''), COALESCE(user_id, ''), config_version_id, status, COALESCE(customer_name, ''), COALESCE(customer_email, ''), COALESCE(customer_phone, ''), service_category, service_value, tones_json, damage, photos_json, COALESCE(budget_value, ''), COALESCE(day_value, ''), COALESCE(time_value, ''), COALESCE(estimate_label, ''), request_json, internal_notes, created_at, updated_at FROM intake_requests`
	args := []any{}
	if strings.TrimSpace(filters.Status) != "" {
		query += ` WHERE status = ?`
		args = append(args, filters.Status)
	}
	query += ` ORDER BY created_at DESC LIMIT ?`
	args = append(args, limit)
	rows, err := s.StateDB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []IntakeRequest
	for rows.Next() {
		request, err := scanRequest(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, request)
	}
	return out, rows.Err()
}

func (s *Store) GetRequest(ctx context.Context, id string) (IntakeRequest, error) {
	if s == nil || s.StateDB == nil {
		return IntakeRequest{}, fmt.Errorf("intake admin state DB is not configured")
	}
	row := s.StateDB.QueryRowContext(ctx, `SELECT id, COALESCE(flow_session_id, ''), COALESCE(user_id, ''), config_version_id, status, COALESCE(customer_name, ''), COALESCE(customer_email, ''), COALESCE(customer_phone, ''), service_category, service_value, tones_json, damage, photos_json, COALESCE(budget_value, ''), COALESCE(day_value, ''), COALESCE(time_value, ''), COALESCE(estimate_label, ''), request_json, internal_notes, created_at, updated_at FROM intake_requests WHERE id = ?`, id)
	request, err := scanRequest(row)
	if errors.Is(err, sql.ErrNoRows) {
		return IntakeRequest{}, ErrNotFound
	}
	return request, err
}

func (s *Store) UpdateRequestStatus(ctx context.Context, id, status string, actor Actor, note string) (IntakeRequest, error) {
	if s == nil || s.StateDB == nil {
		return IntakeRequest{}, fmt.Errorf("intake admin state DB is not configured")
	}
	if status == "" {
		return IntakeRequest{}, fmt.Errorf("status is required")
	}
	tx, err := s.StateDB.BeginTx(ctx, nil)
	if err != nil {
		return IntakeRequest{}, err
	}
	defer func() { _ = tx.Rollback() }()
	result, err := tx.ExecContext(ctx, `UPDATE intake_requests SET status = ?, internal_notes = CASE WHEN ? = '' THEN internal_notes ELSE trim(internal_notes || char(10) || ?) END, updated_at = datetime('now'), reviewed_at = CASE WHEN ? IN ('reviewing', 'contacted', 'needs_info') THEN COALESCE(reviewed_at, datetime('now')) ELSE reviewed_at END, booked_at = CASE WHEN ? = 'booked' THEN datetime('now') ELSE booked_at END, archived_at = CASE WHEN ? = 'archived' THEN datetime('now') ELSE archived_at END WHERE id = ?`, status, note, note, status, status, status, id)
	if err != nil {
		return IntakeRequest{}, err
	}
	if n, _ := result.RowsAffected(); n == 0 {
		return IntakeRequest{}, ErrNotFound
	}
	if err := insertRequestEvent(ctx, tx, id, actor.UserID, "status_changed", map[string]any{"status": status, "note": note}); err != nil {
		return IntakeRequest{}, err
	}
	if err := insertAuditEvent(ctx, tx, actor, "intake_request", id, "update_status", nil, map[string]any{"status": status}, nil); err != nil {
		return IntakeRequest{}, err
	}
	if err := tx.Commit(); err != nil {
		return IntakeRequest{}, err
	}
	return s.GetRequest(ctx, id)
}

func (s *Store) DashboardStats(ctx context.Context) (DashboardStats, error) {
	var stats DashboardStats
	if s == nil || s.StateDB == nil {
		return stats, fmt.Errorf("intake admin state DB is not configured")
	}
	_ = s.StateDB.QueryRowContext(ctx, `SELECT count(*) FROM intake_requests WHERE status = 'new'`).Scan(&stats.NewRequests)
	_ = s.StateDB.QueryRowContext(ctx, `SELECT count(*) FROM intake_requests WHERE status = 'needs_info'`).Scan(&stats.NeedsInfo)
	recent, err := s.ListRequests(ctx, RequestFilters{Limit: 5})
	if err != nil {
		return stats, err
	}
	stats.RecentRequests = recent
	if s.ConfigDB != nil {
		var activated sql.NullString
		_ = s.ConfigDB.QueryRowContext(ctx, `SELECT id, label, activated_at FROM dsl_config_versions WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1`).Scan(&stats.ActiveConfigID, &stats.ActiveConfigLabel, &activated)
		var draftCount int
		_ = s.ConfigDB.QueryRowContext(ctx, `SELECT count(*) FROM dsl_config_versions WHERE status = 'draft'`).Scan(&draftCount)
		stats.HasDraftConfig = draftCount > 0
	}
	return stats, nil
}

func (s *Store) ListConfigVersions(ctx context.Context) ([]ConfigVersion, error) {
	if s == nil || s.ConfigDB == nil {
		return nil, fmt.Errorf("intake admin config DB is not configured")
	}
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, label, status, created_at, COALESCE(activated_at, '') FROM dsl_config_versions ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigVersion
	for rows.Next() {
		var v ConfigVersion
		if err := rows.Scan(&v.ID, &v.Label, &v.Status, &v.CreatedAt, &v.ActivatedAt); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

func (s *Store) GetConfigEditorData(ctx context.Context, configVersionID string) (ConfigEditorData, error) {
	if s == nil || s.ConfigDB == nil {
		return ConfigEditorData{}, fmt.Errorf("intake admin config DB is not configured")
	}
	version, err := s.resolveConfigVersion(ctx, configVersionID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data := ConfigEditorData{Version: version}
	data.Services, err = s.listConfigServices(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.Tones, err = s.listConfigTones(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.Budgets, err = s.listConfigBudgets(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.PriceRanges, err = s.listConfigPriceRanges(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.AvailabilityDays, err = s.listConfigAvailabilityDays(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.TimeSlots, err = s.listConfigTimeSlots(ctx, version.ID)
	if err != nil {
		return ConfigEditorData{}, err
	}
	data.Validation = validateConfigEditorData(data)
	return data, nil
}

func (s *Store) resolveConfigVersion(ctx context.Context, configVersionID string) (ConfigVersion, error) {
	query := `SELECT id, label, status, created_at, COALESCE(activated_at, '') FROM dsl_config_versions WHERE id = ?`
	args := []any{configVersionID}
	if strings.TrimSpace(configVersionID) == "" || configVersionID == "draft" {
		query = `SELECT id, label, status, created_at, COALESCE(activated_at, '') FROM dsl_config_versions WHERE status = 'draft' ORDER BY created_at DESC LIMIT 1`
		args = nil
	}
	var v ConfigVersion
	err := s.ConfigDB.QueryRowContext(ctx, query, args...).Scan(&v.ID, &v.Label, &v.Status, &v.CreatedAt, &v.ActivatedAt)
	if errors.Is(err, sql.ErrNoRows) && (strings.TrimSpace(configVersionID) == "" || configVersionID == "draft") {
		err = s.ConfigDB.QueryRowContext(ctx, `SELECT id, label, status, created_at, COALESCE(activated_at, '') FROM dsl_config_versions WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1`).Scan(&v.ID, &v.Label, &v.Status, &v.CreatedAt, &v.ActivatedAt)
	}
	if errors.Is(err, sql.ErrNoRows) {
		return ConfigVersion{}, ErrNotFound
	}
	return v, err
}

func (s *Store) listConfigServices(ctx context.Context, id string) ([]ConfigServiceOption, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, category, value, title, COALESCE(subtitle, ''), COALESCE(badge, ''), sort_order, enabled, metadata_json FROM dsl_service_options WHERE config_version_id = ? ORDER BY category, sort_order, title`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigServiceOption
	for rows.Next() {
		var item ConfigServiceOption
		var enabled int
		var metadataJSON string
		if err := rows.Scan(&item.ID, &item.Category, &item.Value, &item.Title, &item.Subtitle, &item.Badge, &item.SortOrder, &enabled, &metadataJSON); err != nil {
			return nil, err
		}
		item.Enabled = enabled != 0
		_ = json.Unmarshal([]byte(metadataJSON), &item.Metadata)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) listConfigTones(ctx context.Context, id string) ([]ConfigToneOption, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, value, label, sort_order, enabled FROM dsl_tone_options WHERE config_version_id = ? ORDER BY sort_order, label`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigToneOption
	for rows.Next() {
		var item ConfigToneOption
		var enabled int
		if err := rows.Scan(&item.ID, &item.Value, &item.Label, &item.SortOrder, &enabled); err != nil {
			return nil, err
		}
		item.Enabled = enabled != 0
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) listConfigBudgets(ctx context.Context, id string) ([]ConfigBudgetOption, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, value, title, COALESCE(subtitle, ''), sort_order, enabled, metadata_json FROM dsl_budget_options WHERE config_version_id = ? ORDER BY sort_order, title`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigBudgetOption
	for rows.Next() {
		var item ConfigBudgetOption
		var enabled int
		var metadataJSON string
		if err := rows.Scan(&item.ID, &item.Value, &item.Title, &item.Subtitle, &item.SortOrder, &enabled, &metadataJSON); err != nil {
			return nil, err
		}
		item.Enabled = enabled != 0
		_ = json.Unmarshal([]byte(metadataJSON), &item.Metadata)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) listConfigPriceRanges(ctx context.Context, id string) ([]ConfigPriceRange, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, COALESCE(service_value, ''), COALESCE(budget_value, ''), label, min_cents, max_cents FROM dsl_price_ranges WHERE config_version_id = ? ORDER BY COALESCE(service_value, ''), COALESCE(budget_value, ''), label`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigPriceRange
	for rows.Next() {
		var item ConfigPriceRange
		var min, max sql.NullInt64
		if err := rows.Scan(&item.ID, &item.ServiceValue, &item.BudgetValue, &item.Label, &min, &max); err != nil {
			return nil, err
		}
		if min.Valid {
			v := int(min.Int64)
			item.MinCents = &v
		}
		if max.Valid {
			v := int(max.Int64)
			item.MaxCents = &v
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) listConfigAvailabilityDays(ctx context.Context, id string) ([]ConfigAvailabilityDay, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, value, day, date, dot, disabled, COALESCE(disabled_reason, ''), sort_order FROM dsl_availability_days WHERE config_version_id = ? ORDER BY sort_order, date`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigAvailabilityDay
	for rows.Next() {
		var item ConfigAvailabilityDay
		var dot, disabled int
		if err := rows.Scan(&item.ID, &item.Value, &item.Day, &item.Date, &dot, &disabled, &item.DisabledReason, &item.SortOrder); err != nil {
			return nil, err
		}
		item.Dot = dot != 0
		item.Disabled = disabled != 0
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) listConfigTimeSlots(ctx context.Context, id string) ([]ConfigTimeSlot, error) {
	rows, err := s.ConfigDB.QueryContext(ctx, `SELECT id, value, title, sort_order, enabled FROM dsl_time_slots WHERE config_version_id = ? ORDER BY sort_order, title`, id)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	var out []ConfigTimeSlot
	for rows.Next() {
		var item ConfigTimeSlot
		var enabled int
		if err := rows.Scan(&item.ID, &item.Value, &item.Title, &item.SortOrder, &enabled); err != nil {
			return nil, err
		}
		item.Enabled = enabled != 0
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) UpdateServiceOption(ctx context.Context, input ConfigServiceOptionInput, actor Actor) (ConfigServiceOption, error) {
	if s == nil || s.ConfigDB == nil {
		return ConfigServiceOption{}, fmt.Errorf("intake admin config DB is not configured")
	}
	input.ID = strings.TrimSpace(input.ID)
	input.Category = strings.TrimSpace(input.Category)
	input.Value = strings.TrimSpace(input.Value)
	input.Title = strings.TrimSpace(input.Title)
	if input.ID == "" {
		return ConfigServiceOption{}, fmt.Errorf("service option id is required")
	}
	if input.Category == "" {
		return ConfigServiceOption{}, fmt.Errorf("category is required")
	}
	if input.Value == "" {
		return ConfigServiceOption{}, fmt.Errorf("value is required")
	}
	if input.Title == "" {
		return ConfigServiceOption{}, fmt.Errorf("title is required")
	}
	tx, err := s.ConfigDB.BeginTx(ctx, nil)
	if err != nil {
		return ConfigServiceOption{}, err
	}
	defer func() { _ = tx.Rollback() }()
	var configVersionID, status string
	var beforeJSON string
	if err := tx.QueryRowContext(ctx, `SELECT config_version_id, (SELECT status FROM dsl_config_versions WHERE id = dsl_service_options.config_version_id), json_object('id', id, 'category', category, 'value', value, 'title', title, 'subtitle', COALESCE(subtitle, ''), 'badge', COALESCE(badge, ''), 'sortOrder', sort_order, 'enabled', enabled) FROM dsl_service_options WHERE id = ?`, input.ID).Scan(&configVersionID, &status, &beforeJSON); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ConfigServiceOption{}, ErrNotFound
		}
		return ConfigServiceOption{}, err
	}
	if status != "draft" {
		return ConfigServiceOption{}, fmt.Errorf("only draft config service options can be edited")
	}
	_, err = tx.ExecContext(ctx, `UPDATE dsl_service_options SET category = ?, value = ?, title = ?, subtitle = ?, badge = ?, sort_order = ?, enabled = ? WHERE id = ?`, input.Category, input.Value, input.Title, nullString(input.Subtitle), nullString(input.Badge), input.SortOrder, boolInt(input.Enabled), input.ID)
	if err != nil {
		return ConfigServiceOption{}, err
	}
	if err := tx.Commit(); err != nil {
		return ConfigServiceOption{}, err
	}
	var before map[string]any
	_ = json.Unmarshal([]byte(beforeJSON), &before)
	after := map[string]any{"id": input.ID, "category": input.Category, "value": input.Value, "title": input.Title, "subtitle": input.Subtitle, "badge": input.Badge, "sortOrder": input.SortOrder, "enabled": input.Enabled, "configVersionId": configVersionID}
	_ = s.insertAdminAuditEvent(ctx, actor, "config_service_option", input.ID, "update", before, after, map[string]any{"configVersionId": configVersionID})
	services, err := s.listConfigServices(ctx, configVersionID)
	if err != nil {
		return ConfigServiceOption{}, err
	}
	for _, service := range services {
		if service.ID == input.ID {
			return service, nil
		}
	}
	return ConfigServiceOption{}, ErrNotFound
}

func validateConfigEditorData(data ConfigEditorData) ConfigValidationReport {
	report := ConfigValidationReport{OK: true}
	if len(data.Services) == 0 {
		report.Issues = append(report.Issues, ConfigValidationIssue{Severity: "error", Entity: "services", Message: "Config must contain at least one service option."})
	}
	if len(data.Budgets) == 0 {
		report.Issues = append(report.Issues, ConfigValidationIssue{Severity: "error", Entity: "budgets", Message: "Config must contain at least one budget option."})
	}
	if len(data.PriceRanges) == 0 {
		report.Issues = append(report.Issues, ConfigValidationIssue{Severity: "error", Entity: "pricing", Message: "Config must contain at least one price range."})
	}
	if len(data.AvailabilityDays) == 0 {
		report.Issues = append(report.Issues, ConfigValidationIssue{Severity: "warning", Entity: "availability", Message: "No availability days are configured."})
	}
	for _, issue := range report.Issues {
		if issue.Severity == "error" {
			report.OK = false
		}
	}
	return report
}

func (s *Store) CreateDraftFromActive(ctx context.Context, label string, actor Actor) (ConfigVersion, error) {
	if s == nil || s.ConfigDB == nil {
		return ConfigVersion{}, fmt.Errorf("intake admin config DB is not configured")
	}
	label = strings.TrimSpace(label)
	if label == "" {
		label = "Draft intake config " + time.Now().UTC().Format("2006-01-02 15:04")
	}
	tx, err := s.ConfigDB.BeginTx(ctx, nil)
	if err != nil {
		return ConfigVersion{}, err
	}
	defer func() { _ = tx.Rollback() }()
	var activeID string
	if err := tx.QueryRowContext(ctx, `SELECT id FROM dsl_config_versions WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1`).Scan(&activeID); err != nil {
		return ConfigVersion{}, err
	}
	draftID := "cfg_" + strings.ReplaceAll(uuid.NewString(), "-", "_")
	if _, err := tx.ExecContext(ctx, `INSERT INTO dsl_config_versions(id, label, status) VALUES (?, ?, 'draft')`, draftID, label); err != nil {
		return ConfigVersion{}, err
	}
	copyStatements := []string{
		`INSERT INTO dsl_service_options(id, config_version_id, category, value, title, subtitle, badge, sort_order, enabled, metadata_json) SELECT id || '_' || ?, ?, category, value, title, subtitle, badge, sort_order, enabled, metadata_json FROM dsl_service_options WHERE config_version_id = ?`,
		`INSERT INTO dsl_tone_options(id, config_version_id, value, label, sort_order, enabled) SELECT id || '_' || ?, ?, value, label, sort_order, enabled FROM dsl_tone_options WHERE config_version_id = ?`,
		`INSERT INTO dsl_budget_options(id, config_version_id, value, title, subtitle, sort_order, enabled, metadata_json) SELECT id || '_' || ?, ?, value, title, subtitle, sort_order, enabled, metadata_json FROM dsl_budget_options WHERE config_version_id = ?`,
		`INSERT INTO dsl_price_ranges(id, config_version_id, service_value, budget_value, label, min_cents, max_cents) SELECT id || '_' || ?, ?, service_value, budget_value, label, min_cents, max_cents FROM dsl_price_ranges WHERE config_version_id = ?`,
		`INSERT INTO dsl_availability_days(id, config_version_id, value, day, date, dot, disabled, disabled_reason, sort_order) SELECT id || '_' || ?, ?, value, day, date, dot, disabled, disabled_reason, sort_order FROM dsl_availability_days WHERE config_version_id = ?`,
		`INSERT INTO dsl_time_slots(id, config_version_id, value, title, sort_order, enabled) SELECT id || '_' || ?, ?, value, title, sort_order, enabled FROM dsl_time_slots WHERE config_version_id = ?`,
		`INSERT INTO dsl_copy_blocks(id, config_version_id, key, text, metadata_json) SELECT id || '_' || ?, ?, key, text, metadata_json FROM dsl_copy_blocks WHERE config_version_id = ?`,
	}
	for _, stmt := range copyStatements {
		if _, err := tx.ExecContext(ctx, stmt, draftID, draftID, activeID); err != nil {
			return ConfigVersion{}, err
		}
	}
	if err := tx.Commit(); err != nil {
		return ConfigVersion{}, err
	}
	_ = s.insertAdminAuditEvent(ctx, actor, "config_version", draftID, "create_draft", map[string]any{"sourceConfigVersionId": activeID}, map[string]any{"label": label}, nil)
	versions, err := s.ListConfigVersions(ctx)
	if err != nil {
		return ConfigVersion{}, err
	}
	for _, version := range versions {
		if version.ID == draftID {
			return version, nil
		}
	}
	return ConfigVersion{}, ErrNotFound
}

func (s *Store) PublishConfigVersion(ctx context.Context, id string, actor Actor) (ConfigVersion, error) {
	if s == nil || s.ConfigDB == nil {
		return ConfigVersion{}, fmt.Errorf("intake admin config DB is not configured")
	}
	tx, err := s.ConfigDB.BeginTx(ctx, nil)
	if err != nil {
		return ConfigVersion{}, err
	}
	defer func() { _ = tx.Rollback() }()
	var status string
	if err := tx.QueryRowContext(ctx, `SELECT status FROM dsl_config_versions WHERE id = ?`, id).Scan(&status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ConfigVersion{}, ErrNotFound
		}
		return ConfigVersion{}, err
	}
	if status != "draft" {
		return ConfigVersion{}, fmt.Errorf("only draft config versions can be published")
	}
	if err := validateConfigVersion(ctx, tx, id); err != nil {
		return ConfigVersion{}, err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE dsl_config_versions SET status = 'archived' WHERE status = 'active'`); err != nil {
		return ConfigVersion{}, err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE dsl_config_versions SET status = 'active', activated_at = datetime('now') WHERE id = ?`, id); err != nil {
		return ConfigVersion{}, err
	}
	if err := tx.Commit(); err != nil {
		return ConfigVersion{}, err
	}
	_ = s.insertAdminAuditEvent(ctx, actor, "config_version", id, "publish", map[string]any{"status": status}, map[string]any{"status": "active"}, nil)
	versions, err := s.ListConfigVersions(ctx)
	if err != nil {
		return ConfigVersion{}, err
	}
	for _, version := range versions {
		if version.ID == id {
			return version, nil
		}
	}
	return ConfigVersion{}, ErrNotFound
}

func validateConfigVersion(ctx context.Context, tx *sql.Tx, id string) error {
	checks := []struct{ query, message string }{
		{`SELECT count(*) FROM dsl_service_options WHERE config_version_id = ? AND enabled = 1 AND trim(title) != ''`, "config must have at least one enabled service option"},
		{`SELECT count(*) FROM dsl_budget_options WHERE config_version_id = ? AND enabled = 1 AND trim(title) != ''`, "config must have at least one enabled budget option"},
		{`SELECT count(*) FROM dsl_price_ranges WHERE config_version_id = ? AND service_value IS NULL AND budget_value IS NULL`, "config must have a default price range fallback"},
	}
	for _, check := range checks {
		var count int
		if err := tx.QueryRowContext(ctx, check.query, id).Scan(&count); err != nil {
			return err
		}
		if count == 0 {
			return errors.New(check.message)
		}
	}
	return nil
}

type requestScanner interface{ Scan(dest ...any) error }

func scanRequest(row requestScanner) (IntakeRequest, error) {
	var request IntakeRequest
	var tonesJSON, photosJSON, requestJSON string
	var damage sql.NullInt64
	if err := row.Scan(&request.ID, &request.FlowSessionID, &request.UserID, &request.ConfigVersionID, &request.Status, &request.CustomerName, &request.CustomerEmail, &request.CustomerPhone, &request.ServiceCategory, &request.ServiceValue, &tonesJSON, &damage, &photosJSON, &request.BudgetValue, &request.DayValue, &request.TimeValue, &request.EstimateLabel, &requestJSON, &request.InternalNotes, &request.CreatedAt, &request.UpdatedAt); err != nil {
		return request, err
	}
	if damage.Valid {
		v := int(damage.Int64)
		request.Damage = &v
	}
	_ = json.Unmarshal([]byte(tonesJSON), &request.Tones)
	_ = json.Unmarshal([]byte(photosJSON), &request.Photos)
	_ = json.Unmarshal([]byte(requestJSON), &request.Request)
	if request.Tones == nil {
		request.Tones = []string{}
	}
	if request.Photos == nil {
		request.Photos = map[string]any{}
	}
	if request.Request == nil {
		request.Request = map[string]any{}
	}
	return request, nil
}

func insertRequestEvent(ctx context.Context, tx *sql.Tx, requestID, actorUserID, kind string, payload map[string]any) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO intake_request_events(id, request_id, actor_user_id, kind, payload_json) VALUES (?, ?, ?, ?, ?)`, "evt_"+uuid.NewString(), requestID, nullString(actorUserID), kind, mustJSON(nonNilMap(payload)))
	return err
}

func insertAuditEvent(ctx context.Context, tx *sql.Tx, actor Actor, entityType, entityID, action string, before, after, metadata map[string]any) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO admin_audit_events(id, actor_user_id, actor_role, entity_type, entity_id, action, before_json, after_json, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, "audit_"+uuid.NewString(), nullString(actor.UserID), nullString(actor.Role), entityType, entityID, action, nullableJSON(before), nullableJSON(after), mustJSON(nonNilMap(metadata)))
	return err
}

func (s *Store) insertAdminAuditEvent(ctx context.Context, actor Actor, entityType, entityID, action string, before, after, metadata map[string]any) error {
	if s == nil || s.StateDB == nil {
		return nil
	}
	_, err := s.StateDB.ExecContext(ctx, `INSERT INTO admin_audit_events(id, actor_user_id, actor_role, entity_type, entity_id, action, before_json, after_json, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, "audit_"+uuid.NewString(), nullString(actor.UserID), nullString(actor.Role), entityType, entityID, action, nullableJSON(before), nullableJSON(after), mustJSON(nonNilMap(metadata)))
	return err
}

func nullString(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func boolInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func nullableJSON(value map[string]any) any {
	if value == nil {
		return nil
	}
	return mustJSON(value)
}

func nonNilMap(value map[string]any) map[string]any {
	if value == nil {
		return map[string]any{}
	}
	return value
}

func mustJSON(value any) string {
	b, err := json.Marshal(value)
	if err != nil {
		return "{}"
	}
	return string(b)
}
