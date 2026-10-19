// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Acceptance M0: "Schema validiert alle Referenzfälle" (08-modulplan.md), plus the cases the schema must reject.

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { createValidator } from '../src/schema.ts';
import { caseIndex, expected, procedure, schemaFile } from './helpers.ts';

const validate = createValidator();
const index = caseIndex();
const FIXED = ['2021/0106(COD)', '2025/0102(COD)', '2025/0360(COD)', '2025/0359(COD)', 'C(2026)4534'];

describe('reference cases', () => {
  it('are the five fixed cases from 08-modulplan.md plus seven random ones', () => {
    assert.deepEqual(index.cases.filter((c) => c.category === 'fixed').map((c) => c.id), FIXED);
    assert.equal(index.cases.filter((c) => c.category === 'random').length, 7);
    assert.equal(index.sampling.picked.length, 7);
    assert.equal(new Set(index.cases.map((c) => c.slug)).size, 12);
  });

  for (const c of index.cases) {
    it(`${c.id} is valid against procedure.schema.json v0.1`, () => {
      const result = validate(procedure(c.slug));
      assert.deepEqual(result.errors, []);
      assert.equal(result.valid, true);
    });

    it(`${c.id} matches its expected values`, () => {
      const doc = procedure(c.slug);
      const exp = expected(c.slug);
      assert.equal(doc.id, exp.id);
      assert.equal(doc.slug, c.slug);
      const epSteps = doc.steps.filter((s: { institution: string; id: string }) => s.institution === 'parliament');
      assert.equal(epSteps.length, exp.expected.ep_events);
      const trilogues = doc.steps.filter((s: { kind: string }) => s.kind === 'trilogue').map((s: { date: string }) => s.date);
      assert.deepEqual(trilogues, exp.expected.trilogue_dates);
    });
  }

  it('2025/0102(COD) has the Phase A values (datenquellen.md Fall 2)', () => {
    const doc = procedure('2025-0102-cod');
    const exp = expected('2025-0102-cod').expected.phase_a;
    assert.equal(doc.steps.filter((s: { institution: string }) => s.institution === 'parliament').length, exp.ep_events);
    assert.deepEqual(doc.steps.filter((s: { kind: string }) => s.kind === 'trilogue').map((s: { date: string }) => s.date), exp.trilogue_meetings);
    assert.ok(doc.identifiers.some((i: { alias_type: string; alias: string }) => i.alias_type === 'com' && i.alias === exp.com));
    assert.ok(doc.identifiers.some((i: { alias_type: string; alias: string }) => i.alias_type === 'ep_doc' && i.alias === exp.ep_doc));
  });

  it('C(2026)4534 is canonical and 2026/2805(DEA) is a derived alias (R6)', () => {
    const doc = procedure('c-2026-4534');
    assert.equal(doc.id, 'C(2026)4534');
    const alias = doc.identifiers.find((i: { alias_type: string }) => i.alias_type === 'ep_proc');
    assert.equal(alias.alias, '2026/2805(DEA)');
    assert.equal(alias.provenance.rule, 'R6');
    assert.equal(doc.edges.find((e: { edge: string }) => e.edge === 'same_as').provenance.quality, 'high');
  });
});

// Each mutation below must make a valid document invalid.
type Doc = Record<string, any>;
const base = (): Doc => structuredClone(procedure('2025-0102-cod'));
const rejects = (name: string, mutate: (d: Doc) => void) =>
  it(`rejects: ${name}`, () => {
    const d = base();
    mutate(d);
    assert.equal(validate(d).valid, false);
  });

