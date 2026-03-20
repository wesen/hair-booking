package intake

import (
	"context"

	"github.com/google/uuid"
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

func (r *PostgresRepository) CreateSubmission(ctx context.Context, submission Submission) (*Submission, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	if submission.ID == uuid.Nil {
		submission.ID = uuid.New()
	}

	row := r.pool.QueryRow(ctx, `
insert into intake_submissions(
  id, client_id, service_type, hair_length, hair_density, hair_texture,
  prev_extensions, color_service, natural_level, current_color, chemical_history,
  last_chemical, desired_length, ext_type, budget, maintenance, deadline,
  dream_result, estimate_low, estimate_high
)
values(
  $1, $2, $3, nullif($4, ''), nullif($5, ''), nullif($6, ''),
  nullif($7, ''), nullif($8, ''), nullif($9, ''), nullif($10, ''), $11,
  nullif($12, ''), $13, nullif($14, ''), nullif($15, ''), nullif($16, ''), nullif($17, ''),
  nullif($18, ''), $19, $20
)
returning id, client_id, service_type, hair_length, hair_density, hair_texture,
  prev_extensions, color_service, natural_level, current_color, chemical_history,
  last_chemical, desired_length, ext_type, budget, maintenance, deadline,
  dream_result, estimate_low, estimate_high
`,
		submission.ID,
		submission.ClientID,
		submission.ServiceType,
		submission.HairLength,
		submission.HairDensity,
		submission.HairTexture,
		submission.PrevExtensions,
		submission.ColorService,
		submission.NaturalLevel,
		submission.CurrentColor,
		submission.ChemicalHistory,
		submission.LastChemical,
		submission.DesiredLength,
		submission.ExtType,
		submission.Budget,
		submission.Maintenance,
		submission.Deadline,
		submission.DreamResult,
		submission.EstimateLow,
		submission.EstimateHigh,
	)

	created := &Submission{}
	if err := row.Scan(
		&created.ID,
		&created.ClientID,
		&created.ServiceType,
		&created.HairLength,
		&created.HairDensity,
		&created.HairTexture,
		&created.PrevExtensions,
		&created.ColorService,
		&created.NaturalLevel,
		&created.CurrentColor,
		&created.ChemicalHistory,
		&created.LastChemical,
		&created.DesiredLength,
		&created.ExtType,
		&created.Budget,
		&created.Maintenance,
		&created.Deadline,
		&created.DreamResult,
		&created.EstimateLow,
		&created.EstimateHigh,
	); err != nil {
		return nil, errors.Wrap(err, "failed to create intake submission")
	}

	return created, nil
}

func (r *PostgresRepository) AddPhoto(ctx context.Context, intakeID uuid.UUID, slot, storageKey, url string) (*Photo, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	row := r.pool.QueryRow(ctx, `
insert into intake_photos(id, intake_id, slot, storage_key, url)
values($1, $2, $3, $4, $5)
returning id, intake_id, slot, storage_key, url
`, uuid.New(), intakeID, slot, storageKey, url)

	photo := &Photo{}
	if err := row.Scan(&photo.ID, &photo.IntakeID, &photo.Slot, &photo.StorageKey, &photo.URL); err != nil {
		return nil, errors.Wrap(err, "failed to add intake photo")
	}

	return photo, nil
}
