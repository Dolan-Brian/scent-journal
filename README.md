# Scent Journal

A private fragrance tracking app - so I stop digging through old emails to
check whether I've already bought something.

## The Problem

Over the years I've sampled hundreds of different fragrances. When I'm
considering a purchase, I frequently have to search back through emails to
check if I've already tried or bought something similar - or the exact same
scent, months or years apart.

## What It Does

A single-user, authenticated app for logging every fragrance I've tried or
purchased:

- Name and brand
- Price paid and where I bought it
- Date tried
- My own 1-5 rating and free-form notes
- Fragrantica's average community score (entered manually)

Entries display as a card grid, with a detail view showing everything I've
logged about each one.

## Why This Was Built With Supabase and Lovable

This project was deliberately built using different tools than my other two
GitHub projects - The Pony Tracker (Python, hand-written) and Andiamo
(hand-written HTML/JS with a Netlify serverless backend) - specifically to
get hands-on experience with a different, common stack: Supabase for
authentication and the database, and Lovable as an AI-assisted app builder.

## Data Model & Security

Fragrance entries live in a Postgres database (via Supabase), with:

- **Row Level Security (RLS)** enabled on the fragrances table, so every row
  is tied to a specific `user_id` and only visible to its owner
- Four explicit policies (select, insert, update, delete) each enforcing
  `auth.uid() = user_id` at the database level - not just in application code
- The Supabase "publishable" (anon) key is used in client-side code, which
  is safe by design specifically because RLS - not secrecy of that key - is
  what actually protects the data

This was a deliberate choice over the simpler "any logged-in user can
read/write" option, even though only one account exists today, specifically
to practice the correct, future-proof pattern used by most real multi-user
applications.

## Tech Stack

- Lovable (AI-assisted React/TypeScript app builder)
- Supabase (Postgres database, authentication, Row Level Security)
- Bun (package management)

## Author

Brian Dolan - [LinkedIn](https://linkedin.com/in/DolanBrian) · [GitHub](https://github.com/dolan-brian)
