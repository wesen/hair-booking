package stylist

import (
	"context"
	"database/sql"
	"strings"
	"time"

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
  i.id,
  i.client_id,
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
