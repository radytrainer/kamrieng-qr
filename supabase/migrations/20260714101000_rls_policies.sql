-- ==========================================================================
-- Row Level Security: enable on every table, deny by default, then grant
-- narrow policies per role. The `anon` role gets NO policies anywhere on
-- purpose — public QR verification is served exclusively by the
-- /api/verify/[token] route handler using the service-role client, which
-- manually strips PII before returning JSON (Phase 7). That is deliberately
-- safer than an anon SELECT policy would be: it requires knowing the exact
-- unguessable token, rather than allowing arbitrary row scanning.
-- ==========================================================================

-- ---------------------------------------------------------------- users --
alter table public.users enable row level security;

create policy "Staff can read all users"
  on public.users for select
  using (public.is_staff());

create policy "Users can read own row"
  on public.users for select
  using (firebase_uid = public.current_firebase_uid());

create policy "Admins can insert users"
  on public.users for insert
  with check (public.is_admin());

create policy "Admins can update users"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Super admins can delete users"
  on public.users for delete
  using (public.is_super_admin());

-- ------------------------------------------------------- roles & perms --
alter table public.roles enable row level security;
create policy "Staff can read roles" on public.roles for select using (public.is_staff());
create policy "Super admin manages roles" on public.roles for all
  using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.permissions enable row level security;
create policy "Staff can read permissions" on public.permissions for select using (public.is_staff());
create policy "Super admin manages permissions" on public.permissions for all
  using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.role_permissions enable row level security;
create policy "Staff can read role_permissions" on public.role_permissions for select using (public.is_staff());
create policy "Super admin manages role_permissions" on public.role_permissions for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ------------------------------------------------------------ academics --
alter table public.departments enable row level security;
create policy "Staff can read departments" on public.departments for select using (public.is_staff());
create policy "Admins insert departments" on public.departments for insert with check (public.is_admin());
create policy "Admins update departments" on public.departments for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete departments" on public.departments for delete using (public.is_admin());

alter table public.study_programs enable row level security;
create policy "Staff can read study_programs" on public.study_programs for select using (public.is_staff());
create policy "Admins insert study_programs" on public.study_programs for insert with check (public.is_admin());
create policy "Admins update study_programs" on public.study_programs for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete study_programs" on public.study_programs for delete using (public.is_admin());

alter table public.academic_years enable row level security;
create policy "Staff can read academic_years" on public.academic_years for select using (public.is_staff());
create policy "Admins insert academic_years" on public.academic_years for insert with check (public.is_admin());
create policy "Admins update academic_years" on public.academic_years for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete academic_years" on public.academic_years for delete using (public.is_admin());

alter table public.classes enable row level security;
create policy "Staff can read classes" on public.classes for select using (public.is_staff());
create policy "Admins insert classes" on public.classes for insert with check (public.is_admin());
create policy "Admins update classes" on public.classes for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete classes" on public.classes for delete using (public.is_admin());

alter table public.addresses enable row level security;
create policy "Staff can read addresses" on public.addresses for select using (public.is_staff());
create policy "Admins manage addresses" on public.addresses for all using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------------- people --
alter table public.teachers enable row level security;
create policy "Staff can read teachers" on public.teachers for select using (public.is_staff());
create policy "Admins insert teachers" on public.teachers for insert with check (public.is_admin());
create policy "Admins update teachers" on public.teachers for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete teachers" on public.teachers for delete using (public.is_admin());

alter table public.student_status enable row level security;
create policy "Staff can read student_status" on public.student_status for select using (public.is_staff());
create policy "Super admin manages student_status" on public.student_status for all
  using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.students enable row level security;

create policy "Staff can read all students"
  on public.students for select
  using (public.is_staff());

create policy "Students can read own record"
  on public.students for select
  using (id = (select student_id from public.users where firebase_uid = public.current_firebase_uid()));

create policy "Admins insert students" on public.students for insert with check (public.is_admin());
create policy "Admins update students" on public.students for update using (public.is_admin()) with check (public.is_admin());
create policy "Super admin deletes students" on public.students for delete using (public.is_super_admin());

alter table public.parents enable row level security;
create policy "Staff can read parents" on public.parents for select using (public.is_staff());
create policy "Admins manage parents" on public.parents for all using (public.is_admin()) with check (public.is_admin());

alter table public.student_parents enable row level security;
create policy "Staff can read student_parents" on public.student_parents for select using (public.is_staff());
create policy "Admins manage student_parents" on public.student_parents for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------ IDs --
alter table public.student_cards enable row level security;
create policy "Staff can read student_cards" on public.student_cards for select using (public.is_staff());
create policy "Students can read own cards"
  on public.student_cards for select
  using (student_id = (select student_id from public.users where firebase_uid = public.current_firebase_uid()));
create policy "Admins manage student_cards" on public.student_cards for all using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------------- attend --
alter table public.attendance enable row level security;

create policy "Staff can read attendance"
  on public.attendance for select
  using (public.is_staff());

create policy "Students can read own attendance"
  on public.attendance for select
  using (student_id = (select student_id from public.users where firebase_uid = public.current_firebase_uid()));

create policy "Staff can record attendance"
  on public.attendance for insert
  with check (public.is_staff());

create policy "Admins update attendance" on public.attendance for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete attendance" on public.attendance for delete using (public.is_admin());

-- --------------------------------------------------------- activity log --
alter table public.activity_logs enable row level security;

create policy "Admins can read activity logs"
  on public.activity_logs for select
  using (public.is_admin());

create policy "Staff can insert activity logs"
  on public.activity_logs for insert
  with check (public.is_staff());

-- Deliberately no update/delete policy anywhere: the audit trail is immutable.
