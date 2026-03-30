insert into schedule_blocks (id, day_of_week, start_time, end_time, is_available)
select seeded.id, seeded.day_of_week, seeded.start_time, seeded.end_time, seeded.is_available
from (
  values
    ('7f77a6e3-3dd5-4201-899d-324f2bb31c31'::uuid, 1, '09:00'::time, '17:00'::time, true),
    ('b6dc03d4-7f9d-40db-ad55-5618af6d4d7d'::uuid, 2, '09:00'::time, '17:00'::time, true),
    ('6f8fe8ec-6e6b-4583-a06e-89b71e6828b3'::uuid, 3, '09:00'::time, '17:00'::time, true),
    ('db99a2bb-f0df-4d60-a4a0-bb00e04720ac'::uuid, 4, '09:00'::time, '17:00'::time, true),
    ('bc13d31d-82fc-4097-87d6-a6ce429fc591'::uuid, 5, '09:00'::time, '17:00'::time, true),
    ('dd0cfde7-4f57-4c74-9c42-128e738aa3fb'::uuid, 6, '09:00'::time, '15:00'::time, true)
) as seeded(id, day_of_week, start_time, end_time, is_available)
where not exists (
  select 1
  from schedule_blocks
);
