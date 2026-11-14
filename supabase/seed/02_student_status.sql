insert into public.student_status (code, label_en, label_km, is_terminal) values
  ('active',      'Active',      'កំពុងសិក្សា',   false),
  ('inactive',    'Inactive',    'អសកម្ម',        false),
  ('graduated',   'Graduated',   'បានបញ្ចប់ការសិក្សា', true),
  ('suspended',   'Suspended',   'ផ្អាកការសិក្សា', false),
  ('transferred', 'Transferred', 'បានផ្ទេរ',       true),
  ('expelled',    'Expelled',    'បណ្តេញចេញ',     true)
on conflict (code) do nothing;
