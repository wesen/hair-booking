insert into services (id, name, category, duration_min, price_low, price_high, is_active, sort_order)
values
  ('4a3d3653-fd03-4f0e-9be8-9d7a4bce33a1', 'Extensions Consultation', 'consult', 15, 0, 0, true, 10),
  ('fb964f96-5ac4-4e54-8561-59c6b0f5dd77', 'Color Consultation', 'consult', 15, 0, 0, true, 20),
  ('9cb1b2e2-66f0-4db2-8df4-d658a0c6111d', 'Tape-In Install', 'extensions', 120, 500, 1200, true, 30),
  ('d79e6319-8a0b-4b96-b247-673f6d8f6d3b', 'K-Tip Install', 'extensions', 240, 800, 1800, true, 40),
  ('6b1ac8eb-4f06-44ea-8ffa-a3ea9877ed96', 'Hand-Tied Weft Install', 'extensions', 180, 700, 1600, true, 50),
  ('e76ef9de-e65e-4e42-b96d-61d6b57099c7', 'Highlights / Balayage', 'color', 180, 250, 800, true, 60),
  ('e7d199b1-9292-4b03-84a6-8b0d387f6b92', 'Gloss / Toner', 'color', 45, 75, 150, true, 70),
  ('545593cd-bfc7-4a74-bff4-c88d7c6c7217', 'Deep Conditioning Treatment', 'treatment', 30, 40, 90, true, 80)
on conflict (id) do nothing;
