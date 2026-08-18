import { basename, extname, resolve } from "node:path";
import { lstatSync, readFileSync } from "node:fs";

const DEFAULT_REMOTE = "pavs-drive";
const DEFAULT_FOLDER = "Agent Artifacts";

const DENIED_EXTENSIONS = new Set([
  ".env",
  ".pem",
  ".key",
  ".p12",
  ".pfx",
  ".keystore",
  ".crt",
  ".p7b",
  ".asc",
]);
const DENIED_NAMES = new Set([
  "id_rsa",
  "id_ed25519",
  "id_dsa",
  "id_ecdsa",
  ".netrc",
  ".git-credentials",
  "credentials.json",
  "client_secret.json",
  "service_account.json",
]);

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function sensitiveReason(name: string, content: string): string | null {
  const lower = name.toLowerCase();
  for (const ext of DENIED_EXTENSIONS) {
    if (lower.endsWith(ext)) return `blocked extension ${ext}`;
  }
  if (DENIED_NAMES.has(name)) return "blocked filename";
  if (content.includes("-----BEGIN")) return "contains private key material";
  return null;
}

function checkFile(path: string): { name: string; error: string | null } {
  const abs = resolve(path);
  let stats;
  try {
    stats = lstatSync(abs);
  } catch {
    return { name: basename(abs), error: `not found: ${path}` };
  }
  if (stats.isDirectory()) return { name: basename(abs), error: `is a directory: ${path}` };
  if (stats.isSymbolicLink()) return { name: basename(abs), error: `is a symbolic link: ${path}` };
  const content = readFileSync(abs, "utf8");
  const reason = sensitiveReason(basename(abs), content);
  if (reason) return { name: basename(abs), error: `refusing to publish: ${path} (${reason})` };
  return { name: basename(abs), error: null };
}

interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function run(args: string[]): RunResult {
  let proc;
  try {
    proc = Bun.spawnSync(["rclone", ...args], { stdout: "pipe", stderr: "pipe" });
  } catch {
    return { ok: false, stdout: "", stderr: "rclone is not installed" };
  }
  if (proc.exitCode === null) {
    return { ok: false, stdout: "", stderr: "rclone is not installed" };
  }
  return {
    ok: proc.exitCode === 0,
    stdout: proc.stdout.toString().trim(),
    stderr: proc.stderr.toString().trim(),
  };
}

function printUsage(): void {
  console.log(
    [
      "Usage: bun publish-artifact.ts [--remote NAME] [--folder PATH] <file> [<file> ...]",
      "",
      "Uploads files to Google Drive and prints a shareable link.",
      "",
      "Options:",
      "  --remote NAME   rclone remote (default: AGENT_ARTIFACTS_RCLONE_REMOTE or pavs-drive)",
      "  --folder PATH   base Drive folder (default: AGENT_ARTIFACTS_DRIVE_FOLDER or Agent Artifacts)",
      "  -h, --help      show this help",
    ].join("\n"),
  );
}

const files: string[] = [];
let remote = process.env.AGENT_ARTIFACTS_RCLONE_REMOTE ?? DEFAULT_REMOTE;
let folder = process.env.AGENT_ARTIFACTS_DRIVE_FOLDER ?? DEFAULT_FOLDER;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === "--remote" || arg === "--folder") && i + 1 < args.length) {
    if (arg === "--remote") remote = args[++i];
    else folder = args[++i];
  } else if (arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(0);
  } else if (arg.startsWith("--")) {
    console.error(`Unknown flag: ${arg}`);
    printUsage();
    process.exit(2);
  } else {
    files.push(arg);
  }
}

if (files.length === 0) {
  console.error("No files to publish.");
  printUsage();
  process.exit(2);
}

const checked = files.map((f) => ({ path: f, ...checkFile(f) }));
for (const item of checked) {
  if (item.error) {
    console.error(item.error);
    process.exit(1);
  }
}

const today = localToday();
const uploads = checked.filter((c) => c.error === null);

for (const item of uploads) {
  const dest = `${remote}:${folder}/${today}/${item.name}`;
  const res = run(["copyto", item.path, dest]);
  if (!res.ok) {
    console.error(`Upload failed for ${item.name}:`);
    console.error(res.stderr || "rclone is not installed. Install with: brew install rclone, then run: rclone config");
    process.exit(1);
  }
  console.log(`Uploaded ${item.path} -> ${remote}:${folder}/${today}/${item.name}`);
}

for (const item of uploads) {
  const linkRes = run(["link", `${remote}:${folder}/${today}/${item.name}`]);
  if (!linkRes.ok) {
    console.error(`Failed to create share link for ${item.name}: ${linkRes.stderr}`);
    process.exit(1);
  }
  console.log(`\n${item.name} -> ${linkRes.stdout}`);
}

console.log(`\n${uploads.length} artifact(s) published to ${remote}:${folder}/${today}.`);
console.log("Each file above has its own anyone-with-link URL. The folder stays private.");
