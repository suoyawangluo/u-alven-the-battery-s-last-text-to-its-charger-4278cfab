// The Battery's Last Text to Its Charger — make.fun entry
// One line of at most 200 characters: the phone battery's final message
// to the charger it waited for all day. The joke: the battery waited all
// day while the charger charged everything else — toothbrush, vape, cat
// tracker — and now, at 1%, it signs off with spite instead of sadness.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The entry, in three named movements: who is texting, the grievance
// (everything else got charged today), and the sign-off.
const GREETING = "Hey, it's me — your battery. 1% left.";
const GRIEVANCE =
  "You charged the toothbrush, the vape, and the cat's GPS tracker today.";
const SIGN_OFF = "But sure, take your time. I'll just die here next to the lamp.";

function buildLine(): string {
  return [GREETING, GRIEVANCE, SIGN_OFF].join(" ");
}

interface GateReport {
  ok: boolean;
  codePoints: number;
  lines: number;
}

function validateEntry(line: string): GateReport {
  const codePoints = [...line].length;
  const lines = line.split("\n").length;
  const ok =
    codePoints >= 1 && codePoints <= 200 && lines === 1 && line.trim().length > 0;
  return { ok, codePoints, lines };
}

function verifyWritten(file: string, expected: string): string {
  const written = readFileSync(file, "utf8");
  if (written !== expected) {
    throw new Error("written entry differs from the entry text");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const line = buildLine();
  const report = validateEntry(line);
  if (!report.ok) {
    throw new Error(
      `gate failed: ${report.codePoints} code points, ${report.lines} lines`,
    );
  }
  const outDir =
    process.env.MAKEFUN_OUTPUT_DIR ?? join(process.cwd(), "output");
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, "entry.txt");
  writeFileSync(file, line, "utf8");
  const sha256 = verifyWritten(file, line);
  console.log(
    `gate passes: ${report.codePoints} code points, ${report.lines} line`,
  );
  console.log(`wrote ${file} (sha256 ${sha256})`);
  console.log(`verified: ${JSON.stringify(line)}`);
}

main();
