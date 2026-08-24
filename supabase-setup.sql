-- Scent Log — run this once in your Supabase SQL editor.
-- It adds row ownership + access rules to your existing public."Fragrances" table.
-- Your existing rows are preserved (step 3 assigns them to your account).

-- 1. Ownership column
alter table public."Fragrances"
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. Data API privileges (signed-in users only; anon gets nothing)
grant select, insert, update, delete on public."Fragrances" to authenticated;
grant all on public."Fragrances" to service_role;

-- 3. Claim existing rows. Replace the email with your own login email.
update public."Fragrances"
set user_id = (select id from auth.users where email = 'you@example.com')
where user_id is null;

-- 4. Row Level Security: each row readable/writable only by its owner
alter table public."Fragrances" enable row level security;

drop policy if exists "Owner can read own fragrances" on public."Fragrances";
create policy "Owner can read own fragrances"
  on public."Fragrances" for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Owner can insert own fragrances" on public."Fragrances";
create policy "Owner can insert own fragrances"
  on public."Fragrances" for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Owner can update own fragrances" on public."Fragrances";
create policy "Owner can update own fragrances"
  on public."Fragrances" for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Owner can delete own fragrances" on public."Fragrances";
create policy "Owner can delete own fragrances"
  on public."Fragrances" for delete to authenticated
  using (auth.uid() = user_id);

-- 5. Sanity check: confirm the column names the app expects
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'Fragrances'
order by ordinal_position;
