# Add public sign-up to Top Notes

New visitors can create their own account with email and password, then land in their own empty library.

## What changes

**Login page (`src/routes/index.tsx`)**
- Add a Sign In / Sign Up toggle above the form; same email + password fields for both.
- Sign Up calls Supabase sign-up with a redirect back to the app.
- If your Supabase project has email confirmation on (the default), show a "check your email to confirm" message instead of pretending the person is logged in. If it is off, they go straight to their library.
- Friendly messages for the common cases: account already exists, password too short, wrong password.

**Empty library (`src/routes/_authenticated/library.index.tsx`)**
- A first-run welcome for brand-new accounts: heading, one line of guidance, and the Add fragrance button.
- The recommendation buttons only make sense once entries exist, so they stay hidden until the first fragrance is logged.

**Nothing else in the app needs to change.** Saving a fragrance already stamps it with the signed-in person's account id, and the login gate already sends signed-out visitors back to the login page.

I will not touch `supabase/functions/recommend-fragrance/index.ts` or `supabase/functions/recommend-plant/index.ts`.

## One thing on your side (your Supabase project, not the app)

Your database rules already scope entries by account id, so new accounts are correctly isolated the moment they sign up — no schema change needed. But two settings live in your Supabase dashboard and I cannot reach them from here:

1. **Authentication → Providers → Email**: email sign-ups must be enabled (and "Confirm email" on or off, your call — the sign-up screen handles both).
2. **Authentication → Sign-ups**: make sure new sign-ups are not disabled.

Also worth knowing: the existing rules let anyone who signs up create their own private entries. Nobody can see yours, and you cannot see theirs. If you would rather approve people before they get in, tell me and I will add a waiting state instead.

## Verification

Build check, then a browser pass over the login page: toggle to Sign Up, submit, and confirm the correct message appears.
