#!/usr/bin/env bash

set -euo pipefail

docker exec -i hair-booking-app-postgres psql -U hair_booking -d hair_booking <<'SQL'
\x on

select id, name, email, phone, created_at, updated_at
from clients
order by created_at desc
limit 5;

select id, service_type, estimate_low, estimate_high, created_at
from intake_submissions
order by created_at desc
limit 5;

select id, client_id, service_id, intake_id, date, start_time, status, created_at
from appointments
order by created_at desc
limit 5;

select id, intake_id, slot, storage_key, url
from intake_photos
order by id desc
limit 10;
SQL
