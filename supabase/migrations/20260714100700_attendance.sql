-- ==========================================================================
-- attendance: recorded when a teacher scans a student's QR code
-- ==========================================================================

create table public.attendance (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.students(id) on delete cascade,
  class_id          uuid references public.classes(id) on delete set null,
  teacher_id        uuid references public.teachers(id) on delete set null,
  academic_year_id  uuid references public.academic_years(id) on delete set null,
  attendance_date   date not null default current_date,
  check_in_time     timestamptz not null default now(),
  status            text not null default 'present' check (status in ('present', 'late', 'absent', 'excused')),
  method            text not null default 'qr_scan' check (method in ('qr_scan', 'manual')),
  device_info       text,
  latitude          numeric(9,6),
  longitude         numeric(9,6),
  notes             text,
  created_at        timestamptz not null default now(),
  unique (student_id, class_id, attendance_date)
);

create index idx_attendance_student_id on public.attendance(student_id);
create index idx_attendance_class_id on public.attendance(class_id);
create index idx_attendance_teacher_id on public.attendance(teacher_id);
create index idx_attendance_date on public.attendance(attendance_date desc);

-- Prevent duplicate same-day check-ins when no specific class context is given
-- (e.g. a single gate scan rather than per-period attendance).
create unique index idx_attendance_daily_no_class
  on public.attendance(student_id, attendance_date) where class_id is null;
