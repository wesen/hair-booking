package appointments

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pkg/errors"
)

type PostgresRepository struct {
	pool *pgxpool.Pool
}

var _ Repository = (*PostgresRepository)(nil)

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) ListScheduleBlocks(ctx context.Context) ([]ScheduleBlock, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select day_of_week, to_char(start_time, 'HH24:MI:SS'), to_char(end_time, 'HH24:MI:SS'), is_available
from schedule_blocks
order by day_of_week, start_time, end_time
`)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query schedule blocks")
	}
	defer rows.Close()

	blocks := []ScheduleBlock{}
	for rows.Next() {
		block := ScheduleBlock{}
		if err := rows.Scan(&block.DayOfWeek, &block.StartTime, &block.EndTime, &block.IsAvailable); err != nil {
			return nil, errors.Wrap(err, "failed to scan schedule block")
		}
		blocks = append(blocks, block)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate schedule blocks")
	}
	return blocks, nil
}

func (r *PostgresRepository) ListScheduleOverrides(ctx context.Context, startDate, endDate time.Time) ([]ScheduleOverride, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select to_char(date, 'YYYY-MM-DD'), is_blocked, coalesce(to_char(start_time, 'HH24:MI:SS'), ''), coalesce(to_char(end_time, 'HH24:MI:SS'), '')
from schedule_overrides
where date between $1 and $2
order by date
`, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
	if err != nil {
		return nil, errors.Wrap(err, "failed to query schedule overrides")
	}
	defer rows.Close()

	overrides := []ScheduleOverride{}
	for rows.Next() {
		override := ScheduleOverride{}
		if err := rows.Scan(&override.Date, &override.IsBlocked, &override.StartTime, &override.EndTime); err != nil {
			return nil, errors.Wrap(err, "failed to scan schedule override")
		}
		overrides = append(overrides, override)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate schedule overrides")
	}
	return overrides, nil
}

func (r *PostgresRepository) ListBookedAppointments(ctx context.Context, startDate, endDate time.Time) ([]Appointment, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select id, client_id, service_id, intake_id, to_char(date, 'YYYY-MM-DD'), to_char(start_time, 'HH24:MI:SS'),
  duration_min_snapshot, status, created_at, updated_at
from appointments
where date between $1 and $2
  and status <> 'cancelled'
order by date, start_time
`, startDate.Format(time.DateOnly), endDate.Format(time.DateOnly))
	if err != nil {
		return nil, errors.Wrap(err, "failed to query booked appointments")
	}
	defer rows.Close()

	appointments := []Appointment{}
	for rows.Next() {
		appointment := Appointment{}
		if err := rows.Scan(
			&appointment.ID,
			&appointment.ClientID,
			&appointment.ServiceID,
			&appointment.IntakeID,
			&appointment.Date,
			&appointment.StartTime,
			&appointment.DurationMinSnapshot,
			&appointment.Status,
			&appointment.CreatedAt,
			&appointment.UpdatedAt,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan booked appointment")
		}
		appointments = append(appointments, appointment)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate booked appointments")
	}
	return appointments, nil
}

func (r *PostgresRepository) GetService(ctx context.Context, serviceID uuid.UUID) (*ServiceInfo, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	service := &ServiceInfo{}
	row := r.pool.QueryRow(ctx, `
select id, name, category, duration_min, coalesce(price_low, 0), coalesce(price_high, 0), is_active
from services
where id = $1
`, serviceID)
	if err := row.Scan(&service.ID, &service.Name, &service.Category, &service.DurationMin, &service.PriceLow, &service.PriceHigh, &service.IsActive); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, errors.Wrap(ErrNotFound, "service not found")
		}
		return nil, errors.Wrap(err, "failed to load service")
	}
	return service, nil
}

func (r *PostgresRepository) FindOrCreateBookingClient(ctx context.Context, name, email, phone string) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	name = strings.TrimSpace(name)
	email = strings.ToLower(strings.TrimSpace(email))
	phone = strings.TrimSpace(phone)

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "failed to start booking client transaction")
	}
	defer func() { _ = tx.Rollback(ctx) }()

	rows, err := tx.Query(ctx, `
select id, name, email, phone
from clients
where ($1 <> '' and email = $1) or ($2 <> '' and phone = $2)
order by updated_at desc
limit 2
`, email, phone)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query booking client")
	}

	matches := []Client{}
	for rows.Next() {
		client := Client{}
		if err := rows.Scan(&client.ID, &client.Name, &client.Email, &client.Phone); err != nil {
			rows.Close()
			return nil, errors.Wrap(err, "failed to scan booking client")
		}
		matches = append(matches, client)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, errors.Wrap(err, "failed to iterate booking clients")
	}
	rows.Close()

	if len(matches) > 1 && matches[0].ID != matches[1].ID {
		return nil, errors.Wrap(ErrInvalidInput, "client_email and client_phone matched different clients")
	}

	if len(matches) == 0 {
		client := &Client{}
		row := tx.QueryRow(ctx, `
insert into clients(id, name, email, phone)
values($1, $2, nullif($3, ''), nullif($4, ''))
returning id, name, email, phone
`, uuid.New(), name, email, phone)
		if err := row.Scan(&client.ID, &client.Name, &client.Email, &client.Phone); err != nil {
			return nil, errors.Wrap(err, "failed to create booking client")
		}
		if err := tx.Commit(ctx); err != nil {
			return nil, errors.Wrap(err, "failed to commit booking client creation")
		}
		return client, nil
	}

	client := &Client{}
	row := tx.QueryRow(ctx, `
update clients
set name = $2,
    email = coalesce(nullif($3, ''), email),
    phone = coalesce(nullif($4, ''), phone),
    updated_at = now()
where id = $1
returning id, name, email, phone
`, matches[0].ID, name, email, phone)
	if err := row.Scan(&client.ID, &client.Name, &client.Email, &client.Phone); err != nil {
		return nil, errors.Wrap(err, "failed to update booking client")
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, errors.Wrap(err, "failed to commit booking client update")
	}
	return client, nil
}

func (r *PostgresRepository) CreateAppointment(ctx context.Context, appointment Appointment) (*Appointment, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	if appointment.ID == uuid.Nil {
		appointment.ID = uuid.New()
	}

	startMinute, err := parseMinuteOfDay(appointment.StartTime)
	if err != nil {
		return nil, err
	}
	startClock := time.Date(2000, 1, 1, startMinute/60, startMinute%60, 0, 0, time.UTC).Format("15:04:05")

	created := &Appointment{}
	row := r.pool.QueryRow(ctx, `
insert into appointments(
  id, client_id, service_id, intake_id, date, start_time, duration_min_snapshot, status
)
values(
  $1, $2, $3, $4, $5, $6, $7, $8
)
returning id, client_id, service_id, intake_id, to_char(date, 'YYYY-MM-DD'), to_char(start_time, 'HH12:MI AM'),
  duration_min_snapshot, status, created_at, updated_at
`,
		appointment.ID,
		appointment.ClientID,
		appointment.ServiceID,
		appointment.IntakeID,
		appointment.Date,
		startClock,
		appointment.DurationMinSnapshot,
		appointment.Status,
	)
	if err := row.Scan(
		&created.ID,
		&created.ClientID,
		&created.ServiceID,
		&created.IntakeID,
		&created.Date,
		&created.StartTime,
		&created.DurationMinSnapshot,
		&created.Status,
		&created.CreatedAt,
		&created.UpdatedAt,
	); err != nil {
		return nil, errors.Wrap(err, "failed to create appointment")
	}
	created.StartTime = strings.TrimSpace(created.StartTime)
	return created, nil
}
