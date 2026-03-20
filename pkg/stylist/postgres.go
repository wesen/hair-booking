package stylist

import (
	"context"
	"database/sql"
	"strings"
	"time"

	hairappointments "github.com/go-go-golems/hair-booking/pkg/appointments"
	hairclients "github.com/go-go-golems/hair-booking/pkg/clients"
	hairintake "github.com/go-go-golems/hair-booking/pkg/intake"
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

func (r *PostgresRepository) ListIntakes(ctx context.Context, filter IntakeListFilter) ([]IntakeListItem, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select
  i.id,
  i.service_type,
  coalesce(i.dream_result, ''),
  coalesce(i.estimate_low, 0),
  coalesce(i.estimate_high, 0),
  i.created_at,
  coalesce(c.id::text, ''),
  coalesce(c.auth_subject, ''),
  coalesce(c.auth_issuer, ''),
  coalesce(c.name, ''),
  coalesce(c.email, ''),
  coalesce(c.phone, ''),
  coalesce(c.scalp_notes, ''),
  coalesce(c.service_summary, ''),
  c.created_at,
  c.updated_at,
  count(p.id)::int,
  coalesce(ir.id::text, ''),
  coalesce(ir.status, 'new'),
  coalesce(ir.priority, 'normal'),
  coalesce(ir.summary, ''),
  coalesce(ir.internal_notes, ''),
  ir.quoted_price_low,
  ir.quoted_price_high,
  ir.reviewed_at,
  ir.created_at,
  ir.updated_at,
  coalesce(ir.reviewed_at, i.created_at) as last_action_at
from intake_submissions i
left join clients c on c.id = i.client_id
left join intake_reviews ir on ir.intake_id = i.id
left join intake_photos p on p.intake_id = i.id
where ($1 = '' or coalesce(ir.status, 'new') = $1)
group by
  i.id, i.service_type, i.dream_result, i.estimate_low, i.estimate_high, i.created_at,
  c.id, c.auth_subject, c.auth_issuer, c.name, c.email, c.phone, c.scalp_notes, c.service_summary, c.created_at, c.updated_at,
  ir.id, ir.status, ir.priority, ir.summary, ir.internal_notes, ir.quoted_price_low, ir.quoted_price_high, ir.reviewed_at, ir.created_at, ir.updated_at
order by
  case coalesce(ir.status, 'new')
    when 'new' then 0
    when 'in_review' then 1
    when 'needs_client_reply' then 2
    when 'approved_to_book' then 3
    else 4
  end,
  coalesce(ir.reviewed_at, i.created_at) desc,
  i.created_at desc
limit $2 offset $3
`, filter.Status, filter.Limit, filter.Offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist intakes")
	}
	defer rows.Close()

	items := []IntakeListItem{}
	for rows.Next() {
		item, err := scanIntakeListItem(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist intakes")
	}
	return items, nil
}

func (r *PostgresRepository) GetIntake(ctx context.Context, intakeID uuid.UUID) (*IntakeDetail, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	row := r.pool.QueryRow(ctx, `
select
  coalesce(i.id::text, ''),
  coalesce(i.client_id::text, ''),
  i.service_type,
  coalesce(i.hair_length, ''),
  coalesce(i.hair_density, ''),
  coalesce(i.hair_texture, ''),
  coalesce(i.prev_extensions, ''),
  coalesce(i.color_service, ''),
  coalesce(i.natural_level, ''),
  coalesce(i.current_color, ''),
  coalesce(i.chemical_history, '{}'::text[]),
  coalesce(i.last_chemical, ''),
  i.desired_length,
  coalesce(i.ext_type, ''),
  coalesce(i.budget, ''),
  coalesce(i.maintenance, ''),
  coalesce(i.deadline, ''),
  coalesce(i.dream_result, ''),
  coalesce(i.estimate_low, 0),
  coalesce(i.estimate_high, 0),
  i.created_at,
  coalesce(c.id::text, ''),
  coalesce(c.auth_subject, ''),
  coalesce(c.auth_issuer, ''),
  coalesce(c.name, ''),
  coalesce(c.email, ''),
  coalesce(c.phone, ''),
  coalesce(c.scalp_notes, ''),
  coalesce(c.service_summary, ''),
  c.created_at,
  c.updated_at,
  coalesce(ir.id::text, ''),
  coalesce(ir.status, 'new'),
  coalesce(ir.priority, 'normal'),
  coalesce(ir.summary, ''),
  coalesce(ir.internal_notes, ''),
  ir.quoted_price_low,
  ir.quoted_price_high,
  ir.reviewed_at,
  ir.created_at,
  ir.updated_at
from intake_submissions i
left join clients c on c.id = i.client_id
left join intake_reviews ir on ir.intake_id = i.id
where i.id = $1
`, intakeID)

	detail := &IntakeDetail{Photos: []hairintake.Photo{}}
	submission := &hairintake.Submission{}
	client, review, err := scanIntakeDetailRow(row, submission)
	if err != nil {
		return nil, err
	}
	detail.Submission = submission
	detail.Client = client
	detail.Review = review

	photos, err := r.listIntakePhotos(ctx, intakeID)
	if err != nil {
		return nil, err
	}
	detail.Photos = photos
	return detail, nil
}

func (r *PostgresRepository) GetDashboardIntakeStats(ctx context.Context) (*DashboardIntakeStats, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	stats := &DashboardIntakeStats{}
	row := r.pool.QueryRow(ctx, `
select
  count(*) filter (where coalesce(ir.status, 'new') = 'new')::int as new_count,
  count(*) filter (where coalesce(ir.status, 'new') = 'in_review')::int as in_review_count,
  count(*) filter (where coalesce(ir.status, 'new') = 'needs_client_reply')::int as needs_client_reply_count,
  count(*) filter (where coalesce(ir.status, 'new') = 'approved_to_book')::int as approved_to_book_count
from intake_submissions i
left join intake_reviews ir on ir.intake_id = i.id
`)
	if err := row.Scan(
		&stats.NewCount,
		&stats.InReviewCount,
		&stats.NeedsClientReplyCount,
		&stats.ApprovedToBookCount,
	); err != nil {
		return nil, errors.Wrap(err, "failed to query stylist dashboard intake stats")
	}
	return stats, nil
}

func (r *PostgresRepository) ListDashboardAppointments(ctx context.Context, startDate time.Time, limit int) ([]DashboardAppointment, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select
  a.id,
  a.client_id,
  coalesce(c.name, ''),
  a.service_id,
  coalesce(s.name, ''),
  to_char(a.date, 'YYYY-MM-DD'),
  trim(to_char(a.start_time, 'HH12:MI AM')),
  a.status
from appointments a
join clients c on c.id = a.client_id
join services s on s.id = a.service_id
where a.date >= $1
  and a.status <> 'cancelled'
order by a.date, a.start_time
limit $2
`, startDate.Format(time.DateOnly), limit)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist dashboard appointments")
	}
	defer rows.Close()

	items := []DashboardAppointment{}
	for rows.Next() {
		item := DashboardAppointment{}
		if err := rows.Scan(
			&item.AppointmentID,
			&item.ClientID,
			&item.ClientName,
			&item.ServiceID,
			&item.ServiceName,
			&item.Date,
			&item.StartTime,
			&item.Status,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan stylist dashboard appointment")
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist dashboard appointments")
	}
	return items, nil
}

