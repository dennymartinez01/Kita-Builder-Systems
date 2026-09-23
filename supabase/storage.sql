-- ============================================================
-- KITA BUILDER SYSTEMS - Supabase Storage Setup
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- Run AFTER schema.sql
-- ============================================================

-- Create the public storage bucket for brand assets
insert into storage.buckets (id, name, public)
values ('kita-assets', 'kita-assets', true)
on conflict (id) do nothing;

-- Allow public read on all files in this bucket
create policy "Public read kita-assets"
  on storage.objects for select
  using (bucket_id = 'kita-assets');

-- Allow authenticated + anon upload (MVP — lock down in v2)
create policy "Allow upload kita-assets"
  on storage.objects for insert
  with check (bucket_id = 'kita-assets');

-- Allow delete (for logo replacement)
create policy "Allow delete kita-assets"
  on storage.objects for delete
  using (bucket_id = 'kita-assets');
