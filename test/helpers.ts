// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

import { readFileSync } from 'node:fs';

export const CASES_DIR = new URL('./reference-cases/', import.meta.url);

export interface CaseIndex {
  cases: { id: string; slug: string; type: string; category: 'fixed' | 'random'; why: string }[];
  sampling: { seed: number; cutoff: string; frame_size: number; picked: string[] };
}

export function readJson<T = Record<string, any>>(url: URL): T {
  return JSON.parse(readFileSync(url, 'utf8')) as T;
}

export function caseIndex(): CaseIndex {
  return readJson<CaseIndex>(new URL('index.json', CASES_DIR));
}

export function procedure(slug: string): Record<string, any> {
  return readJson(new URL(`${slug}/procedure.json`, CASES_DIR));
}

export function expected(slug: string): Record<string, any> {
  return readJson(new URL(`${slug}/expected.json`, CASES_DIR));
}

export function schemaFile(name: string): Record<string, any> {
  return readJson(new URL(`../schema/v0.1/${name}`, import.meta.url));
}