func (r *PostgresRepository) ListAppointments(ctx context.Context, filter AppointmentListFilter) ([]Appointment, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	rows, err := r.pool.Query(ctx, `
select
  a.id,
  a.client_id,
  coalesce(c.name, ''),
  a.service_id,
  coalesce(s.name, ''),
  a.intake_id,
  to_char(a.date, 'YYYY-MM-DD'),
  trim(to_char(a.start_time, 'HH12:MI AM')),
  a.status,
  coalesce(a.prep_notes, ''),
  coalesce(a.stylist_notes, ''),
  a.cancelled_at,
  coalesce(a.cancel_reason, '')
from appointments a
join clients c on c.id = a.client_id
join services s on s.id = a.service_id
where ($1 = '' or a.status = $1)
order by a.date, a.start_time
limit $2 offset $3
`, filter.Status, filter.Limit, filter.Offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist appointments")
	}
	defer rows.Close()

	items := []Appointment{}
	for rows.Next() {
		item := Appointment{}
		var cancelledAt sql.NullTime
		if err := rows.Scan(
			&item.ID,
			&item.ClientID,
			&item.ClientName,
			&item.ServiceID,
			&item.ServiceName,
			&item.IntakeID,
			&item.Date,
			&item.StartTime,
			&item.Status,
			&item.PrepNotes,
			&item.StylistNotes,
			&cancelledAt,
			&item.CancelReason,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan stylist appointment row")
		}
		item.CancelledAt = nullableTimePtr(cancelledAt)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist appointments")
	}
	return items, nil
}

