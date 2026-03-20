package clients

import (
	"context"
	"strings"

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

func (r *PostgresRepository) FindByAuthIdentity(ctx context.Context, issuer, subject string) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	row := r.pool.QueryRow(ctx, `
select id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
from clients
where auth_issuer = $1 and auth_subject = $2
`, issuer, subject)

	client := &Client{}
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
	); err != nil {
		if strings.Contains(err.Error(), "no rows") {
			return nil, ErrNotFound
		}
		return nil, errors.Wrap(err, "failed to load client by auth identity")
	}

	return client, nil
}

func (r *PostgresRepository) CreateAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	client := &Client{}
	row := r.pool.QueryRow(ctx, `
insert into clients(id, auth_subject, auth_issuer, name, email)
values($1, $2, $3, $4, nullif($5, ''))
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, uuid.New(), identity.Subject, identity.Issuer, identity.DisplayName, identity.Email)

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
	); err != nil {
		return nil, errors.Wrap(err, "failed to create authenticated client")
	}

	return client, nil
}

func (r *PostgresRepository) UpdateAuthenticatedClient(ctx context.Context, clientID uuid.UUID, identity AuthenticatedIdentity) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	client := &Client{}
	row := r.pool.QueryRow(ctx, `
update clients
set name = $2,
    email = coalesce(nullif($3, ''), email),
    updated_at = now()
where id = $1
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, clientID, identity.DisplayName, identity.Email)

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
	); err != nil {
		return nil, errors.Wrap(err, "failed to update authenticated client")
	}

	return client, nil
}

func (r *PostgresRepository) EnsureNotificationPrefs(ctx context.Context, clientID uuid.UUID) (*NotificationPrefs, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	if _, err := r.pool.Exec(ctx, `
insert into notification_prefs(client_id)
values($1)
on conflict (client_id) do nothing
`, clientID); err != nil {
		return nil, errors.Wrap(err, "failed to ensure notification prefs")
	}

	prefs := &NotificationPrefs{}
	row := r.pool.QueryRow(ctx, `
select client_id, remind_48hr, remind_2hr, maint_alerts
from notification_prefs
where client_id = $1
`, clientID)

	if err := row.Scan(&prefs.ClientID, &prefs.Remind48hr, &prefs.Remind2hr, &prefs.MaintAlerts); err != nil {
		return nil, errors.Wrap(err, "failed to load notification prefs")
	}

	return prefs, nil
}
