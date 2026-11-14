-- Departments (faculties) ------------------------------------------------------
insert into public.departments (code, name_en, name_km, description) values
  ('SCI', 'Science',        'វិទ្យាសាស្ត្រ',   'Science track: Math, Physics, Chemistry, Biology'),
  ('SOC', 'Social Science',  'សង្គមវិទ្យា',     'Social science track: History, Geography, Civics'),
  ('IT',  'Information Technology', 'បច្ចេកវិទ្យាព័ត៌មាន', 'Computer science and digital skills track')
on conflict (code) do nothing;

-- Study programs (major/degree track within a department) ---------------------
insert into public.study_programs (department_id, code, name_en, name_km, degree, credits_required, duration_years)
select d.id, v.code, v.name_en, v.name_km, v.degree, v.credits_required, v.duration_years
from (values
  ('SCI-GEN', 'General Science',     'វិទ្យាសាស្ត្រទូទៅ', 'high_school', 24, 3.0, 'SCI'),
  ('SOC-GEN', 'General Social Science', 'សង្គមវិទ្យាទូទៅ', 'high_school', 24, 3.0, 'SOC'),
  ('IT-GEN',  'Applied IT',          'បច្ចេកវិទ្យាអនុវត្ត', 'high_school', 24, 3.0, 'IT')
) as v(code, name_en, name_km, degree, credits_required, duration_years, dept_code)
join public.departments d on d.code = v.dept_code
on conflict (code) do nothing;

-- Academic year -----------------------------------------------------------------
insert into public.academic_years (name, start_date, end_date, is_current) values
  ('2025-2026', '2025-11-01', '2026-08-31', true)
on conflict (name) do nothing;

-- Teachers ------------------------------------------------------------------------
insert into public.teachers (
  teacher_code, khmer_first_name, khmer_last_name, english_first_name, english_last_name,
  gender, email, department_id, position, hire_date
)
select v.teacher_code, v.khmer_first_name, v.khmer_last_name, v.english_first_name, v.english_last_name,
       v.gender, v.email, d.id, v.position, v.hire_date::date
from (values
  ('TCH-0001', 'សុខា', 'លី', 'Sokha', 'Ly', 'female', 'sokha.ly@example-school.edu.kh', 'Math / Science', '2022-09-01', 'SCI'),
  ('TCH-0002', 'ដារា', 'ជា', 'Dara', 'Chea', 'male',   'dara.chea@example-school.edu.kh', 'History / Civics', '2021-09-01', 'SOC'),
  ('TCH-0003', 'វិចិត្រា', 'ហេង', 'Vichetra', 'Heng', 'female', 'vichetra.heng@example-school.edu.kh', 'Computer Science', '2023-09-01', 'IT')
) as v(teacher_code, khmer_first_name, khmer_last_name, english_first_name, english_last_name, gender, email, position, hire_date, dept_code)
join public.departments d on d.code = v.dept_code
on conflict (teacher_code) do nothing;

-- Classes -----------------------------------------------------------------------
insert into public.classes (academic_year_id, department_id, study_program_id, homeroom_teacher_id, name, grade_level, capacity)
select ay.id, d.id, sp.id, t.id, v.name, v.grade_level, v.capacity
from (values
  ('Grade 10A', 10, 40, 'SCI', 'SCI-GEN', 'TCH-0001'),
  ('Grade 11B', 11, 40, 'SOC', 'SOC-GEN', 'TCH-0002'),
  ('Grade 12C', 12, 35, 'IT',  'IT-GEN',  'TCH-0003')
) as v(name, grade_level, capacity, dept_code, program_code, teacher_code)
join public.departments d on d.code = v.dept_code
join public.study_programs sp on sp.code = v.program_code
join public.teachers t on t.teacher_code = v.teacher_code
cross join (select id from public.academic_years where is_current limit 1) ay
on conflict (academic_year_id, name) do nothing;
