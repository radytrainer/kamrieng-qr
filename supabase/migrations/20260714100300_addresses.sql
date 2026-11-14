-- ==========================================================================
-- addresses: Cambodian administrative division reference data
-- (province -> district -> commune -> village), self-referencing hierarchy.
--
-- This is reference/lookup data used to power cascading dropdowns and keep
-- province/district/commune/village spelling consistent. The student's own
-- home address is still stored as plain text columns on `students`
-- (see 20260714100400_students.sql) for fast, join-free profile/card reads —
-- the app layer validates those text values against this table when the
-- user picks them from a cascading select.
-- ==========================================================================

create table public.addresses (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid references public.addresses(id) on delete cascade,
  level      text not null check (level in ('province', 'district', 'commune', 'village')),
  code       text unique,
  name_en    text not null,
  name_km    text,
  created_at timestamptz not null default now()
);

create index idx_addresses_parent_id on public.addresses(parent_id);
create index idx_addresses_level on public.addresses(level);
