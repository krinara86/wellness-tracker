# 🌿 Inner Peace Tracker

A private daily wellness tracker. The repo is **public** — but all user data is protected by login. Passwords are hashed (SHA-256 + salt) before storage. Each user's entries live in their own file. The GitHub API token is injected at build time via secrets and never committed to the repo.

---

## Architecture (why it's safe to make public)

| What | Where | Visible publicly? |
|------|-------|-------------------|
| App source code | This repo | Yes — it's just React |
| GitHub API token | GitHub Actions secret | No — injected at build time only |
| Passwords | data/users.json | SHA-256 hashed — plain text never stored |
| Your entries | data/entries-USERNAME.json | Per-user files, only accessible when logged in |

> **Note:** The compiled JS bundle contains the GitHub token (required for browser API calls). It is scoped **only to Contents: Read+Write on this one repo** — worst case someone extracts it and edits your data files, not your GitHub account. For a personal wellness tracker this is a reasonable tradeoff.

---

## Setup (~15 minutes)

### Step 1 — Create this repo on GitHub

1. Go to github.com/new
2. Name it `wellness-tracker`, set to Public
3. Push these files:

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/wellness-tracker.git
git add .
git commit -m "Initial setup"
git branch -M main
git push -u origin main
```

### Step 2 — Create a Personal Access Token

1. Go to: github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Name: wellness-tracker-data, Expiry: 1 year
4. Repository access: Only select repositories → choose wellness-tracker
5. Permissions → Contents: Read and Write
6. Generate and copy the token immediately

### Step 3 — Add three GitHub Actions secrets

Repo → Settings → Secrets and variables → Actions → New repository secret

Add all three:

  VITE_GITHUB_TOKEN  →  the token you just created
  VITE_GITHUB_OWNER  →  your GitHub username
  VITE_GITHUB_REPO   →  wellness-tracker

### Step 4 — Enable GitHub Pages

1. Repo → Settings → Pages
2. Source: GitHub Actions
3. Go to Actions tab, run "Deploy to GitHub Pages" manually
4. App is live at: https://YOUR_USERNAME.github.io/wellness-tracker/

### Step 5 — Create your account

Open the live URL, click "Create account", choose username + password. Done.

---

## Add to phone home screen

iPhone (Safari): Share button → Add to Home Screen
Android (Chrome): Three-dot menu → Add to Home Screen

---

## Data files

data/users.json              — usernames + hashed passwords
data/entries-alice.json      — Alice's entries  
data/entries-rohan.json      — Rohan's entries

All plain JSON — readable and downloadable any time.

---

## If your repo has a different name

Edit vite.config.js:  base: '/YOUR_REPO_NAME/'
Update the VITE_GITHUB_REPO secret to match.
Push any change to trigger a redeploy.