func (r *PostgresRepository) GetAppointment(ctx context.Context, appointmentID uuid.UUID) (*AppointmentDetail, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	row := r.pool.QueryRow(ctx, `
select
  a.id,
  a.client_id,
  coalesce(c.name, ''),
  a.service_id,
  coalesce(s.name, ''),
  a.intake_id,
  to_char(a.date, 'YYYY-MM-DD'),
  trim(to_char(a.start_time, 'HH12:MI AM')),
  a.status,
  coalesce(a.prep_notes, ''),
  coalesce(a.stylist_notes, ''),
  a.cancelled_at,
  coalesce(a.cancel_reason, ''),
  coalesce(c.auth_subject, ''),
  coalesce(c.auth_issuer, ''),
  coalesce(c.email, ''),
  coalesce(c.phone, ''),
  coalesce(c.scalp_notes, ''),
  coalesce(c.service_summary, ''),
  c.created_at,
  c.updated_at,
  i.id,
  i.client_id,
  coalesce(i.service_type, ''),
  coalesce(i.hair_length, ''),
  coalesce(i.hair_density, ''),
  coalesce(i.hair_texture, ''),
  coalesce(i.prev_extensions, ''),
  coalesce(i.color_service, ''),
  coalesce(i.natural_level, ''),
  coalesce(i.current_color, ''),
  coalesce(i.chemical_history, '{}'::text[]),
  coalesce(i.last_chemical, ''),
  i.desired_length,
  coalesce(i.ext_type, ''),
  coalesce(i.budget, ''),
  coalesce(i.maintenance, ''),
  coalesce(i.deadline, ''),
  coalesce(i.dream_result, ''),
  coalesce(i.estimate_low, 0),
  coalesce(i.estimate_high, 0)
from appointments a
join clients c on c.id = a.client_id
join services s on s.id = a.service_id
left join intake_submissions i on i.id = a.intake_id
where a.id = $1
`, appointmentID)

	detail := &AppointmentDetail{Appointment: &Appointment{}}
	client := &hairclients.Client{}
	intake := &hairintake.Submission{}
	var intakeIDText sql.NullString
	var intakeClientIDText string
	var intakeDesiredLength sql.NullInt64
	var cancelledAt sql.NullTime
	var clientCreatedAt time.Time
	var clientUpdatedAt time.Time
	if err := row.Scan(
		&detail.Appointment.ID,
		&detail.Appointment.ClientID,
		&detail.Appointment.ClientName,
		&detail.Appointment.ServiceID,
		&detail.Appointment.ServiceName,
		&detail.Appointment.IntakeID,
		&detail.Appointment.Date,
		&detail.Appointment.StartTime,
		&detail.Appointment.Status,
		&detail.Appointment.PrepNotes,
		&detail.Appointment.StylistNotes,
		&cancelledAt,
		&detail.Appointment.CancelReason,
		&client.AuthSubject,
		&client.AuthIssuer,
		&client.Email,
		&client.Phone,
		&client.ScalpNotes,
		&client.ServiceSummary,
		&clientCreatedAt,
		&clientUpdatedAt,
		&intakeIDText,
		&intakeClientIDText,
		&intake.ServiceType,
		&intake.HairLength,
		&intake.HairDensity,
		&intake.HairTexture,
		&intake.PrevExtensions,
		&intake.ColorService,
		&intake.NaturalLevel,
		&intake.CurrentColor,
		&intake.ChemicalHistory,
		&intake.LastChemical,
		&intakeDesiredLength,
		&intake.ExtType,
		&intake.Budget,
		&intake.Maintenance,
		&intake.Deadline,
		&intake.DreamResult,
		&intake.EstimateLow,
		&intake.EstimateHigh,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, errors.Wrap(ErrNotFound, "appointment not found")
		}
		return nil, errors.Wrap(err, "failed to load stylist appointment detail")
	}

	detail.Appointment.CancelledAt = nullableTimePtr(cancelledAt)
	client.ID = detail.Appointment.ClientID
	client.Name = detail.Appointment.ClientName
	client.CreatedAt = clientCreatedAt
	client.UpdatedAt = clientUpdatedAt
	detail.Client = client

	if intakeIDText.Valid && strings.TrimSpace(intakeIDText.String) != "" {
		parsedIntakeID, err := uuid.Parse(intakeIDText.String)
		if err != nil {
			return nil, errors.Wrap(err, "failed to parse linked intake id")
		}
		intake.ID = parsedIntakeID
		if strings.TrimSpace(intakeClientIDText) != "" {
			parsedClientID, err := uuid.Parse(intakeClientIDText)
			if err != nil {
				return nil, errors.Wrap(err, "failed to parse linked intake client id")
			}
			intake.ClientID = &parsedClientID
		}
		if intakeDesiredLength.Valid {
			intake.DesiredLength = int(intakeDesiredLength.Int64)
		}
		detail.Intake = intake
	}

	return detail, nil
}

func (r *PostgresRepository) UpdateAppointment(ctx context.Context, appointmentID uuid.UUID, update AppointmentUpdate, updatedAt time.Time) (*Appointment, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	row := r.pool.QueryRow(ctx, `
with updated as (
  update appointments
  set
    status = case
      when $2 then $3
      else status
    end,
    prep_notes = case
      when $4 then nullif($5, '')
      else prep_notes
    end,
    stylist_notes = case
      when $6 then nullif($7, '')
      else stylist_notes
    end,
    cancelled_at = case
      when $2 and $3 = 'cancelled' then $8
      when $2 and $3 <> 'cancelled' then null
      else cancelled_at
    end,
    updated_at = $8
  where id = $1
  returning id, client_id, service_id, intake_id, date, start_time, status, prep_notes, stylist_notes, cancelled_at, cancel_reason
)
select
  u.id,
  u.client_id,
  coalesce(c.name, ''),
  u.service_id,
  coalesce(s.name, ''),
  u.intake_id,
  to_char(u.date, 'YYYY-MM-DD'),
  trim(to_char(u.start_time, 'HH12:MI AM')),
  u.status,
  coalesce(u.prep_notes, ''),
  coalesce(u.stylist_notes, ''),
  u.cancelled_at,
  coalesce(u.cancel_reason, '')
from updated u
join clients c on c.id = u.client_id
join services s on s.id = u.service_id
`,
		appointmentID,
		update.Status != nil,
		derefString(update.Status),
		update.PrepNotes != nil,
		derefString(update.PrepNotes),
		update.StylistNotes != nil,
		derefString(update.StylistNotes),
		updatedAt,
	)

	item := &Appointment{}
	var cancelledAt sql.NullTime
	if err := row.Scan(
		&item.ID,
		&item.ClientID,
		&item.ClientName,
		&item.ServiceID,
		&item.ServiceName,
		&item.IntakeID,
		&item.Date,
		&item.StartTime,
		&item.Status,
		&item.PrepNotes,
		&item.StylistNotes,
		&cancelledAt,
		&item.CancelReason,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, errors.Wrap(ErrNotFound, "appointment not found")
		}
		return nil, errors.Wrap(err, "failed to update stylist appointment")
	}
	item.CancelledAt = nullableTimePtr(cancelledAt)
	return item, nil
}

