// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// Acceptance M0: "ein Pull Request ohne CLA wird blockiert" (08-modulplan.md).

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { CLA_SENTENCE, evaluateCla, hasAgreed, type ClaInput } from '../.github/scripts/cla-check.ts';

const external = (overrides: Partial<ClaInput> = {}): ClaInput => ({
  author: { login: 'contributor', type: 'User' },
  authorAssociation: 'NONE',
  commitAuthors: [{ login: 'contributor', type: 'User', name: 'Con Tributor' }],
  comments: [],
  ...overrides,
});

describe('CLA check', () => {
  it('blocks a pull request without CLA', () => {
    const r = evaluateCla(external());
    assert.equal(r.ok, false);
    assert.deepEqual(r.missing, ['contributor']);
  });

  it('passes once the author posts the sentence', () => {
    const r = evaluateCla(external({ comments: [{ login: 'contributor', body: CLA_SENTENCE }] }));
    assert.equal(r.ok, true);
    assert.deepEqual(r.signed, ['contributor']);
  });

  it('does not count the sentence posted by someone else', () => {
    const r = evaluateCla(external({ comments: [{ login: 'friend', body: CLA_SENTENCE }] }));
    assert.equal(r.ok, false);
  });

  it('requires every commit author, not only the pull request author', () => {
    const r = evaluateCla(
      external({
        commitAuthors: [
          { login: 'contributor', type: 'User', name: 'A' },
          { login: 'coauthor', type: 'User', name: 'B' },
        ],
        comments: [{ login: 'contributor', body: CLA_SENTENCE }],
      }),
    );
    assert.equal(r.ok, false);
    assert.deepEqual(r.missing, ['coauthor']);
  });

  it('blocks commits whose author has no GitHub account', () => {
    const r = evaluateCla(external({ commitAuthors: [{ login: null, name: 'Unknown Person' }], comments: [{ login: 'contributor', body: CLA_SENTENCE }] }));
    assert.equal(r.ok, false);
    assert.deepEqual(r.unknownAuthors, ['Unknown Person']);
  });

  it('exempts members of the licensor organisation and bots', () => {
    assert.equal(evaluateCla(external({ author: { login: 'owner', type: 'User' }, authorAssociation: 'OWNER', commitAuthors: [{ login: 'owner', type: 'User', name: 'O' }] })).ok, true);
    assert.equal(evaluateCla(external({ author: { login: 'dependabot[bot]', type: 'Bot' }, commitAuthors: [{ login: 'dependabot[bot]', type: 'Bot', name: 'd' }] })).ok, true);
  });

  it('a member opening a pull request with an external commit still needs that author', () => {
    const r = evaluateCla(external({ author: { login: 'owner', type: 'User' }, authorAssociation: 'MEMBER', commitAuthors: [{ login: 'contributor', type: 'User', name: 'C' }] }));
    assert.deepEqual(r.missing, ['contributor']);
  });

  it('accepts the sentence on its own line, ignoring case, spacing and a final full stop', () => {
    assert.ok(hasAgreed('Thanks!\n\ni have read the  CLA v1.0 and I agree.\n'));
    assert.ok(!hasAgreed('I have read the CLA v0.9 and I agree'));
    assert.ok(!hasAgreed('I have read the CLA v1.0 and I agree, but not to section 2'));
  });
});
