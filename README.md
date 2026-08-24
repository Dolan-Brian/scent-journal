# Scent Journal

I want to build a personal fragrance tracking app called "Scent Log" (working title - open to better name suggestions).

WHAT IT DOES:

A private, single-user app for tracking fragrances I've tried or purchased over the years - so I stop having to dig through old emails to check if I've bought something before.

CORE FEATURES FOR V1:

1. A simple login (email/password) so only I can access my data

2. A form to add a new fragrance entry with these fields:

   - Name (text, required)

   - Brand (text, required)

   - Price paid (number, optional)

   - Where purchased (text, optional)

   - Date tried (date, optional)

   - My rating (number 1-5, optional)

   - My notes/thoughts (long text, optional)

   - Fragrantica average score (number, optional - entered manually by me)

   

3. A list/grid view of all my logged fragrances, showing name, brand, and my rating at a glance

4. Clicking a fragrance opens a detail view showing all its fields

5. Ability to edit or delete an existing entry

DATABASE:

I already have a Supabase project set up with a table called "fragrances" containing these exact columns: name, brand, price_paid, where_purchased, date_sampled, my_rating, notes, fragrantica_rating, plus the default id and created_at columns. Please connect to my existing Supabase project rather than creating a new database structure - I will provide the connection details.

DESIGN:

Clean and simple. This is a personal tool, not a public product, so prioritize function over heavy styling. A card-based grid layout for the fragrance list would be nice, but keep it straightforward.

WHAT I DON'T NEED YET:

No social features, no sharing, no multi-user support, no image uploads yet. Just a solid, working single-user tracker first.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/308394d5-860a-4ba7-9dd1-fe1427eacead).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
