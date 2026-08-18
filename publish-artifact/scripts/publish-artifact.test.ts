import { describe, expect, it } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const scriptPath = join(import.meta.dir, "publish-artifact.ts");

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function makeFakeRclone(binDir: string): string {
  const logPath = join(binDir, "rclone.log");
  const fake = join(binDir, "rclone");
  writeFileSync(
    fake,
    [
      "#!/usr/bin/env bash",
      `echo "$*" >> ${JSON.stringify(logPath)}`,
      'if [ "$1" = "link" ]; then',
      "  echo https://drive.google.com/file/d/FAKE_ID/view",
      "fi",
      "exit 0",
      "",
    ].join("\n"),
  );
  chmodSync(fake, 0o755);
  return logPath;
}

function runScript(
  scriptArgs: string[],
  binDir: string,
  extraEnv: Record<string, string> = {},
): { exitCode: number | null; stdout: string; stderr: string } {
  const result = Bun.spawnSync([process.execPath, scriptPath, ...scriptArgs], {
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, PATH: `${binDir}:${process.env.PATH}`, ...extraEnv },
  });
  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

describe("publish-artifact", () => {
  it("uploads a file and prints a share link", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const logPath = makeFakeRclone(binDir);
    const file = join(root, "report.md");
    writeFileSync(file, "# Report\n");
    const today = localToday();

    const res = runScript([file], binDir);

    expect(res.exitCode).toBe(0);
    const log = readLog(logPath);
    expect(log).toContain(`copyto ${file} pavs-drive:Agent Artifacts/${today}/report.md`);
    expect(log).toContain(`link pavs-drive:Agent Artifacts/${today}/report.md`);
    expect(res.stdout).toContain("https://drive.google.com/file/d/FAKE_ID/view");
  });

  it("respects --remote and --folder overrides", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const logPath = makeFakeRclone(binDir);
    const file = join(root, "a.txt");
    writeFileSync(file, "hi\n");

    const res = runScript(["--remote", "other-remote", "--folder", "Some Folder", file], binDir);

    expect(res.exitCode).toBe(0);
    expect(readLog(logPath)).toContain(`copyto ${file} other-remote:Some Folder/${localToday()}/a.txt`);
  });

  it("refuses sensitive files", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const logPath = makeFakeRclone(binDir);
    const file = join(root, "secret.env");
    writeFileSync(file, "TOKEN=abc\n");

    const res = runScript([file], binDir);

    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain("refusing to publish");
    expect(res.stderr).toContain("blocked extension");
    expect(readLog(logPath)).not.toContain("copyto");
  });

  it("refuses private key content", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const file = join(root, "notes.txt");
    writeFileSync(file, "-----BEGIN PRIVATE KEY-----\n");

    const res = runScript([file], binDir);

    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain("private key material");
  });

  it("refuses directories and symlinks", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const binDir = join(root, "bin");
    mkdirSync(binDir);
    const dir = join(root, "a-directory");
    mkdirSync(dir);
    const target = join(root, "target.txt");
    writeFileSync(target, "data\n");
    const link = join(root, "link.txt");
    symlinkSync(target, link);

    const dirRes = runScript([dir], binDir);
    expect(dirRes.exitCode).toBe(1);
    expect(dirRes.stderr).toContain("is a directory");

    const linkRes = runScript([link], binDir);
    expect(linkRes.exitCode).toBe(1);
    expect(linkRes.stderr).toContain("is a symbolic link");
  });

  it("reports a missing rclone", () => {
    const root = mkdtempSync(join(tmpdir(), "publish-artifact-"));
    const emptyBin = join(root, "empty-bin");
    mkdirSync(emptyBin);
    const file = join(root, "ok.txt");
    writeFileSync(file, "hi\n");

    const res = runScript([file], emptyBin, { PATH: emptyBin });

    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain("rclone is not installed");
  });
});

function readLog(logPath: string): string {
  try {
    return readFileSync(logPath, "utf8");
  } catch {
    return "";
  }
}
