# Scent Journal

A fragrance tracking app - so I stop digging through old emails to check
whether I've already bought something.

Live at: https://scent-keeper-private.lovable.app

## The Problem

Over the years I've sampled hundreds of different fragrances. When I'm
considering a purchase, I frequently have to search back through emails to
check if I've already tried or bought something similar - or the exact
same scent, months or years apart.

## What It Does

An authenticated app for logging every fragrance I've tried or purchased:

- Name, brand, and perfumer
- Price paid and where I bought it
- Date tried
- My own 1-5 rating (decimal-friendly) and free-form notes
- Fragrantica's average community score (entered manually)

Entries display as a card grid, with a detail view showing everything I've
logged about each one. Two AI-powered features, built on top of that data:

- **Recommend a New Fragrance** - reads my highly-rated entries and their
  notes, identifies real patterns (recurring notes, accords, perfumers),
  and suggests three new fragrances with specific reasoning grounded in
  what I've actually logged, not generic suggestions.
- **Recommend a New Plant** - a deliberately playful feature: the same
  fragrance data, reinterpreted by an agent with an unusual specialty
  (matching scent profiles to houseplants), delivered with complete
  deadpan seriousness.

Anyone can now sign up and keep their own private fragrance log - accounts
are fully isolated from each other (see Data Model & Security below).

## Data Model & Security

Fragrance entries live in a Postgres database (via Supabase), with:

- Row Level Security (RLS) enabled on the fragrances table, so every row
  is tied to a specific `user_id` and only visible to its owner
- Four explicit policies (select, insert, update, delete) each enforcing
  `auth.uid() = user_id` at the database level - not just in application
  code
- The Supabase "publishable" (anon) key is used in client-side code, which
  is safe by design specifically because RLS - not secrecy of that key -
  is what actually protects the data
- Public sign-up is enabled; new accounts are automatically and correctly
  isolated from existing ones by the same RLS policies, with no additional
  schema changes required

This was a deliberate choice over the simpler "any logged-in user can
read/write" option, specifically to practice the correct, future-proof
pattern used by most real multi-user applications - and it paid off
directly once the app moved from a single account to open sign-up.

Each AI recommendation feature runs as its own Supabase Edge Function,
querying only the logged-in user's own data (never another user's, and
never the account's email or internal ID) before sending it to Claude.

## Working With an AI App Builder: What I Learned

Building this with Lovable, an AI-assisted app builder, surfaced a few
specific, recurring patterns worth documenting honestly:

**A fix can get silently reverted, more than once, even with explicit
instructions not to touch a file.** After correctly diagnosing a real
authentication bug (the Supabase Edge Function needed `auth: "user"` to
verify the caller's identity, not `auth: ["publishable"]`, which only
checks for a valid API key), the fix was silently undone twice by
Lovable's own automatic activity elsewhere in the project - confirmed by
direct inspection of the file, not assumption. The practical fix was
giving explicit, standing, per-file instructions, and independently
verifying the file's actual contents after any unrelated change, rather
than trusting a summary of what changed.

**Default settings are a real design choice, not a neutral starting
point.** An "Enable Cloud" default silently provisioned a separate, empty
managed backend instead of connecting to the existing Supabase project -
caught while debugging a recurring connection issue, not before it
happened. Worth reviewing a new tool's defaults deliberately, going
forward, rather than assuming they're safe.

**A "convenience" integration can request far more access than it needs.**
Attempting to solve a recurring `.env.local` connection issue, Lovable's
suggested "Connectors" path led to an OAuth screen requesting organization-
wide, read-write access to Secrets, Edge Functions, and every project in
the Supabase account - not scoped to this one project. Declined, and
independently verified as declined directly in Supabase's own "Authorized
Apps" list, rather than trusting either tool's account of what happened.

**A published build and a preview environment are not the same
environment.** The live, published site initially failed to connect to
Supabase at all, because the credentials the preview relied on
(`.env.local`) don't carry over to a separate, published deployment - a
distinction that isn't obvious until it causes a real, live failure.

None of these individually broke the app - the recurring theme is that
convenience and autonomy in a tool like this trade away exactly the manual
checkpoints (review before committing, verify before trusting) that good
engineering practice depends on. That's a genuine, informed preference
now, not just an assumption: I'd choose a hand-coded, every-line-reviewed
approach for anything security- or correctness-sensitive, and reserve a
tool like Lovable for lower-stakes, faster front-end iteration
specifically.

## Tech Stack

- Lovable (AI-assisted React/TypeScript app builder)
- Supabase (Postgres database, authentication, Row Level Security, Edge
  Functions)
- Anthropic API (both recommendation features)
- Bun (package management)

## Author

Brian Dolan - [LinkedIn](https://linkedin.com/in/DolanBrian) · [GitHub](https://github.com/dolan-brian)
