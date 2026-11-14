-- ==========================================================================
-- student_cards: printable ID card issuance history
-- ==========================================================================

create table public.student_cards (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  card_number      text not null unique, -- printed serial, distinct from student_code
  issue_date       date not null default current_date,
  expiry_date      date not null,
  status           text not null default 'active' check (status in ('active', 'expired', 'revoked', 'reissued')),
  template_version text not null default 'v1',
  printed_at       timestamptz,
  printed_by       uuid references public.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint student_cards_date_order check (expiry_date > issue_date)
);

create index idx_student_cards_student_id on public.student_cards(student_id);
create index idx_student_cards_status on public.student_cards(status);

-- Only one active card per student at a time.
create unique index idx_student_cards_one_active
  on public.student_cards(student_id) where status = 'active';

create trigger set_updated_at
  before update on public.student_cards
  for each row execute function public.set_updated_at();
