# 🌿 Inner Peace Tracker

Daily wellness tracker for anxiety management and pre-therapy practice.
Built with React + Vite, hosted on GitHub Pages, data stored in Supabase.

## Setup

1. Push this repo to GitHub
2. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
3. Push any change to trigger the first deploy
4. Visit https://YOUR_USERNAME.github.io/wellness-tracker/

No secrets or tokens required. Auth and data are handled by Supabase.

## Supabase

Required SQL (run once in Supabase SQL editor):

    ALTER TABLE entries ADD CONSTRAINT entries_user_date UNIQUE (user_id, date);

RLS policy (if not already set):

    ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users see own entries" ON entries FOR ALL USING (auth.uid() = user_id);
