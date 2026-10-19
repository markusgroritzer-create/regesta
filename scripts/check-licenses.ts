// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Licence check of all dependencies against the allowlist (06-recht.md 8.2 Nr. 3):
// permissive licences only; GPL/AGPL and anything else only after explicit approval,
// recorded as an exception with package, version and reason in license-allowlist.json.
// Usage: node scripts/check-licenses.ts [package-lock.json] [license-allowlist.json]

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface Allowlist {
  allowed: string[];
  exceptions: Record<string, string>;
}

export interface LockPackage {
  name: string;
  version: string;
  license: string | undefined;
}

export interface LicenseFinding {
  pkg: string;
  license: string;
  reason: string;
}

// Evaluates an SPDX expression of the forms found in npm metadata: "MIT", "(MIT OR Apache-2.0)", "A AND B".
// Parentheses are flattened; mixed AND/OR without parentheses is rejected as unclear.
export function isAllowed(expression: string, allowed: Set<string>): boolean {
  const flat = expression.replace(/[()]/g, ' ').trim();
  const hasOr = / OR /.test(flat);
  const hasAnd = / AND /.test(flat);
  if (hasOr && hasAnd) return false;
  const ids = flat.split(/ (?:OR|AND) /).map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return false;
  return hasOr ? ids.some((id) => allowed.has(id)) : ids.every((id) => allowed.has(id));
}

export function readLockPackages(lockPath: string): LockPackage[] {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { packages: Record<string, { version?: string; license?: string; link?: boolean }> };
  const root = dirname(lockPath);
  return Object.entries(lock.packages)
    .filter(([path, p]) => path !== '' && !p.link)
    .map(([path, p]) => {
      const name = path.replace(/^.*node_modules\//, '');
      let license = p.license;
      // Cross-check with the installed package.json where present; the lockfile value comes from the registry.
      const installed = join(root, path, 'package.json');
      if (existsSync(installed)) {
        const pj = JSON.parse(readFileSync(installed, 'utf8')) as { license?: string | { type?: string } };
        const own = typeof pj.license === 'string' ? pj.license : pj.license?.type;
        if (own && license && own !== license) license = `${license} | package.json: ${own}`;
        license ??= own;
      }
      return { name, version: p.version ?? '?', license };
    });
}

export function checkLicenses(packages: LockPackage[], allowlist: Allowlist): LicenseFinding[] {
  const allowed = new Set(allowlist.allowed);
  const findings: LicenseFinding[] = [];
  for (const p of packages) {
    const key = `${p.name}@${p.version}`;
    if (allowlist.exceptions[key]) continue;
    if (!p.license) findings.push({ pkg: key, license: '(none)', reason: 'no licence declared' });
    else if (p.license.includes('|')) findings.push({ pkg: key, license: p.license, reason: 'lockfile and package.json disagree' });
    else if (!isAllowed(p.license, allowed)) findings.push({ pkg: key, license: p.license, reason: 'not on the allowlist' });
  }
  return findings;
}

if (import.meta.main) {
  const lockPath = process.argv[2] ?? 'package-lock.json';
  const allowPath = process.argv[3] ?? 'license-allowlist.json';
  const allowlist = JSON.parse(readFileSync(allowPath, 'utf8')) as Allowlist;
  const packages = readLockPackages(lockPath);
  const findings = checkLicenses(packages, allowlist);
  for (const f of findings) console.error(`licence: ${f.pkg} ${f.license}: ${f.reason}`);
  const counts = new Map<string, number>();
  for (const p of packages) counts.set(p.license ?? '(none)', (counts.get(p.license ?? '(none)') ?? 0) + 1);
  console.log(`check-licenses: ${packages.length} packages (${[...counts].map(([l, n]) => `${l} ${n}`).join(', ')}); ${findings.length} finding(s)`);
  process.exit(findings.length ? 1 : 0);
}
