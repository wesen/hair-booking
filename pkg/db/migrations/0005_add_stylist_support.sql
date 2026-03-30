comment on table appointments is 'Single-stylist MVP: appointments are intentionally unassigned and do not include stylist_id until multi-stylist scheduling exists.';

create index if not exists idx_clients_name on clients(name);
create index if not exists idx_intake_submissions_client_created_at on intake_submissions(client_id, created_at desc);
create index if not exists idx_intake_reviews_status_priority_reviewed_at on intake_reviews(status, priority, reviewed_at desc);
create index if not exists idx_appointments_client_date_time on appointments(client_id, date desc, start_time desc);
create index if not exists idx_maintenance_plans_client_id on maintenance_plans(client_id);
