---
name: publish-artifact
description: >
  Upload files an agent created (reports, walkthroughs, HTML artifacts,
  decks, exports, screenshots, CSV/JSON dumps) to pavs's personal Google
  Drive and return an anyone-with-the-link share URL. Use whenever the user
  says "publish", "upload", "push to my Drive", "give me a link for", "share
  this artifact", "put it on my Drive", "make it shareable", or asks to send
  a generated file to someone later — even when they don't name Drive
  explicitly. Also use to get a stable share URL for anything generated
  locally that the user will want to hand out afterward.
---

# Publish Artifact

Upload agent-produced files to pavs's personal Google Drive and print a shareable link.

## When to use

Use this skill when the user wants a file produced during the session to end up on their Drive so it can be shared later:

- "publish this report"
- "upload this to my Drive"
- "give me a shareable link for this"
- "push this artifact somewhere I can send it"

The agent should run the script once the artifact exists locally. Do not ask permission per file beyond what the user already requested — publishing is the requested action.

## How it works

1. Resolve each file (explicit paths only — no globs, no directories).
2. Reject anything that is not a regular file or looks sensitive (see below).
3. Upload each file to `pavs-drive:Agent Artifacts/<YYYY-MM-DD>/` with `rclone copyto`.
4. Create an anyone-with-the-link URL for each uploaded file with `rclone link`.
5. Print the Drive path and one share link per file.

The date is today's local date, so every day gets a fresh folder. The folder stays private — only the individual files get share links, so your Drive never exposes the whole collection to a single link.

## Safety rules

The script refuses to publish and exits with an error when a path is:

- a directory or a symbolic link (no accidental traversal)
- a `.env`, `.pem`, `.key`, `.p12`, `.pfx`, `.keystore`, `.crt`, `.p7b`, or `.asc` file
- a file named `id_rsa`, `id_ed25519`, `.netrc`, `.git-credentials`, `credentials.json`, `client_secret.json`, or `service_account.json`
- a text file containing `-----BEGIN` (private key material)

Anything else — including CSVs, screenshots, HTML, markdown, PDFs, and JSON — is fine to publish. If the user explicitly asks to publish a file the script blocks, tell them why it was blocked and let them override manually instead of bypassing the check.

## One-time setup (pavs, run once per machine)

### 1. Install rclone

```bash
brew install rclone
```

Requires `brew` (Homebrew). If you already use the skill's script, it prints install instructions when `rclone` is missing — you can verify with `command -v rclone`.

### 2. Configure the `pavs-drive` remote

```bash
rclone config
```

Walk through the interactive prompts:

1. Select `n` — **New remote**.
2. Name the remote: type `pavs-drive`.
3. Choose the storage type: type `drive` (Google Drive).
4. **Scope** — pick `1` (`drive`) for full access to your Drive, or `2` (`drive.file`) to only see/create files made through rclone. Either works for this skill; `drive.file` is the safer choice.
5. **Service Account Credentials** — `n` (no).
6. **Auto Config** — `y` (yes). Your browser opens a Google consent page; sign in with your **personal** Google account and click Allow.
7. If asked about a `drive root folder id` / team drive, leave the defaults (`n` / blank).
8. Confirm with `y` when prompted, then `q` to quit.

Do not use a work/Shared-Drive (team drive) account for this skill — it targets your personal Google Drive.

### 3. Verify the remote

```bash
rclone about pavs-drive:        # shows quota/storage for the linked account
rclone lsd pavs-drive:          # lists your Drive root folders
```

`about` failing with an auth error means the consent flow did not complete — re-run `rclone config`, then choose `e` (edit) on `pavs-drive`, or `d` then `n` to recreate it. If rclone was configured for a different account, the folders you see will tell you before any file is uploaded.

### 4. Confirm end-to-end (optional but recommended)

Publish a throwaway file to prove uploads and links work before relying on it:

```bash
echo "test" > /tmp/publish-artifact-smoke.txt
bun ~/.agents/skills/publish-artifact/scripts/publish-artifact.ts /tmp/publish-artifact-smoke.txt
rm /tmp/publish-artifact-smoke.txt
```

You should see an `Uploaded ...` line per file, an `Agent Artifacts/<YYYY-MM-DD>/` folder, and a `https://drive.google.com/...` share link per file. Opening a link in a private/incognito window confirms the anyone-with-link sharing works.

### Overrides (optional)

The skill works without extra configuration after setup. Overrides are optional:

- `AGENT_ARTIFACTS_RCLONE_REMOTE` — rclone remote name (default `pavs-drive`)
- `AGENT_ARTIFACTS_DRIVE_FOLDER` — base Drive folder (default `Agent Artifacts`)
- CLI flags `--remote NAME` and `--folder PATH` take precedence over both

## Usage

```bash
bun ~/.agents/skills/publish-artifact/scripts/publish-artifact.ts <file> [<file> ...]
bun ~/.agents/skills/publish-artifact/scripts/publish-artifact.ts --remote pavs-drive --folder "Agent Artifacts" report.html
bun ~/.agents/skills/publish-artifact/scripts/publish-artifact.ts -h   # help
```

Run it from anywhere with `bun` (Bun 1.x is required).

## What success looks like

```
Uploaded /Users/pavs/tmp/report.html -> pavs-drive:Agent Artifacts/2026-08-18/report.html

report.html -> https://drive.google.com/...

1 artifact(s) published to pavs-drive:Agent Artifacts/2026-08-18.
Each file above has its own anyone-with-link URL. The folder stays private.
```

Give the user the share link(s) — and the Drive folder name — as the answer to their request. If `rclone` is missing or unconfigured, surface the setup steps above.
