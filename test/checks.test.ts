// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Tests for the CI checks: build rules B1-2, B2-1, B3-1, G1 and the dependency licence allowlist.

import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { checkLicenses, isAllowed, type Allowlist } from '../scripts/check-licenses.ts';
import { checkDocument, checkTree } from '../scripts/check-rules.ts';
import { evaluate, listCodeFiles, type ScanFile } from '../scripts/scancode-gate.ts';
import { caseIndex, CASES_DIR, procedure } from './helpers.ts';

type Doc = Record<string, any>;
const base = (): Doc => structuredClone(procedure('2025-0102-cod'));
const rules = (d: Doc) => checkDocument(d, 'test.json').map((v) => v.rule);

describe('check-rules (B2-1, B3-1, G1)', () => {
  it('finds nothing in the reference cases', () => {
    assert.deepEqual(checkTree(fileURLToPath(CASES_DIR)), []);
    assert.equal(caseIndex().cases.length, 12);
  });
  it('B2-1: HowTheyVote source', () => {
    const d = base();
    d.steps[0].sources[0].source = 'htv';
    assert.deepEqual(rules(d), ['B2-1']);
  });
  it('B2-1: htv_vote field and vote_on edge', () => {
    const d = base();
    d.edges.push({ edge: 'vote_on', htv_vote: 183050 });
    assert.deepEqual(rules(d).sort(), ['B2-1', 'B2-1']);
  });
  it('B2-1: ODbL licence value', () => {
    const d = base();
    d.license = 'ODbL-1.0';
    assert.deepEqual(rules(d), ['B2-1']);
  });
  it('B2-1: votes/ directory in a CC BY tree', () => {
    const dir = mkdtempSync(join(tmpdir(), 'regesta-'));
    mkdirSync(join(dir, 'votes'));
    writeFileSync(join(dir, 'votes', 'votes.json'), '{}');
    assert.deepEqual(checkTree(dir).map((v) => v.rule), ['B2-1']);
  });
  it('B3-1: individual votes and per-MEP metrics', () => {
    const d = base();
    d.steps[0].member_votes = [];
    d.group_loyalty = 0.9;
    assert.deepEqual(rules(d).sort(), ['B3-1', 'B3-1']);
  });
  it('G1: names, EP person ids, group and party', () => {
    const d = base();
    d.extra = { name: 'x', ep_person_id: 1, political_group: 'x', national_party: 'x' };
    assert.deepEqual(rules(d), ['G1', 'G1', 'G1', 'G1']);
  });
  it('G1: EP person URI as a value', () => {
    const d = base();
    d.steps[0].documents = ['person/197475'];
    assert.deepEqual(rules(d), ['G1']);
  });
  it('G1: people must be a link to the API', () => {
    const d = base();
    d.people = [{ role: 'RAPPORTEUR' }];
    assert.ok(rules(d).every((r) => r === 'G1') && rules(d).length >= 1);
  });
  it('JSON Lines files are checked line by line', () => {
    const dir = mkdtempSync(join(tmpdir(), 'regesta-'));
    writeFileSync(join(dir, 'procedures.jsonl'), `${JSON.stringify(base())}\n${JSON.stringify({ mep: 1 })}\n`);
    const found = checkTree(dir);
    assert.equal(found.length, 1);
    assert.equal(found[0]?.file, 'procedures.jsonl:2');
  });
});

