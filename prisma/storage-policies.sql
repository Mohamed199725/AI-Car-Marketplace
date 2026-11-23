-- Storage RLS policies for the `car-images` bucket.
--
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> paste -> Run).
-- It is idempotent: safe to run more than once.
--
-- Background: the app uploads with the public anon key (see lib/supabase.js), so
-- requests arrive as the `anon` role. With RLS enabled on storage.objects and no
-- policy granting INSERT, uploads fail with:
--   "new row violates row-level security policy"

-- 1. Make sure the bucket exists and is publicly readable
--    (needed so the generated image URLs resolve without a signed token).
insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do update set public = true;

-- 2. Allow uploads
drop policy if exists "car-images upload" on storage.objects;
create policy "car-images upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'car-images');

-- 3. Allow updating/replacing existing objects (upsert)
drop policy if exists "car-images update" on storage.objects;
create policy "car-images update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'car-images')
with check (bucket_id = 'car-images');

-- 4. Allow public read
drop policy if exists "car-images public read" on storage.objects;
create policy "car-images public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'car-images');

-- 5. Allow deletions (called by deleteCar in actions/cars.js)
drop policy if exists "car-images delete" on storage.objects;
create policy "car-images delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'car-images');
