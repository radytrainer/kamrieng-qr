-- ==========================================================================
-- parents + student_parents (many-to-many: siblings share a parent record)
-- ==========================================================================

create table public.parents (
  id           uuid primary key default gen_random_uuid(),
  khmer_name   text,
  english_name text not null,
  relationship text not null check (relationship in ('father', 'mother', 'guardian')),
  phone        text,
  email        text,
  occupation   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.parents
  for each row execute function public.set_updated_at();

create table public.student_parents (
  student_id           uuid not null references public.students(id) on delete cascade,
  parent_id            uuid not null references public.parents(id) on delete cascade,
  is_emergency_contact boolean not null default false,
  created_at           timestamptz not null default now(),
  primary key (student_id, parent_id)
);

create index idx_student_parents_student_id on public.student_parents(student_id);
create index idx_student_parents_parent_id on public.student_parents(parent_id);

-- At most one emergency contact per student.
create unique index idx_student_parents_one_emergency
  on public.student_parents(student_id) where is_emergency_contact;
