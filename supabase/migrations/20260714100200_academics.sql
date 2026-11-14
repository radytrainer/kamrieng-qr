-- ==========================================================================
-- Academic structure: departments (faculty), study_programs (major/degree),
-- teachers, academic_years, classes.
-- ==========================================================================

create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name_en     text not null,
  name_km     text,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

create table public.study_programs (
  id                uuid primary key default gen_random_uuid(),
  department_id     uuid not null references public.departments(id) on delete restrict,
  code              text not null unique,
  name_en           text not null,
  name_km           text,
  degree            text not null default 'high_school',
  credits_required  integer,
  duration_years     numeric(3,1),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_study_programs_department_id on public.study_programs(department_id);

create trigger set_updated_at
  before update on public.study_programs
  for each row execute function public.set_updated_at();

create table public.teachers (
  id                 uuid primary key default gen_random_uuid(),
  teacher_code       text not null unique,
  photo_url          text,
  khmer_first_name   text not null,
  khmer_last_name    text not null,
  english_first_name text not null,
  english_last_name  text not null,
  gender             text not null check (gender in ('male', 'female', 'other')),
  date_of_birth      date,
  phone              text,
  email              text unique,
  department_id      uuid references public.departments(id) on delete set null,
  position           text,
  hire_date          date,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_teachers_department_id on public.teachers(department_id);
create index idx_teachers_is_active on public.teachers(is_active);
create index idx_teachers_name_trgm on public.teachers
  using gin ((english_first_name || ' ' || english_last_name) gin_trgm_ops);

create trigger set_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

create table public.academic_years (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique, -- e.g. "2025-2026"
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint academic_years_date_order check (end_date > start_date)
);

-- Only one academic year may be "current" at a time.
create unique index idx_academic_years_one_current
  on public.academic_years (is_current) where is_current;

create trigger set_updated_at
  before update on public.academic_years
  for each row execute function public.set_updated_at();

create table public.classes (
  id                  uuid primary key default gen_random_uuid(),
  academic_year_id    uuid not null references public.academic_years(id) on delete restrict,
  department_id       uuid references public.departments(id) on delete set null,
  study_program_id    uuid references public.study_programs(id) on delete set null,
  homeroom_teacher_id uuid references public.teachers(id) on delete set null,
  name                text not null, -- e.g. "Grade 10A"
  grade_level         smallint,
  capacity            smallint,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (academic_year_id, name)
);

create index idx_classes_academic_year_id on public.classes(academic_year_id);
create index idx_classes_department_id on public.classes(department_id);
create index idx_classes_study_program_id on public.classes(study_program_id);
create index idx_classes_homeroom_teacher_id on public.classes(homeroom_teacher_id);

create trigger set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();
