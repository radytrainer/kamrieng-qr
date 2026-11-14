-- ==========================================================================
-- Supabase Storage: student-photos bucket
--
-- Public READ (student photos are shown on the public QR verification page,
-- unauthenticated) but WRITE is staff-only. Storage buckets/policies live in
-- the same Postgres database (storage.buckets / storage.objects), so this
-- is a normal migration.
-- ==========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-photos',
  'student-photos',
  true,
  2 * 1024 * 1024, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Public can view student photos"
  on storage.objects for select
  using (bucket_id = 'student-photos');

create policy "Staff can upload student photos"
  on storage.objects for insert
  with check (bucket_id = 'student-photos' and public.is_staff());

create policy "Staff can update student photos"
  on storage.objects for update
  using (bucket_id = 'student-photos' and public.is_staff())
  with check (bucket_id = 'student-photos' and public.is_staff());

create policy "Staff can delete student photos"
  on storage.objects for delete
  using (bucket_id = 'student-photos' and public.is_staff());
