-- Create Drafts Table
create table if not exists public.drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'Untitled Draft',
  current_content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Snapshots Table
create table if not exists public.draft_snapshots (
  id uuid default gen_random_uuid() primary key,
  draft_id uuid references public.drafts(id) on delete cascade not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  content_diff text, -- Can be null for lightweight snapshots
  char_count_delta integer default 0,
  paste_event_detected boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.drafts enable row level security;
alter table public.draft_snapshots enable row level security;

-- Policies for Drafts
create policy "Users can view their own drafts"
  on public.drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own drafts"
  on public.drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own drafts"
  on public.drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own drafts"
  on public.drafts for delete
  using (auth.uid() = user_id);

-- Policies for Snapshots
-- Snapshots are viewable if the user owns the parent draft
create policy "Users can view snapshots of their drafts"
  on public.draft_snapshots for select
  using (
    exists (
      select 1 from public.drafts
      where drafts.id = draft_snapshots.draft_id
      and drafts.user_id = auth.uid()
    )
  );

create policy "Users can insert snapshots for their drafts"
  on public.draft_snapshots for insert
  with check (
    exists (
      select 1 from public.drafts
      where drafts.id = draft_snapshots.draft_id
      and drafts.user_id = auth.uid()
    )
  );

-- Function to update last_updated timestamp on drafts
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_drafts_updated_at
  before update on public.drafts
  for each row
  execute procedure public.handle_updated_at();
