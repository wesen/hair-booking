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
set name = case
      when coalesce(nullif(trim(name), ''), '') = '' and nullif($2, '') is not null then $2
      else name
    end,
    email = case
      when coalesce(nullif(trim(email), ''), '') = '' and nullif($3, '') is not null then $3
      else email
    end,
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

func (r *PostgresRepository) UpdateProfile(ctx context.Context, clientID uuid.UUID, update ProfileUpdate) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	client := &Client{}
	row := r.pool.QueryRow(ctx, `
update clients
set name = coalesce($2, name),
    email = case
      when $3 is null then email
      else nullif($3, '')
    end,
    phone = case
      when $4 is null then phone
      else nullif($4, '')
    end,
    scalp_notes = case
      when $5 is null then scalp_notes
      else nullif($5, '')
    end,
    updated_at = now()
where id = $1
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, clientID, update.Name, update.Email, update.Phone, update.ScalpNotes)

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
		return nil, errors.Wrap(err, "failed to update client profile")
	}

	return client, nil
}

func (r *PostgresRepository) UpdateNotificationPrefs(ctx context.Context, clientID uuid.UUID, update NotificationPrefsUpdate) (*NotificationPrefs, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	prefs := &NotificationPrefs{}
	row := r.pool.QueryRow(ctx, `
update notification_prefs
set remind_48hr = coalesce($2, remind_48hr),
    remind_2hr = coalesce($3, remind_2hr),
    maint_alerts = coalesce($4, maint_alerts)
where client_id = $1
returning client_id, remind_48hr, remind_2hr, maint_alerts
`, clientID, update.Remind48hr, update.Remind2hr, update.MaintAlerts)

	if err := row.Scan(&prefs.ClientID, &prefs.Remind48hr, &prefs.Remind2hr, &prefs.MaintAlerts); err != nil {
		return nil, errors.Wrap(err, "failed to update notification prefs")
	}

	return prefs, nil
}
