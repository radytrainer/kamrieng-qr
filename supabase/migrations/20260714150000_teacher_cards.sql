-- ==========================================================================
-- Teacher ID cards: mirrors the student_token / issue_date / expiry_date
-- treatment on public.students (see 20260714100400_students.sql +
-- 20260714110100_student_code_generation.sql) so teachers get the same
-- QR-verifiable card.
-- ==========================================================================

alter table public.teachers
  add column teacher_token text unique,
  add column issue_date    date,
  add column expiry_date   date;

comment on column public.teachers.teacher_token is
  'Opaque random token embedded in the QR code (https://school.edu.kh/teacher/{token}). Never the same as id/teacher_code.';

alter table public.teachers
  add constraint teachers_card_date_order
    check (expiry_date is null or issue_date is null or expiry_date > issue_date);

create index idx_teachers_teacher_token on public.teachers(teacher_token);

-- 12-char uppercase alphanumeric token, same shape/collision-safety as
-- generate_student_token().
create or replace function public.generate_teacher_token()
returns text
language sql
as $$
  select upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 12));
$$;

alter table public.teachers
  alter column teacher_token set default public.generate_teacher_token();

-- Backfill existing rows (the column was just added as nullable so this
-- statement is required before we can make it not-null).
update public.teachers
  set teacher_token = public.generate_teacher_token()
  where teacher_token is null;

alter table public.teachers
  alter column teacher_token set not null;
