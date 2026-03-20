package clients

import (
	"context"
	"database/sql"
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
	var authSubject sql.NullString
	var authIssuer sql.NullString
	var email sql.NullString
	var phone sql.NullString
	var scalpNotes sql.NullString
	var serviceSummary sql.NullString
	if err := row.Scan(
		&client.ID,
		&authSubject,
		&authIssuer,
		&client.Name,
		&email,
		&phone,
		&scalpNotes,
		&serviceSummary,
		&client.CreatedAt,
		&client.UpdatedAt,
	); err != nil {
		if strings.Contains(err.Error(), "no rows") {
			return nil, ErrNotFound
		}
		return nil, errors.Wrap(err, "failed to load client by auth identity")
	}

	assignNullableClientFields(client, authSubject, authIssuer, email, phone, scalpNotes, serviceSummary)
	return client, nil
}

func (r *PostgresRepository) CreateAuthenticatedClient(ctx context.Context, identity AuthenticatedIdentity) (*Client, error) {
	if r == nil || r.pool == nil {
		return nil, errors.New("postgres pool is not configured")
	}

	client := &Client{}
	row := r.pool.QueryRow(ctx, `
insert into clients(id, auth_subject, auth_issuer, name, email)
values($1, $2, $3, $4, nullif($5::text, ''))
on conflict (email) do update
set auth_subject = excluded.auth_subject,
    auth_issuer = excluded.auth_issuer,
    name = case
      when coalesce(nullif(trim(clients.name), ''), '') = '' then excluded.name
      else clients.name
    end,
    updated_at = now()
where clients.auth_subject is null
   or (clients.auth_subject = excluded.auth_subject and clients.auth_issuer = excluded.auth_issuer)
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, uuid.New(), identity.Subject, identity.Issuer, identity.DisplayName, identity.Email)

	var authSubject sql.NullString
	var authIssuer sql.NullString
	var email sql.NullString
	var phone sql.NullString
	var scalpNotes sql.NullString
	var serviceSummary sql.NullString
	if err := row.Scan(
		&client.ID,
		&authSubject,
		&authIssuer,
		&client.Name,
		&email,
		&phone,
		&scalpNotes,
		&serviceSummary,
		&client.CreatedAt,
		&client.UpdatedAt,
	); err != nil {
		return nil, errors.Wrap(err, "failed to create authenticated client")
	}

	assignNullableClientFields(client, authSubject, authIssuer, email, phone, scalpNotes, serviceSummary)
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
      when coalesce(nullif(trim(name), ''), '') = '' and nullif($2::text, '') is not null then $2::text
      else name
    end,
    email = case
      when coalesce(nullif(trim(email), ''), '') = '' and nullif($3::text, '') is not null then $3::text
      else email
    end,
    updated_at = now()
where id = $1
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, clientID, identity.DisplayName, identity.Email)

	var authSubject sql.NullString
	var authIssuer sql.NullString
	var email sql.NullString
	var phone sql.NullString
	var scalpNotes sql.NullString
	var serviceSummary sql.NullString
	if err := row.Scan(
		&client.ID,
		&authSubject,
		&authIssuer,
		&client.Name,
		&email,
		&phone,
		&scalpNotes,
		&serviceSummary,
		&client.CreatedAt,
		&client.UpdatedAt,
	); err != nil {
		return nil, errors.Wrap(err, "failed to update authenticated client")
	}

	assignNullableClientFields(client, authSubject, authIssuer, email, phone, scalpNotes, serviceSummary)
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

	nameArg := nullableStringPointer(update.Name)
	emailArg := nullableStringPointer(update.Email)
	phoneArg := nullableStringPointer(update.Phone)
	scalpNotesArg := nullableStringPointer(update.ScalpNotes)

	client := &Client{}
	row := r.pool.QueryRow(ctx, `
update clients
set name = coalesce($2::text, name),
    email = case
      when $3::text is null then email
      else nullif($3::text, '')
    end,
    phone = case
      when $4::text is null then phone
      else nullif($4::text, '')
    end,
    scalp_notes = case
      when $5::text is null then scalp_notes
      else nullif($5::text, '')
    end,
    updated_at = now()
where id = $1
returning id, auth_subject, auth_issuer, name, email, phone, scalp_notes, service_summary, created_at, updated_at
`, clientID, nameArg, emailArg, phoneArg, scalpNotesArg)

	var authSubject sql.NullString
	var authIssuer sql.NullString
	var email sql.NullString
	var phone sql.NullString
	var scalpNotes sql.NullString
	var serviceSummary sql.NullString
	if err := row.Scan(
		&client.ID,
		&authSubject,
		&authIssuer,
		&client.Name,
		&email,
		&phone,
		&scalpNotes,
		&serviceSummary,
		&client.CreatedAt,
		&client.UpdatedAt,
	); err != nil {
		return nil, errors.Wrap(err, "failed to update client profile")
	}

	assignNullableClientFields(client, authSubject, authIssuer, email, phone, scalpNotes, serviceSummary)
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

func assignNullableClientFields(
	client *Client,
	authSubject sql.NullString,
	authIssuer sql.NullString,
	email sql.NullString,
	phone sql.NullString,
	scalpNotes sql.NullString,
	serviceSummary sql.NullString,
) {
	if client == nil {
		return
	}

	client.AuthSubject = nullableString(authSubject)
	client.AuthIssuer = nullableString(authIssuer)
	client.Email = nullableString(email)
	client.Phone = nullableString(phone)
	client.ScalpNotes = nullableString(scalpNotes)
	client.ServiceSummary = nullableString(serviceSummary)
}

func nullableString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func nullableStringPointer(value *string) any {
	if value == nil {
		return nil
	}
	return *value
}
