-- ==========================================================================
-- RBAC core: roles, permissions, role_permissions, users
--
-- Auth is handled by Firebase (not Supabase Auth). `users` mirrors the
-- Firebase identity + assigns an application role. `firebase_uid` is
-- nullable so a Super/School Admin can pre-provision an account (by email)
-- before that person ever logs in — the first successful Firebase sign-in
-- backfills firebase_uid (see Phase 3 session sync logic).
-- ==========================================================================

create table public.roles (
  code        text primary key,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

comment on table public.roles is 'Fixed set of application roles: super_admin, school_admin, teacher, student, visitor.';

create table public.permissions (
  code        text primary key,
  description text,
  created_at  timestamptz not null default now()
);

create table public.role_permissions (
  role_code       text not null references public.roles(code) on delete cascade,
  permission_code text not null references public.permissions(code) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (role_code, permission_code)
);

create table public.users (
  id             uuid primary key default gen_random_uuid(),
  firebase_uid   text unique,
  email          text not null unique,
  display_name   text,
  photo_url      text,
  role_code      text not null references public.roles(code) on delete restrict,
  -- teacher_id / student_id FKs are added once those tables exist
  -- (see 20260714100400_students.sql).
  teacher_id     uuid,
  student_id     uuid,
  is_active      boolean not null default true,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.users is 'App-level identity, one row per Firebase user (or pre-provisioned staff/teacher awaiting first login).';

create index idx_users_role_code on public.users(role_code);
create index idx_users_email on public.users(email);

create trigger set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
