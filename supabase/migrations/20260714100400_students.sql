-- ==========================================================================
-- student_status (lookup) + students
-- ==========================================================================

create table public.student_status (
  code        text primary key,
  label_en    text not null,
  label_km    text,
  is_terminal boolean not null default false, -- graduated/expelled/transferred: no reverting to active
  created_at  timestamptz not null default now()
);

create table public.students (
  id                  uuid primary key default gen_random_uuid(),

  -- Identity
  student_code        text not null unique,       -- human-readable ID, e.g. "STU-2026-0001"
  student_token       text not null unique,        -- secure random token used in the QR payload only
  photo_url           text,
  khmer_first_name    text not null,
  khmer_last_name     text not null,
  english_first_name  text not null,
  english_last_name   text not null,
  gender              text not null check (gender in ('male', 'female', 'other')),
  date_of_birth       date not null,
  place_of_birth      text,
  nationality         text not null default 'Khmer',

  -- Contact (PII — hidden from public verification, see RLS + API layer)
  phone               text,
  email               text,
  address             text,
  province            text,
  district            text,
  commune             text,
  village             text,

  -- Academic placement
  department_id       uuid references public.departments(id) on delete set null,
  study_program_id    uuid references public.study_programs(id) on delete set null,
  class_id            uuid references public.classes(id) on delete set null,
  academic_year_id    uuid references public.academic_years(id) on delete set null,
  study_year          smallint,
  semester            smallint check (semester is null or semester in (1, 2)),
  gpa                 numeric(3,2) check (gpa is null or (gpa >= 0 and gpa <= 4)),
  credits_earned      integer not null default 0,

  -- Status + card validity
  status              text not null default 'active' references public.student_status(code),
  issue_date          date,
  expiry_date         date,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint students_card_date_order
    check (expiry_date is null or issue_date is null or expiry_date > issue_date)
);

comment on column public.students.student_token is
  'Opaque random token embedded in the QR code (https://school.edu.kh/student/{token}). Never the same as id/student_code.';

create index idx_students_status on public.students(status);
create index idx_students_department_id on public.students(department_id);
create index idx_students_study_program_id on public.students(study_program_id);
create index idx_students_class_id on public.students(class_id);
create index idx_students_academic_year_id on public.students(academic_year_id);
create index idx_students_student_token on public.students(student_token);
create index idx_students_student_code on public.students(student_code);
create index idx_students_name_trgm on public.students
  using gin (
    (english_first_name || ' ' || english_last_name || ' ' || khmer_first_name || ' ' || khmer_last_name)
    gin_trgm_ops
  );

create trigger set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- Now that teachers + students exist, wire up the deferred FKs on users.
alter table public.users
  add constraint users_teacher_id_fkey foreign key (teacher_id) references public.teachers(id) on delete set null,
  add constraint users_student_id_fkey foreign key (student_id) references public.students(id) on delete set null;

create index idx_users_teacher_id on public.users(teacher_id);
create index idx_users_student_id on public.users(student_id);
