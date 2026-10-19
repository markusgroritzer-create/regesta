// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-FileCopyrightText: 2026 Manuel Wechner (Berth)

// End-to-end run of .github/scripts/cla-check.ts as the CLA workflow runs it, against a local stand-in
// for the GitHub REST API. Shows that the commit status "regesta/cla" is set to failure for a pull request
// without CLA and to success after the contributor's comment.

import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { CLA_SENTENCE } from '../.github/scripts/cla-check.ts';

interface Posted {
  path: string;
  body: { state: string; context: string; description: string };
}

async function runAgainstFakeApi(comments: { user: { login: string; type: string }; body: string }[]) {
  const posted: Posted[] = [];
  const repo = '/repos/regesta-data/regesta';
  const routes: Record<string, unknown> = {
    [`${repo}/pulls/7`]: { number: 7, user: { login: 'contributor', type: 'User' }, author_association: 'FIRST_TIME_CONTRIBUTOR', head: { sha: 'abc123' } },
    [`${repo}/pulls/7/commits`]: [{ author: { login: 'contributor', type: 'User' }, commit: { author: { name: 'Con Tributor' } } }],
    [`${repo}/issues/7/comments`]: comments,
  };
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const path = (req.url ?? '').split('?')[0] ?? '';
    let data = '';
    req.on('data', (c: Buffer) => (data += c.toString()));
    req.on('end', () => {
      if (req.method === 'POST') {
        posted.push({ path, body: JSON.parse(data) as Posted['body'] });
        res.writeHead(201, { 'content-type': 'application/json' }).end('{}');
      } else if (path in routes) {
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(routes[path]));
      } else res.writeHead(404).end('{}');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  const dir = mkdtempSync(join(tmpdir(), 'regesta-cla-'));
  const eventPath = join(dir, 'event.json');
  writeFileSync(eventPath, JSON.stringify({ pull_request: { number: 7 } }));
  const script = fileURLToPath(new URL('../.github/scripts/cla-check.ts', import.meta.url));
  const child = await new Promise<{ status: number | null; stdout: string }>((resolve) => {
    const p = spawn(process.execPath, [script], {
      env: { ...process.env, GITHUB_EVENT_PATH: eventPath, GITHUB_REPOSITORY: 'regesta-data/regesta', GITHUB_TOKEN: 'test', GITHUB_API_URL: `http://127.0.0.1:${port}`, GITHUB_STEP_SUMMARY: '' },
    });
    let out = '';
    p.stdout.on('data', (c: Buffer) => (out += c.toString()));
    p.on('close', (status) => resolve({ status, stdout: out }));
  });
  server.close();
  return { ...child, posted };
}

describe('CLA workflow script end to end', () => {
  it('blocks a pull request without CLA: status failure, exit code 1', async () => {
    const r = await runAgainstFakeApi([]);
    assert.equal(r.status, 1);
    assert.equal(r.posted.length, 1);
    assert.equal(r.posted[0]?.path, '/repos/regesta-data/regesta/statuses/abc123');
    assert.equal(r.posted[0]?.body.context, 'regesta/cla');
    assert.equal(r.posted[0]?.body.state, 'failure');
    assert.match(r.stdout, /blocked/);
  });

  it('passes after the contributor posts the CLA sentence: status success, exit code 0', async () => {
    const r = await runAgainstFakeApi([{ user: { login: 'contributor', type: 'User' }, body: CLA_SENTENCE }]);
    assert.equal(r.status, 0);
    assert.equal(r.posted[0]?.body.state, 'success');
  });
});
