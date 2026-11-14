-- ==========================================================================
-- activity_logs: append-only audit trail. No update/delete policies are
-- ever granted (see RLS migration) — audit logs are immutable by design.
-- ==========================================================================

create table public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  action      text not null,        -- e.g. 'student.created', 'qr.scanned', 'card.printed'
  entity_type text not null,        -- e.g. 'student', 'teacher', 'attendance'
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);
