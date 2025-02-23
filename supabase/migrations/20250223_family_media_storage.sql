-- Create family media storage bucket
insert into storage.buckets (id, name, public)
values ('family-media', 'Family Media Storage', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies for media access
create policy "Authenticated users can view media"
on storage.objects for select
using (
  bucket_id = 'family-media'
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can upload media"
on storage.objects for insert
with check (
  bucket_id = 'family-media'
  and auth.role() = 'authenticated'
);

-- Create table for media metadata
create table if not exists public.media_items (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  media_type text not null check (media_type in ('video', 'audio')),
  storage_path text not null,
  duration integer,
  transcription text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS on media_items
alter table public.media_items enable row level security;

-- Create policies for media_items
create policy "Authenticated users can view media items"
on public.media_items for select
using (auth.role() = 'authenticated');

create policy "Users can insert their own media items"
on public.media_items for insert
with check (auth.uid() = created_by);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.media_items
  for each row
  execute function public.handle_updated_at();
