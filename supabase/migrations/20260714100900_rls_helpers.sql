-- ==========================================================================
-- RLS helper functions
--
-- Auth is Firebase, not Supabase Auth. For `auth.jwt()` to be populated,
-- the Supabase project must have Firebase registered as a Third-Party Auth
-- provider (Dashboard -> Authentication -> Sign In / Providers -> Third
-- Party Auth -> Firebase, using NEXT_PUBLIC_FIREBASE_PROJECT_ID), and the
-- browser Supabase client must forward the Firebase ID token as its bearer
-- token (see lib/supabase/client.ts `accessToken` option, wired in Phase 3).
--
-- These policies are defense-in-depth. The PRIMARY authorization boundary
-- for this app is server-side: Server Actions/Route Handlers verify the
-- Firebase ID token via the Admin SDK and check `users.role_code` before
-- ever touching the database (see lib/rbac/*, Phase 3). If Third-Party
-- Auth is never configured, auth.jwt() simply returns null and every
-- policy below evaluates to false — i.e. direct client-side Supabase
-- queries fail closed, and the app keeps working because it goes through
-- the server-side admin client instead.
-- ==========================================================================

create or replace function public.current_firebase_uid()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'sub';
$$;

-- security definer: looks up the caller's role without requiring a
-- separate RLS policy granting them read access to arbitrary rows in
-- `users` (avoids recursive policy evaluation on the users table itself).
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role_code
  from public.users
  where firebase_uid = auth.jwt() ->> 'sub'
    and is_active;
$$;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where firebase_uid = auth.jwt() ->> 'sub'
    and is_active;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('super_admin', 'school_admin', 'teacher');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('super_admin', 'school_admin');
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() = 'super_admin';
$$;
