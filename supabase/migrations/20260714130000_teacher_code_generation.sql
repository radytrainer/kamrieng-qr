create sequence public.teacher_code_seq start with 1;

create or replace function public.generate_teacher_code()
returns text
language sql
as $$
  select 'TCH-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.teacher_code_seq')::text, 4, '0');
$$;

alter table public.teachers
  alter column teacher_code set default public.generate_teacher_code();
