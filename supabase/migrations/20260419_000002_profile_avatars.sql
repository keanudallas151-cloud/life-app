-- v0.6.7 — Profile avatars bucket + author_avatar_url columns

-- Storage bucket for main account profile photos (separate from inventors-investors-media)
insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "profile_avatars_public_read" on storage.objects;
create policy "profile_avatars_public_read"
on storage.objects for select
to authenticated
using (bucket_id = 'profile-avatars');

drop policy if exists "profile_avatars_upload_own" on storage.objects;
create policy "profile_avatars_upload_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "profile_avatars_update_own" on storage.objects;
create policy "profile_avatars_update_own"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "profile_avatars_delete_own" on storage.objects;
create policy "profile_avatars_delete_own"
on storage.objects for delete
to authenticated
using (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Add author_avatar_url to posts table (stores snapshot of uploader avatar at post time)
alter table public.posts
  add column if not exists author_avatar_url text not null default '';

-- Add author_avatar_url to comments table
alter table public.comments
  add column if not exists author_avatar_url text not null default '';