describe('schema rejects', () => {
  rejects('identifier without provenance', (d) => delete d.identifiers[0].provenance);
  rejects('step without sources', (d) => delete d.steps[0].sources);
  rejects('official statement with empty sources', (d) => (d.steps[0].sources = []));
  rejects('derived edge without rule', (d) => delete d.identifiers.find((i: Doc) => i.provenance.status === 'derived').provenance.rule);
  rejects('match quality low', (d) => (d.identifiers.find((i: Doc) => i.provenance.status === 'derived').provenance.quality = 'low'));
  rejects('missing link without reason', (d) => (d.steps[0].provenance = { status: 'missing' }));
  rejects('source outage as a gap on a procedure', (d) => (d.gaps[0].reason = 'source_unavailable'));
  rejects('unknown gap reason', (d) => (d.gaps[0].reason = 'unknown'));
  rejects('unknown step kind', (d) => (d.steps[0].kind = 'coffee_break'));
  rejects('COM number with leading zero', (d) => (d.identifiers.find((i: Doc) => i.alias_type === 'com').alias = 'COM(2025)0102'));
  rejects('canonical id in Cellar spelling', (d) => (d.id = '2025/0102/COD'));
  rejects('slug of another type', (d) => (d.slug = '2025-0102-dea'));
  // B2-1: no HowTheyVote content in the CC BY graph
  rejects('B2-1 HowTheyVote as source', (d) => (d.steps[0].sources[0].source = 'htv'));
  rejects('B2-1 alias type htv_vote', (d) => d.identifiers.push({ ...d.identifiers[0], alias_type: 'htv_vote', alias: '183050' }));
  rejects('B2-1 edge vote_on', (d) => d.edges.push({ ...d.steps[0], id: 'x', edge: 'vote_on', from: '183050', to: d.steps[0].id }));
  rejects('B2-1 ODbL licence on a node', (d) => (d.steps[0].license = 'ODbL-1.0'));
  rejects('B2-1 ODbL licence on a source', (d) => (d.steps[0].sources[0].license = 'ODbL-1.0'));
  // B2-2: plenary vote facts only from EP API or Cellar
  rejects('B2-2 plenary vote from a Council PDF', (d) => (d.steps.find((s: Doc) => s.kind === 'plenary_vote').sources[0].source = 'council_pdf'));
  rejects('B2-2 plenary amendment vote from Have your say', (d) => (d.steps.find((s: Doc) => s.kind === 'plenary_amend').sources[0].source = 'hys'));
  // B3-1: no individual votes, no per-MEP metrics
  rejects('B3-1 member_votes on a step', (d) => (d.steps.find((s: Doc) => s.kind === 'plenary_vote').member_votes = [{ mep: 1, vote: 'yes' }]));
  rejects('B3-1 attendance on the procedure', (d) => (d.attendance = { rate: 0.9 }));
  // G1: no personal data; roles only as a link
  rejects('G1 rapporteur in the document', (d) => (d.rapporteur = { ep_person_id: 197475 }));
  rejects('G1 people as an embedded list', (d) => (d.people = [{ role: 'rapporteur' }]));
  rejects('G1 people link to another host', (d) => (d.people = 'https://example.org/v1/procedures/2025-0102-cod/people'));
  rejects('G1 extra field on a document node', (d) => (d.documents[0].author = 'someone'));
  rejects('attribution that claims to be official', (d) => (d.attribution.official = true));
});

describe('vocabularies', () => {
  const stepKind = schemaFile('step-kind.schema.json');
  const procedureSchema = schemaFile('procedure.schema.json');

  it('every EP activity type maps to a known step kind', () => {
    for (const [type, kind] of Object.entries(stepKind['x-ep-activity-types'])) assert.ok(stepKind.enum.includes(kind), `${type} -> ${kind}`);
  });

  it('every step kind belongs to exactly one group', () => {
    const grouped = Object.values(stepKind['x-groups'] as Record<string, string[]>).flat();
    assert.deepEqual([...grouped].sort(), [...stepKind.enum].sort());
  });

  it('B2-2 covers exactly the plenary decision kinds', () => {
    const rule = procedureSchema.$defs.step.allOf[2].if.properties.kind.enum;
    assert.deepEqual([...rule].sort(), [...stepKind['x-plenary-decision-kinds']].sort());
  });

  it('every step kind used in the reference cases has an EP mapping or an annex-A kind', () => {
    for (const c of caseIndex().cases)
      for (const s of procedure(c.slug).steps) if (s.institution === 'parliament') assert.equal(stepKind['x-ep-activity-types'][s.source_kind], s.kind);
  });

  it('normalisation examples produce identifiers that the schema accepts', () => {
    const identifier = schemaFile('identifier.schema.json');
    const patterns = new Map<string, RegExp>(
      identifier.allOf.map((r: Doc) => [r.if.properties.alias_type.const, new RegExp(r.then.properties.alias.pattern)]),
    );
    for (const [type, rule] of Object.entries(identifier['x-normalisation'] as Record<string, Doc>)) {
      const target = patterns.get(rule.maps_to ?? type);
      assert.ok(target, `no pattern for ${type}`);
      for (const [, normalised] of rule.examples) assert.match(normalised, target, `${type}: ${normalised}`);
    }
  });
});
