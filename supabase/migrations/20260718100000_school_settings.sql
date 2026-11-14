-- ==========================================================================
-- School settings: a singleton row for admin-editable text used on printed
-- official cards. Starts with the Buddhist/Gregorian issue-date lines
-- (previously hardcoded in lib/constants/official-card.ts) — the Khmer
-- lunar calendar can't be computed automatically and must be updated by
-- hand each print batch, so this gives super admins a settings-page form
-- instead of requiring a code change.
-- ==========================================================================

create table public.school_settings (
  id boolean primary key default true,
  card_issue_buddhist_line text not null,
  card_issue_gregorian_line text not null,
  updated_at timestamptz not null default now(),
  constraint school_settings_singleton check (id)
);

comment on table public.school_settings is
  'Singleton row (id always true) of admin-editable school-wide text shown on printed cards.';

insert into public.school_settings (id, card_issue_buddhist_line, card_issue_gregorian_line)
values (true, 'ថ្ងៃសៅរ៍ ១១កើត ខែកត្តិក ឆ្នាំម្សាញ់ ព.ស ២៥៦៩', 'វិ.កំរៀង, ថ្ងៃទី ១ ខែវិច្ឆិកា ឆ្នាំ២០២៥');

alter table public.school_settings enable row level security;

create policy "Staff can read school_settings" on public.school_settings for select using (public.is_staff());
create policy "Super admins manage school_settings" on public.school_settings for all
  using (public.is_super_admin()) with check (public.is_super_admin());