func (r *PostgresRepository) ListClients(ctx context.Context, filter ClientListFilter) ([]ClientListItem, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	search := strings.TrimSpace(filter.Search)
	searchPattern := "%"
	if search != "" {
		searchPattern = "%" + search + "%"
	}

	rows, err := r.pool.Query(ctx, `
select
  c.id,
  c.name,
  coalesce(c.email, ''),
  coalesce(c.phone, ''),
  coalesce(c.scalp_notes, ''),
  coalesce(c.service_summary, ''),
  c.created_at,
  c.updated_at,
  coalesce(appointment_counts.appointment_count, 0),
  coalesce(intake_counts.intake_count, 0),
  coalesce(last_appointment.last_date, ''),
  coalesce(upcoming.appointment_id, ''),
  coalesce(upcoming.appointment_date, ''),
  coalesce(upcoming.start_time, ''),
  coalesce(last_intake.intake_id, ''),
  coalesce(last_intake.review_status, '')
from clients c
left join lateral (
  select count(*)::int as appointment_count
  from appointments a
  where a.client_id = c.id
) appointment_counts on true
left join lateral (
  select count(*)::int as intake_count
  from intake_submissions i
  where i.client_id = c.id
) intake_counts on true
left join lateral (
  select to_char(a.date, 'YYYY-MM-DD') as last_date
  from appointments a
  where a.client_id = c.id
  order by a.date desc, a.start_time desc
  limit 1
) last_appointment on true
left join lateral (
  select
    a.id::text as appointment_id,
    to_char(a.date, 'YYYY-MM-DD') as appointment_date,
    trim(to_char(a.start_time, 'HH12:MI AM')) as start_time
  from appointments a
  where a.client_id = c.id
    and a.status <> 'cancelled'
    and (a.date > current_date or (a.date = current_date and a.start_time >= localtime))
  order by a.date, a.start_time
  limit 1
) upcoming on true
left join lateral (
  select
    i.id::text as intake_id,
    coalesce(ir.status, 'new') as review_status
  from intake_submissions i
  left join intake_reviews ir on ir.intake_id = i.id
  where i.client_id = c.id
  order by i.created_at desc
  limit 1
) last_intake on true
where (
  $1 = '%'
  or c.name ilike $1
  or coalesce(c.email, '') ilike $1
  or coalesce(c.phone, '') ilike $1
)
order by
  case when upcoming.appointment_date <> '' then 0 else 1 end,
  upcoming.appointment_date,
  upcoming.start_time,
  c.updated_at desc,
  c.name
limit $2 offset $3
`, searchPattern, filter.Limit, filter.Offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist clients")
	}
	defer rows.Close()

	items := []ClientListItem{}
	for rows.Next() {
		item, err := scanClientListItem(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist clients")
	}
	return items, nil
}

func (r *PostgresRepository) GetClient(ctx context.Context, clientID uuid.UUID) (*ClientDetail, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	detail, err := r.loadClientBaseDetail(ctx, clientID)
	if err != nil {
		return nil, err
	}

	upcoming, err := r.loadUpcomingClientAppointment(ctx, clientID)
	if err != nil {
		return nil, err
	}
	detail.UpcomingAppointment = upcoming

	recentAppointments, err := r.loadRecentClientAppointments(ctx, clientID)
	if err != nil {
		return nil, err
	}
	detail.RecentAppointments = recentAppointments

	recentIntakes, err := r.loadRecentClientIntakes(ctx, clientID)
	if err != nil {
		return nil, err
	}
	detail.RecentIntakes = recentIntakes

	plan, items, err := r.loadClientMaintenancePlan(ctx, clientID)
	if err != nil {
		return nil, err
	}
	detail.MaintenancePlan = plan
	detail.MaintenanceItems = items

	return detail, nil
}

func (r *PostgresRepository) UpsertIntakeReview(ctx context.Context, intakeID uuid.UUID, update IntakeReviewUpdate, reviewedAt time.Time) (*IntakeReview, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	var intakeExists bool
	if err := r.pool.QueryRow(ctx, "select exists(select 1 from intake_submissions where id = $1)", intakeID).Scan(&intakeExists); err != nil {
		return nil, errors.Wrap(err, "failed to verify intake before review upsert")
	}
	if !intakeExists {
		return nil, errors.Wrap(ErrNotFound, "intake not found")
	}

	row := r.pool.QueryRow(ctx, `
insert into intake_reviews(
  id, intake_id, status, priority, summary, internal_notes,
  quoted_price_low, quoted_price_high, reviewed_at
)
values(
  $1,
  $2,
  coalesce(nullif($3, ''), 'new'),
  coalesce(nullif($4, ''), 'normal'),
  nullif($5, ''),
  nullif($6, ''),
  $7,
  $8,
  $9
)
on conflict (intake_id) do update
set
  status = coalesce(nullif(excluded.status, ''), intake_reviews.status),
  priority = coalesce(nullif(excluded.priority, ''), intake_reviews.priority),
  summary = case
    when $10 then excluded.summary
    else intake_reviews.summary
  end,
  internal_notes = case
    when $11 then excluded.internal_notes
    else intake_reviews.internal_notes
  end,
  quoted_price_low = case
    when $12 then excluded.quoted_price_low
    else intake_reviews.quoted_price_low
  end,
  quoted_price_high = case
    when $13 then excluded.quoted_price_high
    else intake_reviews.quoted_price_high
  end,
  reviewed_at = excluded.reviewed_at,
  updated_at = now()
returning id, intake_id, status, priority, coalesce(summary, ''), coalesce(internal_notes, ''),
  quoted_price_low, quoted_price_high, reviewed_at, created_at, updated_at
`,
		uuid.New(),
		intakeID,
		derefString(update.Status),
		derefString(update.Priority),
		derefString(update.Summary),
		derefString(update.InternalNotes),
		update.QuotedPriceLow,
		update.QuotedPriceHigh,
		reviewedAt,
		update.Summary != nil,
		update.InternalNotes != nil,
		update.QuotedPriceLow != nil,
		update.QuotedPriceHigh != nil,
	)

	review := IntakeReview{}
	if err := scanReviewRow(row, &review); err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *PostgresRepository) listIntakePhotos(ctx context.Context, intakeID uuid.UUID) ([]hairintake.Photo, error) {
	rows, err := r.pool.Query(ctx, `
select id, intake_id, slot, storage_key, url
from intake_photos
where intake_id = $1
order by
  case slot
    when 'front' then 1
    when 'back' then 2
    when 'hairline' then 3
    else 4
  end,
  id
`, intakeID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query intake photos")
	}
	defer rows.Close()

	photos := []hairintake.Photo{}
	for rows.Next() {
		photo := hairintake.Photo{}
		if err := rows.Scan(&photo.ID, &photo.IntakeID, &photo.Slot, &photo.StorageKey, &photo.URL); err != nil {
			return nil, errors.Wrap(err, "failed to scan intake photo")
		}
		photos = append(photos, photo)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate intake photos")
	}
	return photos, nil
}

func scanIntakeListItem(rows pgx.Rows) (IntakeListItem, error) {
	item := IntakeListItem{}
	clientID := uuid.Nil
	clientIDText := ""
	clientName := ""
	clientEmail := ""
	clientPhone := ""
	clientScalpNotes := ""
	clientServiceSummary := ""
	clientAuthSubject := ""
	clientAuthIssuer := ""
	reviewID := uuid.Nil
	reviewIDText := ""
	review := IntakeReview{}

	var clientCreatedAt sql.NullTime
	var clientUpdatedAt sql.NullTime
	var reviewLow sql.NullInt64
	var reviewHigh sql.NullInt64
	var reviewReviewedAt sql.NullTime
	var reviewCreatedAt sql.NullTime
	var reviewUpdatedAt sql.NullTime
	if err := rows.Scan(
		&item.ID,
		&item.ServiceType,
		&item.DreamResult,
		&item.EstimateLow,
		&item.EstimateHigh,
		&item.SubmittedAt,
		&clientIDText,
		&clientAuthSubject,
		&clientAuthIssuer,
		&clientName,
		&clientEmail,
		&clientPhone,
		&clientScalpNotes,
		&clientServiceSummary,
		&clientCreatedAt,
		&clientUpdatedAt,
		&item.PhotoCount,
		&reviewIDText,
		&review.Status,
		&review.Priority,
		&review.Summary,
		&review.InternalNotes,
		&reviewLow,
		&reviewHigh,
		&reviewReviewedAt,
		&reviewCreatedAt,
		&reviewUpdatedAt,
		&item.LastActionAt,
	); err != nil {
		return IntakeListItem{}, errors.Wrap(err, "failed to scan stylist intake list item")
	}

	if strings.TrimSpace(clientIDText) != "" {
		parsedClientID, err := uuid.Parse(clientIDText)
		if err != nil {
			return IntakeListItem{}, errors.Wrap(err, "failed to parse stylist intake client id")
		}
		clientID = parsedClientID
	}
	if strings.TrimSpace(reviewIDText) != "" {
		parsedReviewID, err := uuid.Parse(reviewIDText)
		if err != nil {
			return IntakeListItem{}, errors.Wrap(err, "failed to parse intake review id")
		}
		reviewID = parsedReviewID
	}

	if clientID != uuid.Nil {
		item.Client = &hairclients.Client{
			ID:             clientID,
			AuthSubject:    clientAuthSubject,
			AuthIssuer:     clientAuthIssuer,
			Name:           clientName,
			Email:          clientEmail,
			Phone:          clientPhone,
			ScalpNotes:     clientScalpNotes,
			ServiceSummary: clientServiceSummary,
			CreatedAt:      nullableTimeValue(clientCreatedAt),
			UpdatedAt:      nullableTimeValue(clientUpdatedAt),
		}
	}

	review.ID = reviewID
	review.IntakeID = item.ID
	review.QuotedPriceLow = nullableIntPtr(reviewLow)
	review.QuotedPriceHigh = nullableIntPtr(reviewHigh)
	review.ReviewedAt = nullableTimePtr(reviewReviewedAt)
	review.CreatedAt = nullableTimePtr(reviewCreatedAt)
	review.UpdatedAt = nullableTimePtr(reviewUpdatedAt)
	item.Review = review
	return item, nil
}

func scanIntakeDetailRow(row pgx.Row, submission *hairintake.Submission) (*hairclients.Client, IntakeReview, error) {
	if submission == nil {
		return nil, IntakeReview{}, errors.New("submission target is nil")
	}

	clientID := uuid.Nil
	clientIDText := ""
	clientAuthSubject := ""
	clientAuthIssuer := ""
	clientName := ""
	clientEmail := ""
	clientPhone := ""
	clientScalpNotes := ""
	clientServiceSummary := ""
	review := IntakeReview{}
	reviewID := uuid.Nil
	reviewIDText := ""
	var clientCreatedAt sql.NullTime
	var clientUpdatedAt sql.NullTime
	var reviewLow sql.NullInt64
	var reviewHigh sql.NullInt64
	var reviewReviewedAt sql.NullTime
	var reviewCreatedAt sql.NullTime
	var reviewUpdatedAt sql.NullTime
	var desiredLength sql.NullInt64

	if err := row.Scan(
		&submission.ID,
		&submission.ClientID,
		&submission.ServiceType,
		&submission.HairLength,
		&submission.HairDensity,
		&submission.HairTexture,
		&submission.PrevExtensions,
		&submission.ColorService,
		&submission.NaturalLevel,
		&submission.CurrentColor,
		&submission.ChemicalHistory,
		&submission.LastChemical,
		&desiredLength,
		&submission.ExtType,
		&submission.Budget,
		&submission.Maintenance,
		&submission.Deadline,
		&submission.DreamResult,
		&submission.EstimateLow,
		&submission.EstimateHigh,
		&clientCreatedAt,
		&clientIDText,
		&clientAuthSubject,
		&clientAuthIssuer,
		&clientName,
		&clientEmail,
		&clientPhone,
		&clientScalpNotes,
		&clientServiceSummary,
		&clientCreatedAt,
		&clientUpdatedAt,
		&reviewIDText,
		&review.Status,
		&review.Priority,
		&review.Summary,
		&review.InternalNotes,
		&reviewLow,
		&reviewHigh,
		&reviewReviewedAt,
		&reviewCreatedAt,
		&reviewUpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, IntakeReview{}, errors.Wrap(ErrNotFound, "intake not found")
		}
		return nil, IntakeReview{}, errors.Wrap(err, "failed to scan stylist intake detail")
	}

	if strings.TrimSpace(clientIDText) != "" {
		parsedClientID, err := uuid.Parse(clientIDText)
		if err != nil {
			return nil, IntakeReview{}, errors.Wrap(err, "failed to parse stylist intake detail client id")
		}
		clientID = parsedClientID
	}
	if strings.TrimSpace(reviewIDText) != "" {
		parsedReviewID, err := uuid.Parse(reviewIDText)
		if err != nil {
			return nil, IntakeReview{}, errors.Wrap(err, "failed to parse stylist intake detail review id")
		}
		reviewID = parsedReviewID
	}

	if desiredLength.Valid {
		submission.DesiredLength = int(desiredLength.Int64)
	}

	review.ID = reviewID
	review.IntakeID = submission.ID
	review.QuotedPriceLow = nullableIntPtr(reviewLow)
	review.QuotedPriceHigh = nullableIntPtr(reviewHigh)
	review.ReviewedAt = nullableTimePtr(reviewReviewedAt)
	review.CreatedAt = nullableTimePtr(reviewCreatedAt)
	review.UpdatedAt = nullableTimePtr(reviewUpdatedAt)

	if clientID == uuid.Nil {
		return nil, review, nil
	}
	client := &hairclients.Client{
		ID:             clientID,
		AuthSubject:    clientAuthSubject,
		AuthIssuer:     clientAuthIssuer,
		Name:           clientName,
		Email:          clientEmail,
		Phone:          clientPhone,
		ScalpNotes:     clientScalpNotes,
		ServiceSummary: clientServiceSummary,
		CreatedAt:      nullableTimeValue(clientCreatedAt),
		UpdatedAt:      nullableTimeValue(clientUpdatedAt),
	}
	return client, review, nil
}

