-- ==========================================================================
-- Auto-generate student_code and student_token at the database level.
-- Doing this as a column DEFAULT (rather than "count existing rows, then
-- insert" in application code) avoids a race condition between two
-- concurrent enrollments.
-- ==========================================================================

create sequence public.student_code_seq start with 1;

create or replace function public.generate_student_code()
returns text
language sql
as $$
  select 'STU-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.student_code_seq')::text, 4, '0');
$$;

-- 12-char uppercase alphanumeric token, e.g. "A83KD93LQ2P". Collisions are
-- astronomically unlikely (36^12 keyspace) and the UNIQUE constraint on
-- student_token still guards against one.
create or replace function public.generate_student_token()
returns text
language sql
as $$
  select upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 12));
$$;

alter table public.students
  alter column student_code set default public.generate_student_code(),
  alter column student_token set default public.generate_student_token();
