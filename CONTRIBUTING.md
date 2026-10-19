# Contributing to Regesta

Thank you for your interest. A few rules keep the project open, lawful and maintainable.

## Contributor licence agreement

Every contribution needs the CLA in [`CLA.md`](CLA.md) (German, version 1.0). Post this sentence as a comment in your pull request:

    I have read the CLA v1.0 and I agree

Every GitHub account that authored the pull request or one of its commits must post it once. The check `regesta/cla` stays red until then, and a pull request with a red check cannot be merged. Commits whose author e-mail is not linked to a GitHub account cannot be checked; please use a linked address.

## What a contribution must respect

- **Mark AI-generated parts.** If parts of your contribution were mostly generated with AI tools, say so in the pull request (CLA No. 4 (e)).
- **No foreign code without its licence.** Third-party code must be marked with origin and licence. CI scans the code for foreign licence texts and copyright lines and fails if it finds any outside declared files.
- **Dependencies** must use a licence on the allowlist in [`license-allowlist.json`](license-allowlist.json). Other licences need approval first.
- **No personal data** in code, tests or the data repository: no names, no EP person identifiers, no political group or party, no votes. Roles in a procedure are only a link to the API.
- **No individual votes, no per-MEP figures, no MEP pages, no person search.** This is a data-protection boundary, not a missing feature.
- **No HowTheyVote data in CC BY files.** Voting data live only in the separate ODbL database `votes/`.
- **Every source file** starts with `SPDX-License-Identifier: AGPL-3.0-only` and `SPDX-FileCopyrightText: <year> Manuel Wechner (Berth)` for own code.

## Running the checks locally

Node.js 24 or later:

    npm ci
    npm run ci

`npm run ci` runs the type check, the tests (schema against all reference cases, CLA check, build-rule checks) and the licence and data checks. The ScanCode scan runs in CI (see `.github/workflows/ci.yml`).