describe('check-licenses (06-recht.md 8.2)', () => {
  const allow: Allowlist = { allowed: ['MIT', 'ISC', 'BSD-3-Clause', 'Apache-2.0'], exceptions: {} };
  const allowed = new Set(allow.allowed);
  it('accepts permissive licences and OR choices', () => {
    assert.ok(isAllowed('MIT', allowed));
    assert.ok(isAllowed('(MIT OR GPL-3.0-only)', allowed));
    assert.ok(isAllowed('MIT AND ISC', allowed));
  });
  it('rejects copyleft, missing and unclear licences', () => {
    assert.ok(!isAllowed('GPL-3.0-only', allowed));
    assert.ok(!isAllowed('AGPL-3.0-or-later', allowed));
    assert.ok(!isAllowed('MIT AND GPL-2.0-only', allowed));
    assert.ok(!isAllowed('MIT OR ISC AND GPL-2.0-only', allowed));
    const findings = checkLicenses(
      [
        { name: 'ok', version: '1.0.0', license: 'MIT' },
        { name: 'gpl', version: '2.0.0', license: 'GPL-3.0-only' },
        { name: 'none', version: '1.0.0', license: undefined },
      ],
      allow,
    );
    assert.deepEqual(findings.map((f) => f.pkg), ['gpl@2.0.0', 'none@1.0.0']);
  });
  it('honours an approved exception for exactly that version', () => {
    const findings = checkLicenses([{ name: 'gpl', version: '2.0.0', license: 'GPL-3.0-only' }], { ...allow, exceptions: { 'gpl@2.0.0': 'approved' } });
    assert.deepEqual(findings, []);
    assert.equal(checkLicenses([{ name: 'gpl', version: '2.0.1', license: 'GPL-3.0-only' }], { ...allow, exceptions: { 'gpl@2.0.0': 'approved' } }).length, 1);
  });
});

describe('scancode-gate (B1-2)', () => {
  const own: ScanFile = {
    path: 'scan/src/schema.ts',
    type: 'file',
    license_detections: [
      { license_expression_spdx: 'AGPL-3.0-only', matches: [{ license_expression_spdx: 'AGPL-3.0-only', start_line: 1, matcher: '1-spdx-id', matched_length: 7 }] },
    ],
    holders: [{ holder: 'Manuel Wechner', start_line: 2 }],
  };
  const match = (spdx: string, matcher: string, matched_length: number, start_line = 40) => [
    { license_expression_spdx: spdx, matches: [{ license_expression_spdx: spdx, start_line, matcher, matched_length }] },
  ];
  const failing = (files: ScanFile[], declared = {}) => evaluate(files, declared).filter((f) => f.fails);
  it('accepts our own header', () => assert.deepEqual(evaluate([own], {}), []));
  it('rejects a foreign licence text', () => {
    const foreign: ScanFile = { ...own, license_detections: match('GPL-2.0-only', '3-seq', 120) };
    assert.deepEqual(failing([foreign]), [{ file: 'src/schema.ts', line: 40, message: 'licence text (120 tokens): GPL-2.0-only', fails: true }]);
  });
  it('rejects a partial foreign licence text reported only as a clue', () => {
    const clue = { license_expression_spdx: 'ICU', start_line: 3, matcher: '3-seq', matched_length: 66 };
    assert.equal(failing([{ ...own, license_clues: [clue] }]).length, 1);
  });
  it('rejects a foreign SPDX header line, however short', () => {
    assert.equal(failing([{ ...own, license_detections: match('MIT', '1-spdx-id', 4) }]).length, 1);
  });
  it('lists but does not fail a short mention of a licence name', () => {
    const findings = evaluate([{ ...own, license_detections: match('ODbL-1.0', '2-aho', 4) }], {});
    assert.equal(findings.length, 1);
    assert.equal(findings[0]?.fails, false);
  });
  it('rejects a foreign copyright holder', () => {
    const foreign: ScanFile = { ...own, holders: [{ holder: 'Example Corp.', start_line: 12 }] };
    assert.equal(failing([foreign]).length, 1);
  });
  it('accepts declared Apache-2.0 files with their original holder', () => {
    const apache: ScanFile = { path: 'scan/src/ep/client.ts', type: 'file', license_detections: match('Apache-2.0', '2-aho', 30, 1), holders: [{ holder: 'Hack23', start_line: 2 }] };
    assert.equal(failing([apache]).length, 2);
    assert.deepEqual(evaluate([apache], { 'src/ep/client.ts': { licenses: ['Apache-2.0'], holders: ['Hack23'], reason: 'test' } }), []);
  });
  it('stages only code files', () => {
    const files = listCodeFiles('.');
    assert.ok(files.includes('src/schema.ts'));
    assert.ok(files.every((f) => /\.(ts|mts|cts|js|mjs|cjs)$/.test(f)));
    assert.ok(!files.some((f) => f.includes('node_modules')));
  });
});
