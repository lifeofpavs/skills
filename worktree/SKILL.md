---
name: worktree
description: >
  Creates an isolated git worktree branched off the freshly-fetched default branch and symlinks
  the repo's root .env into it. Use this whenever the user asks to start work in a new worktree,
  to "spin up / set up / create a worktree", to begin a ticket or feature in isolation, or to
  branch off main/master without disturbing the current checkout. Trigger even when the user just
  says "new worktree for <ticket>" or "give me a clean branch off main for this" — the skill picks
  the location (~/worktrees/<repo>/<branch>), fetches the default branch, and wires up .env so the
  new workspace has the same environment immediately.
---

# Worktree

Spin up an isolated git worktree off the up-to-date default branch, with the repo's root `.env`
symlinked in. The point is to start fresh work in seconds without touching the current checkout —
the new branch is based on `origin/<default>` directly, so nothing in the user's working tree is
stashed, switched, or disturbed.

**Announce at start:** "I'm using the worktree skill to set up an isolated workspace."

## Step 1 — Decide the branch name

This is your job before running the script, because it needs context the script can't read.

- **Ticket reference:** Scan the recent conversation for a ticket like `ENG-123`, `PROJ-45`
  (pattern `[A-Z]{2,}-\d+`). If you find one, build a branch from it: the lowercased ticket plus a
  short kebab-case slug of what the work is, e.g. `eng-123-fix-login-redirect`. The ticket prefix
  alone (`eng-123`) is fine if no description is evident.
- **No ticket, but clear task:** Use a short kebab-case slug of the described work, e.g.
  `add-rate-limiting`.
- **Nothing derivable:** Pass no argument — the script auto-generates `wt-<timestamp>`.

Keep names short and lowercase. Avoid spaces; the script flattens any `/` in the directory name.

## Step 2 — Run the script

```bash
bash <skill-dir>/scripts/create-worktree.sh "<branch-name>"
```

Omit the argument to let the script auto-generate the name. The script handles everything
mechanical: it finds the repo root, detects the default branch (`origin/HEAD`, falling back to
`main` then `master`), fetches it, creates the worktree at `~/worktrees/<repo>/<branch>`, and
symlinks the root `.env` if one exists. It refuses to clobber an existing branch or path, and a
missing root `.env` is a notice, not an error.

## Step 3 — Report back

Relay the script's result to the user: the new branch, the worktree path, the `.env` status, and
the `cd <path>` line so they can jump straight in. If they asked to start working there, `cd` into
the worktree path and continue.
