-- ==========================================================================
-- Extensions + shared helper functions
-- ==========================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- fuzzy/trigram name search

-- Keeps `updated_at` current on every UPDATE. Attached per-table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: sets updated_at = now() on UPDATE. Attach to any table with an updated_at column.';
