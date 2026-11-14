-- ==========================================================================
-- The demo seed data (supabase/seed/05_demo_students.sql) inserted students
-- with hardcoded student_code values, bypassing student_code_seq entirely.
-- The sequence was never advanced, so generate_student_code() collided
-- with the first existing row on the very next real insert. Advance it
-- past whatever the highest existing numeric suffix actually is, so this
-- self-heals regardless of how much seed/demo data has accumulated.
-- ==========================================================================

select setval(
  'public.student_code_seq',
  greatest(
    (select coalesce(max(substring(student_code from '\d+$')::int), 0) from public.students),
    1
  )
);
