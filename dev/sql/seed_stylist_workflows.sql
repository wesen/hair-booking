insert into clients (id, name, email, phone, scalp_notes, service_summary, created_at, updated_at)
values
  (
    '1d3a1f74-9c95-4f02-a4c9-7ebba3c62301'::uuid,
    'Avery Moss',
    'avery.moss@example.com',
    '555-0101',
    'Fine scalp sensitivity around the hairline.',
    'Prefers low-maintenance extension blends.',
    now() - interval '21 days',
    now() - interval '2 days'
  ),
  (
    '2dfed0aa-cd8f-4f78-85c9-15a574f3d202'::uuid,
    'Bianca Reed',
    'bianca.reed@example.com',
    '555-0102',
    'Dry ends from recent lightening.',
    'Balayage client considering tape-ins for summer volume.',
    now() - interval '17 days',
    now() - interval '1 day'
  ),
  (
    '3f6e0b0f-e4c3-4f11-9db7-4cb0e6a70303'::uuid,
    'Carmen Lopez',
    'carmen.lopez@example.com',
    '555-0103',
    'No scalp concerns noted.',
    'Repeat extension maintenance client.',
    now() - interval '30 days',
    now() - interval '3 days'
  )
on conflict (id) do nothing;

insert into intake_submissions (
  id, client_id, service_type, hair_length, hair_density, hair_texture,
  color_service, current_color, budget, maintenance, deadline, dream_result,
  estimate_low, estimate_high, created_at
)
values
  (
    'a36bb5f1-e22d-4a88-9a75-84af8fe40111'::uuid,
    '1d3a1f74-9c95-4f02-a4c9-7ebba3c62301'::uuid,
    'extensions',
    'medium',
    'fine',
    'straight',
    'none',
    'soft brunette',
    '$800-$1200',
    '8-10 weeks',
    'Wedding in six weeks',
    'Natural fullness with 18-inch length.',
    900,
    1300,
    now() - interval '4 days'
  ),
  (
    'b4f6b1c8-ec7e-47ac-8e2d-d7ed9d220222'::uuid,
    '2dfed0aa-cd8f-4f78-85c9-15a574f3d202'::uuid,
    'both',
    'long',
    'medium',
    'wavy',
    'balayage refresh',
    'warm blonde',
    '$1200-$1800',
    '6-8 weeks',
    'Vacation in one month',
    'Brighter blend with added fullness through the ends.',
    1200,
    1800,
    now() - interval '2 days'
  ),
  (
    'c58af21d-2f89-45fe-a6fb-5d50c6b60333'::uuid,
    '3f6e0b0f-e4c3-4f11-9db7-4cb0e6a70303'::uuid,
    'extensions',
    'long',
    'dense',
    'curly',
    'none',
    'dark brunette',
    '$600-$900',
    '8 weeks',
    'Routine move-up',
    'Maintenance appointment with trim and reinstall.',
    650,
    950,
    now() - interval '12 days'
  )
on conflict (id) do nothing;

insert into intake_reviews (
  id, intake_id, status, priority, summary, internal_notes,
  quoted_price_low, quoted_price_high, reviewed_at, created_at, updated_at
)
values
  (
    '73b311a0-c1e1-43f9-bf20-c2c5e8b10441'::uuid,
    'a36bb5f1-e22d-4a88-9a75-84af8fe40111'::uuid,
    'in_review',
    'urgent',
    'Good consultation candidate for tape-ins before the wedding.',
    'Confirm whether she wants color match rings at consult.',
    950,
    1350,
    now() - interval '3 days',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '844cd040-f27a-446b-a433-c75b57f40552'::uuid,
    'b4f6b1c8-ec7e-47ac-8e2d-d7ed9d220222'::uuid,
    'needs_client_reply',
    'normal',
    'Need clarification on recent bleach history before quoting install + color.',
    'Follow up about the last lightening appointment and box dye use.',
    1300,
    1850,
    now() - interval '1 day',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '95db4972-7677-4be0-bab7-5e8304d50663'::uuid,
    'c58af21d-2f89-45fe-a6fb-5d50c6b60333'::uuid,
    'approved_to_book',
    'normal',
    'Routine maintenance approved.',
    'Reserve extra blend time if curls need more detangling.',
    700,
    950,
    now() - interval '10 days',
    now() - interval '10 days',
    now() - interval '10 days'
  )
on conflict (intake_id) do nothing;

insert into appointments (
  id, client_id, service_id, intake_id, date, start_time, duration_min_snapshot,
  status, prep_notes, stylist_notes, created_at, updated_at
)
values
  (
    'de4a02fd-8240-4636-8dc6-b1ea8ec50771'::uuid,
    '1d3a1f74-9c95-4f02-a4c9-7ebba3c62301'::uuid,
    '4a3d3653-fd03-4f0e-9be8-9d7a4bce33a1'::uuid,
    'a36bb5f1-e22d-4a88-9a75-84af8fe40111'::uuid,
    current_date + 3,
    '09:30'::time,
    15,
    'confirmed',
    'Prep tape-in sample swatches.',
    'Wedding consult; review hairline sensitivity.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'ef5bb36a-d2bc-4a19-9cc0-57d2eaf70882'::uuid,
    '2dfed0aa-cd8f-4f78-85c9-15a574f3d202'::uuid,
    'fb964f96-5ac4-4e54-8561-59c6b0f5dd77'::uuid,
    'b4f6b1c8-ec7e-47ac-8e2d-d7ed9d220222'::uuid,
    current_date + 5,
    '11:00'::time,
    15,
    'pending',
    'Pull prior balayage reference photos.',
    '',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'f0612dc9-4c50-4a37-a10b-f2a79bf80993'::uuid,
    '3f6e0b0f-e4c3-4f11-9db7-4cb0e6a70303'::uuid,
    '9cb1b2e2-66f0-4db2-8df4-d658a0c6111d'::uuid,
    'c58af21d-2f89-45fe-a6fb-5d50c6b60333'::uuid,
    current_date + 8,
    '10:00'::time,
    120,
    'confirmed',
    'Order tape-ins in brunette mix before visit.',
    'Repeat maintenance client.',
    now() - interval '8 days',
    now() - interval '8 days'
  )
on conflict (id) do nothing;

insert into maintenance_plans (id, client_id)
values (
  '01762ebf-2122-40ee-a3e8-33bbf95f6114'::uuid,
  '3f6e0b0f-e4c3-4f11-9db7-4cb0e6a70303'::uuid
)
on conflict (id) do nothing;

insert into maintenance_items (
  id, plan_id, service_id, due_date, status, appointment_id, sort_order
)
values
  (
    '1187d98a-b84d-4201-9d13-bc74d8607115'::uuid,
    '01762ebf-2122-40ee-a3e8-33bbf95f6114'::uuid,
    '9cb1b2e2-66f0-4db2-8df4-d658a0c6111d'::uuid,
    current_date + 8,
    'next',
    'f0612dc9-4c50-4a37-a10b-f2a79bf80993'::uuid,
    10
  ),
  (
    '2298f09b-c951-4a2a-9fb7-cd85e9717226'::uuid,
    '01762ebf-2122-40ee-a3e8-33bbf95f6114'::uuid,
    '545593cd-bfc7-4a74-bff4-c88d7c6c7217'::uuid,
    current_date + 40,
    'upcoming',
    null,
    20
  )
on conflict (id) do nothing;