func scanReviewRow(row pgx.Row, review *IntakeReview) error {
	if review == nil {
		return errors.New("review target is nil")
	}

	var low sql.NullInt64
	var high sql.NullInt64
	var reviewedAt sql.NullTime
	var createdAt sql.NullTime
	var updatedAt sql.NullTime
	if err := row.Scan(
		&review.ID,
		&review.IntakeID,
		&review.Status,
		&review.Priority,
		&review.Summary,
		&review.InternalNotes,
		&low,
		&high,
		&reviewedAt,
		&createdAt,
		&updatedAt,
	); err != nil {
		return errors.Wrap(err, "failed to scan intake review")
	}
	review.QuotedPriceLow = nullableIntPtr(low)
	review.QuotedPriceHigh = nullableIntPtr(high)
	review.ReviewedAt = nullableTimePtr(reviewedAt)
	review.CreatedAt = nullableTimePtr(createdAt)
	review.UpdatedAt = nullableTimePtr(updatedAt)
	return nil
}

func nullableIntPtr(value sql.NullInt64) *int {
	if !value.Valid {
		return nil
	}
	converted := int(value.Int64)
	return &converted
}

func nullableTimePtr(value sql.NullTime) *time.Time {
	if !value.Valid {
		return nil
	}
	t := value.Time
	return &t
}

