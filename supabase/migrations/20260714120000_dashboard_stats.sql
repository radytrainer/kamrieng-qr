-- ==========================================================================
-- Dashboard chart aggregation, computed in SQL so it scales regardless of
-- student count (avoids PostgREST's default row-limit on a raw SELECT).
-- ==========================================================================

create or replace function public.get_dashboard_charts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'enrollmentByYear', (
      select coalesce(jsonb_agg(jsonb_build_object('label', coalesce(ay.name, 'Unassigned'), 'value', c.cnt) order by ay.start_date), '[]'::jsonb)
      from (
        select academic_year_id, count(*) as cnt
        from public.students
        group by academic_year_id
      ) c
      left join public.academic_years ay on ay.id = c.academic_year_id
    ),
    'studentsByGrade', (
      select coalesce(jsonb_agg(jsonb_build_object('label', 'Year ' || coalesce(study_year::text, '?'), 'value', cnt) order by study_year), '[]'::jsonb)
      from (
        select study_year, count(*) as cnt
        from public.students
        group by study_year
      ) g
    ),
    'genderDistribution', (
      select coalesce(jsonb_agg(jsonb_build_object('label', initcap(gender), 'value', cnt)), '[]'::jsonb)
      from (
        select gender, count(*) as cnt
        from public.students
        group by gender
      ) gd
    ),
    'provinceDistribution', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', cnt) order by cnt desc), '[]'::jsonb)
      from (
        select coalesce(province, 'Unknown') as label, count(*) as cnt
        from public.students
        group by coalesce(province, 'Unknown')
        order by count(*) desc
        limit 10
      ) pd
    )
  );
$$;
