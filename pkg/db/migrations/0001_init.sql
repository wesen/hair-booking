create table if not exists clients (
  id uuid primary key,
  auth_subject text unique,
  auth_issuer text,
  name text not null,
  email text unique,
  phone text unique,
  scalp_notes text,
  service_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key,
  name text not null,
  category text not null,
  duration_min int not null,
  price_low int,
  price_high int,
  is_active bool not null default true,
  sort_order int
);

create table if not exists intake_submissions (
  id uuid primary key,
  client_id uuid references clients(id),
  service_type text not null,
  hair_length text,
  hair_density text,
  hair_texture text,
  prev_extensions text,
  color_service text,
  natural_level text,
  current_color text,
  chemical_history text[],
  last_chemical text,
  desired_length int,
  ext_type text,
  budget text,
  maintenance text,
  deadline text,
  dream_result text,
  estimate_low int,
  estimate_high int,
  created_at timestamptz not null default now()
);

create table if not exists intake_photos (
  id uuid primary key,
  intake_id uuid not null references intake_submissions(id),
  slot text not null,
  storage_key text not null,
  url text not null
);

create table if not exists appointments (
  id uuid primary key,
  client_id uuid not null references clients(id),
  service_id uuid not null references services(id),
  intake_id uuid references intake_submissions(id),
  date date not null,
  start_time time not null,
  duration_min_snapshot int not null,
  status text not null default 'pending',
  stylist_notes text,
  prep_notes text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

create table if not exists appointment_photos (
  id uuid primary key,
  appointment_id uuid not null references appointments(id),
  slot text not null,
  storage_key text not null,
  url text not null,
  caption text
);

create table if not exists maintenance_plans (
  id uuid primary key,
  client_id uuid not null references clients(id)
);

create table if not exists maintenance_items (
  id uuid primary key,
  plan_id uuid not null references maintenance_plans(id),
  service_id uuid not null references services(id),
  due_date date not null,
  status text not null default 'upcoming',
  appointment_id uuid references appointments(id),
  sort_order int,
  check (status in ('done', 'next', 'upcoming', 'overdue'))
);

create table if not exists notification_prefs (
  client_id uuid primary key references clients(id),
  remind_48hr bool not null default true,
  remind_2hr bool not null default true,
  maint_alerts bool not null default true
);

create table if not exists schedule_blocks (
  id uuid primary key,
  day_of_week int not null,
  start_time time not null,
  end_time time not null,
  is_available bool not null default true,
  check (day_of_week >= 0 and day_of_week <= 6)
);

create table if not exists schedule_overrides (
  id uuid primary key,
  date date not null unique,
  is_blocked bool not null default true,
  start_time time,
  end_time time
);

create index if not exists idx_clients_auth_subject on clients(auth_subject);
create index if not exists idx_appointments_date_start_time on appointments(date, start_time);
create index if not exists idx_appointments_active_client on appointments(client_id) where status <> 'cancelled';
create index if not exists idx_intake_photos_intake_id on intake_photos(intake_id);
create index if not exists idx_maintenance_items_plan_sort on maintenance_items(plan_id, sort_order);
create index if not exists idx_appointments_date_status on appointments(date, status);
