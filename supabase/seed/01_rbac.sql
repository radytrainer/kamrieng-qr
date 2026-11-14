-- Roles ---------------------------------------------------------------------
insert into public.roles (code, name, description) values
  ('super_admin',  'Super Admin',  'Full system access, including user/role management.'),
  ('school_admin', 'School Admin', 'Manages students, teachers, academics, and ID cards.'),
  ('teacher',      'Teacher',      'Views students/classes and prints ID cards.'),
  ('student',      'Student',      'Read-only access to their own profile and card.'),
  ('visitor',      'Visitor',      'No authenticated access; sees only the public QR verification page.')
on conflict (code) do nothing;

-- Permissions -----------------------------------------------------------------
-- cards.generate / cards.print cover both student and teacher ID cards.
insert into public.permissions (code, description) values
  ('students.view',   'View student records'),
  ('students.create',  'Create student records'),
  ('students.update',  'Edit student records'),
  ('students.delete',  'Delete/deactivate student records'),
  ('students.import',  'Bulk import students from Excel'),
  ('students.export',  'Bulk export students to Excel'),
  ('teachers.view',    'View teacher records'),
  ('teachers.create',  'Create teacher records'),
  ('teachers.update',  'Edit teacher records'),
  ('teachers.delete',  'Delete teacher records'),
  ('academics.manage', 'Manage departments, study programs, academic years, classes'),
  ('cards.generate',   'Generate/reissue QR codes and ID cards'),
  ('cards.print',      'Print student and teacher ID cards'),
  ('users.manage',     'Manage user accounts and role assignments')
on conflict (code) do nothing;

-- Role -> Permission mapping ---------------------------------------------------
insert into public.role_permissions (role_code, permission_code)
select 'super_admin', code from public.permissions
on conflict do nothing;

insert into public.role_permissions (role_code, permission_code)
select 'school_admin', code from public.permissions where code <> 'users.manage'
on conflict do nothing;

insert into public.role_permissions (role_code, permission_code) values
  ('teacher', 'students.view'),
  ('teacher', 'teachers.view'),
  ('teacher', 'cards.print')
on conflict do nothing;

-- Initial Super Admin ----------------------------------------------------------
-- Pre-provisioned by email; firebase_uid is backfilled on first successful
-- Firebase sign-in (see lib/rbac/session.ts in Phase 3). Add more rows here
-- (or via the /admin/settings users screen once built) for additional staff.
insert into public.users (email, display_name, role_code, is_active) values
  ('anita.sovann@gmail.com', 'System Administrator', 'super_admin', true)
on conflict (email) do nothing;
