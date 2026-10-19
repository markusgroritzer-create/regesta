// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Build rule B1-2 (06-recht-anwaltsfragen.md): no foreign code through the back door. ScanCode scans our own
// source code for licence texts and copyright lines. The build fails on
//   - any copyright holder other than Manuel Wechner,
//   - any licence header tag (matcher 1-spdx-id) naming another licence than our own,
//   - any other licence match of TEXT_MIN_TOKENS tokens or more (licence text or notice),
// except in files declared in scancode-allowlist.json (taken-over Apache-2.0 files, 06-recht.md 7.1).
// Shorter matches are mentions of a licence name, e.g. the allowlist in our own checks; they are listed, not failed.
//
//   node scripts/scancode-gate.ts stage <dir>        copy our code files into <dir> for scanning
//   node scripts/scancode-gate.ts check <results>    evaluate ScanCode JSON (--license --copyright --json-pp)

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export const CODE_DIRS = ['src', 'scripts', 'test', '.github/scripts'];
export const CODE_EXT = /\.(ts|mts|cts|js|mjs|cjs)$/;
export const OWN_LICENSE = 'AGPL-3.0-only';
export const OWN_HOLDER = 'Manuel Wechner';
export const TEXT_MIN_TOKENS = 15;

export interface DeclaredFile {
  licenses: string[];
  holders: string[];
  reason: string;
}

export interface ScanFile {
  path: string;
  type: string;
  detected_license_expression_spdx?: string | null;
  license_detections?: {
    license_expression_spdx: string;
    matches: { license_expression_spdx: string; start_line: number; matcher: string; matched_length: number }[];
  }[];
  license_clues?: { license_expression_spdx: string; start_line: number; matcher: string; matched_length: number }[];
  copyrights?: { copyright: string; start_line: number }[];
  holders?: { holder: string; start_line: number }[];
}

export interface GateFinding {
  file: string;
  line: number;
  message: string;
  fails: boolean;
}

export function listCodeFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules') continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (CODE_EXT.test(entry)) out.push(relative(root, full).split(sep).join('/'));
    }
  };
  for (const d of CODE_DIRS) visit(join(root, d));
  return out.sort();
}

// ScanCode reports paths with the scanned directory name as first segment.
const stripRoot = (p: string): string => p.split('/').slice(1).join('/');

export function evaluate(files: ScanFile[], declared: Record<string, DeclaredFile>): GateFinding[] {
  const findings: GateFinding[] = [];
  for (const f of files) {
    if (f.type !== 'file') continue;
    const path = stripRoot(f.path);
    const allowedLicenses = new Set([OWN_LICENSE, ...(declared[path]?.licenses ?? [])]);
    const allowedHolders = new Set([OWN_HOLDER, ...(declared[path]?.holders ?? [])]);
    // Partial licence texts appear as "clues" with low coverage; they count like detections.
    const matches = [...(f.license_detections ?? []).flatMap((d) => d.matches), ...(f.license_clues ?? [])];
    for (const m of matches) {
      if (allowedLicenses.has(m.license_expression_spdx)) continue;
      const header = m.matcher === '1-spdx-id';
      const text = m.matched_length >= TEXT_MIN_TOKENS;
      const what = header ? 'SPDX header' : text ? `licence text (${m.matched_length} tokens)` : `mention (${m.matched_length} tokens)`;
      findings.push({ file: path, line: m.start_line, message: `${what}: ${m.license_expression_spdx}`, fails: header || text });
    }
    for (const h of f.holders ?? []) {
      if (!allowedHolders.has(h.holder)) findings.push({ file: path, line: h.start_line, message: `copyright holder "${h.holder}"`, fails: true });
    }
  }
  return findings;
}

if (import.meta.main) {
  const [command, arg] = process.argv.slice(2);
  if (command === 'stage' && arg) {
    rmSync(arg, { recursive: true, force: true });
    const files = listCodeFiles('.');
    for (const f of files) {
      mkdirSync(dirname(join(arg, f)), { recursive: true });
      copyFileSync(f, join(arg, f));
    }
    console.log(`scancode-gate: staged ${files.length} code files in ${arg}`);
  } else if (command === 'check' && arg) {
    const results = JSON.parse(readFileSync(arg, 'utf8')) as { headers: { tool_version: string; errors: string[] }[]; files: ScanFile[] };
    const declared = (JSON.parse(readFileSync('scancode-allowlist.json', 'utf8')) as { files: Record<string, DeclaredFile> }).files;
    const scanned = results.files.filter((f) => f.type === 'file').length;
    const errors = results.headers.flatMap((h) => h.errors);
    const findings = evaluate(results.files, declared);
    const failing = findings.filter((f) => f.fails);
    for (const e of errors) console.error(`scancode error: ${e}`);
    for (const f of failing) console.error(`B1-2 FAIL ${f.file}:${f.line}: ${f.message}`);
    const mentions = findings.length - failing.length;
    console.log(
      `scancode-gate: ScanCode ${results.headers[0]?.tool_version}, ${scanned} files, ${failing.length} failing finding(s), ` +
        `${mentions} licence mention(s) below ${TEXT_MIN_TOKENS} tokens (not failing), ${errors.length} scan error(s)`,
    );
    process.exit(failing.length || errors.length || scanned === 0 ? 1 : 0);
  } else {
    console.error('usage: scancode-gate.ts stage <dir> | check <results.json>');
    process.exit(2);
  }
}