func nullableTimeValue(value sql.NullTime) time.Time {
	if !value.Valid {
		return time.Time{}
	}
	return value.Time
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func scanClientListItem(rows pgx.Rows) (ClientListItem, error) {
	item := ClientListItem{}
	var upcomingAppointmentID string
	var lastIntakeID string
	if err := rows.Scan(
		&item.ID,
		&item.Name,
		&item.Email,
		&item.Phone,
		&item.ScalpNotes,
		&item.ServiceSummary,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.AppointmentCount,
		&item.IntakeCount,
		&item.LastAppointmentDate,
		&upcomingAppointmentID,
		&item.UpcomingAppointmentDate,
		&item.UpcomingAppointmentTime,
		&lastIntakeID,
		&item.LastReviewStatus,
	); err != nil {
		return ClientListItem{}, errors.Wrap(err, "failed to scan stylist client row")
	}

	if strings.TrimSpace(upcomingAppointmentID) != "" {
		parsedID, err := uuid.Parse(upcomingAppointmentID)
		if err != nil {
			return ClientListItem{}, errors.Wrap(err, "failed to parse stylist upcoming appointment id")
		}
		item.UpcomingAppointmentID = &parsedID
	}
	if strings.TrimSpace(lastIntakeID) != "" {
		parsedID, err := uuid.Parse(lastIntakeID)
		if err != nil {
			return ClientListItem{}, errors.Wrap(err, "failed to parse stylist last intake id")
		}
		item.LastIntakeID = &parsedID
	}
	return item, nil
}

func (r *PostgresRepository) loadClientBaseDetail(ctx context.Context, clientID uuid.UUID) (*ClientDetail, error) {
	row := r.pool.QueryRow(ctx, `
select
  c.id,
  coalesce(c.auth_subject, ''),
  coalesce(c.auth_issuer, ''),
  c.name,
  coalesce(c.email, ''),
  coalesce(c.phone, ''),
  coalesce(c.scalp_notes, ''),
  coalesce(c.service_summary, ''),
  c.created_at,
  c.updated_at,
  (select count(*)::int from appointments a where a.client_id = c.id) as appointment_count,
  (select count(*)::int from intake_submissions i where i.client_id = c.id) as intake_count
from clients c
where c.id = $1
`, clientID)

	client := &hairclients.Client{}
	detail := &ClientDetail{
		Client:             client,
		RecentAppointments: []ClientAppointmentSummary{},
		RecentIntakes:      []ClientIntakeSummary{},
		MaintenanceItems:   []hairappointments.MaintenancePlanItem{},
	}
	if err := row.Scan(
		&client.ID,
		&client.AuthSubject,
		&client.AuthIssuer,
		&client.Name,
		&client.Email,
		&client.Phone,
		&client.ScalpNotes,
		&client.ServiceSummary,
		&client.CreatedAt,
		&client.UpdatedAt,
		&detail.AppointmentCount,
		&detail.IntakeCount,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, errors.Wrap(ErrNotFound, "client not found")
		}
		return nil, errors.Wrap(err, "failed to load stylist client detail")
	}
	return detail, nil
}

