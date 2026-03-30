create table if not exists intake_reviews (
  id uuid primary key,
  intake_id uuid not null unique references intake_submissions(id),
  status text not null default 'new',
  priority text not null default 'normal',
  summary text,
  internal_notes text,
  quoted_price_low int,
  quoted_price_high int,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('new', 'in_review', 'needs_client_reply', 'approved_to_book', 'archived')),
  check (priority in ('normal', 'urgent'))
);