func (r *PostgresRepository) loadUpcomingClientAppointment(ctx context.Context, clientID uuid.UUID) (*ClientAppointmentSummary, error) {
	row := r.pool.QueryRow(ctx, `
select
  a.id,
  a.service_id,
  coalesce(s.name, ''),
  a.intake_id,
  to_char(a.date, 'YYYY-MM-DD'),
  trim(to_char(a.start_time, 'HH12:MI AM')),
  a.status
from appointments a
join services s on s.id = a.service_id
where a.client_id = $1
  and a.status <> 'cancelled'
  and (a.date > current_date or (a.date = current_date and a.start_time >= localtime))
order by a.date, a.start_time
limit 1
`, clientID)

	item := &ClientAppointmentSummary{}
	if err := row.Scan(
		&item.ID,
		&item.ServiceID,
		&item.ServiceName,
		&item.IntakeID,
		&item.Date,
		&item.StartTime,
		&item.Status,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, nil
		}
		return nil, errors.Wrap(err, "failed to load stylist client upcoming appointment")
	}
	return item, nil
}

func (r *PostgresRepository) loadRecentClientAppointments(ctx context.Context, clientID uuid.UUID) ([]ClientAppointmentSummary, error) {
	rows, err := r.pool.Query(ctx, `
select
  a.id,
  a.service_id,
  coalesce(s.name, ''),
  a.intake_id,
  to_char(a.date, 'YYYY-MM-DD'),
  trim(to_char(a.start_time, 'HH12:MI AM')),
  a.status
from appointments a
join services s on s.id = a.service_id
where a.client_id = $1
order by a.date desc, a.start_time desc
limit 8
`, clientID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist client appointments")
	}
	defer rows.Close()

	items := []ClientAppointmentSummary{}
	for rows.Next() {
		item := ClientAppointmentSummary{}
		if err := rows.Scan(
			&item.ID,
			&item.ServiceID,
			&item.ServiceName,
			&item.IntakeID,
			&item.Date,
			&item.StartTime,
			&item.Status,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan stylist client appointment")
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist client appointments")
	}
	return items, nil
}

func (r *PostgresRepository) loadRecentClientIntakes(ctx context.Context, clientID uuid.UUID) ([]ClientIntakeSummary, error) {
	rows, err := r.pool.Query(ctx, `
select
  i.id,
  i.service_type,
  coalesce(i.dream_result, ''),
  coalesce(i.estimate_low, 0),
  coalesce(i.estimate_high, 0),
  i.created_at,
  count(p.id)::int,
  coalesce(ir.id::text, ''),
  coalesce(ir.status, 'new'),
  coalesce(ir.priority, 'normal'),
  coalesce(ir.summary, ''),
  coalesce(ir.internal_notes, ''),
  ir.quoted_price_low,
  ir.quoted_price_high,
  ir.reviewed_at,
  ir.created_at,
  ir.updated_at
from intake_submissions i
left join intake_photos p on p.intake_id = i.id
left join intake_reviews ir on ir.intake_id = i.id
where i.client_id = $1
group by
  i.id, i.service_type, i.dream_result, i.estimate_low, i.estimate_high, i.created_at,
  ir.id, ir.status, ir.priority, ir.summary, ir.internal_notes, ir.quoted_price_low, ir.quoted_price_high, ir.reviewed_at, ir.created_at, ir.updated_at
order by i.created_at desc
limit 6
`, clientID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to query stylist client intakes")
	}
	defer rows.Close()

	items := []ClientIntakeSummary{}
	for rows.Next() {
		item := ClientIntakeSummary{}
		var reviewIDText string
		var reviewLow sql.NullInt64
		var reviewHigh sql.NullInt64
		var reviewReviewedAt sql.NullTime
		var reviewCreatedAt sql.NullTime
		var reviewUpdatedAt sql.NullTime
		if err := rows.Scan(
			&item.ID,
			&item.ServiceType,
			&item.DreamResult,
			&item.EstimateLow,
			&item.EstimateHigh,
			&item.SubmittedAt,
			&item.PhotoCount,
			&reviewIDText,
			&item.Review.Status,
			&item.Review.Priority,
			&item.Review.Summary,
			&item.Review.InternalNotes,
			&reviewLow,
			&reviewHigh,
			&reviewReviewedAt,
			&reviewCreatedAt,
			&reviewUpdatedAt,
		); err != nil {
			return nil, errors.Wrap(err, "failed to scan stylist client intake")
		}
		if strings.TrimSpace(reviewIDText) != "" {
			reviewID, err := uuid.Parse(reviewIDText)
			if err != nil {
				return nil, errors.Wrap(err, "failed to parse stylist client intake review id")
			}
			item.Review.ID = reviewID
		}
		item.Review.IntakeID = item.ID
		item.Review.QuotedPriceLow = nullableIntPtr(reviewLow)
		item.Review.QuotedPriceHigh = nullableIntPtr(reviewHigh)
		item.Review.ReviewedAt = nullableTimePtr(reviewReviewedAt)
		item.Review.CreatedAt = nullableTimePtr(reviewCreatedAt)
		item.Review.UpdatedAt = nullableTimePtr(reviewUpdatedAt)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, errors.Wrap(err, "failed to iterate stylist client intakes")
	}
	return items, nil
}

func (r *PostgresRepository) loadClientMaintenancePlan(ctx context.Context, clientID uuid.UUID) (*hairappointments.MaintenancePlan, []hairappointments.MaintenancePlanItem, error) {
	plan := &hairappointments.MaintenancePlan{}
	row := r.pool.QueryRow(ctx, `
select id, client_id
from maintenance_plans
where client_id = $1
`, clientID)
	if err := row.Scan(&plan.ID, &plan.ClientID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			return nil, []hairappointments.MaintenancePlanItem{}, nil
		}
		return nil, nil, errors.Wrap(err, "failed to load stylist client maintenance plan")
	}

	rows, err := r.pool.Query(ctx, `
select
  mi.id,
  mi.plan_id,
  mi.service_id,
  s.name,
  to_char(mi.due_date, 'YYYY-MM-DD'),
  mi.status,
  mi.appointment_id,
  coalesce(mi.sort_order, 0)
from maintenance_items mi
join services s on s.id = mi.service_id
where mi.plan_id = $1
order by mi.sort_order, mi.due_date, mi.id
`, plan.ID)
	if err != nil {
		return nil, nil, errors.Wrap(err, "failed to query stylist client maintenance items")
	}
	defer rows.Close()

	items := []hairappointments.MaintenancePlanItem{}
	for rows.Next() {
		item := hairappointments.MaintenancePlanItem{}
		if err := rows.Scan(
			&item.ID,
			&item.PlanID,
			&item.ServiceID,
			&item.ServiceName,
			&item.DueDate,
			&item.Status,
			&item.AppointmentID,
			&item.SortOrder,
		); err != nil {
			return nil, nil, errors.Wrap(err, "failed to scan stylist client maintenance item")
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, errors.Wrap(err, "failed to iterate stylist client maintenance items")
	}
	return plan, items, nil
}
