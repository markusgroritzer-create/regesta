# Regesta procedure schema v0.1

Licence: CC BY 4.0 · Status: v0.1, before the first data release · Base URL: `https://regesta.io/schema/v0.1/`

Regesta describes each EU procedure as one document that runs across the European Commission, the European Parliament and the Council of the EU. This folder is the published specification of that document.

| File | Content |
|---|---|
| [`procedure.schema.json`](procedure.schema.json) | JSON Schema (draft 2020-12) of a procedure document: one file in the data repository, one full object in the API |
| [`identifier.schema.json`](identifier.schema.json) | Identifier types (alias table) with patterns and normalisation rules (`x-normalisation`) |
| [`step-kind.schema.json`](step-kind.schema.json) | Step kinds, grouped by institution, and the 1:1 mapping of EP activity types (`x-ep-activity-types`) |
| [`gap-reason.schema.json`](gap-reason.schema.json) | Reasons for a missing link |

## Principles

1. **One canonical identifier per procedure.** COD and RPS: the interinstitutional number in EP spelling, `2025/0102(COD)`. DEA: the Commission C number, `C(2026)4534`; the EP number `2026/2805(DEA)` is used only until a C number is assigned. Every other identifier or spelling is an alias.
2. **Every statement carries its provenance.** `provenance.status` is `official` (the link is stated by an official source), `derived` (Regesta made it by a published rule; then `rule`, `rule_version`, `quality` and `evidence` are required) or `missing` (it should exist but cannot be shown; then `reason` is required). Matches below quality `medium` are never published as a link.
3. **Every statement carries source, URL, retrieval time and licence** in `sources[]`. The licence of every graph element is CC BY 4.0; `sources[].license` names the licence of the source data.
4. **Nothing is overwritten.** Statements have `valid_from` and `valid_to` (the runs in which they were first and last observed). A source outage never ends a statement and never appears on a procedure; it is recorded only in source health.
5. **No personal data in this document.** Roles in the procedure (rapporteur and political group) are served only by the API: `people` is a link to `https://regesta.io/v1/procedures/<slug>/people`.
6. **No voting data in this document.** Plenary votes from HowTheyVote.eu are a separate database under ODbL 1.0 (`votes/` in the bulk export, `/votes` in the API). Status, result and date of plenary decisions in this document come only from the EP API or Cellar.

## Identifiers and normalisation

| `alias_type` | Example (normalised) | Source | Normalisation |
|---|---|---|---|
| `ep_proc` | `2025/0102(COD)` | EP API, HowTheyVote | canonical form |
| `cellar_proc` | `2025/0102/COD` | Cellar | R1: maps to `2025/0102(COD)` |
| `council_proc` | `2025/0102 (COD)` | Council PDF header | R1: remove the space |
| `ep_proc_id` | `2025-0102` | EP API, ELI-DL | R1: with the EP procedure type |
| `com`, `sec`, `swd`, `c_code` | `COM(2025)102` | Cellar, Have your say, registers | remove `immc:`, `final`, spaces, leading zeros |
| `celex` | `32024R1689` | Cellar | unchanged |
| `eli` | `http://data.europa.eu/eli/reg/2024/1689/oj` | Cellar | `eli:` prefix expanded |
| `council_doc` | `ST 10915/2/26 REV 2` | Cellar dossier | `TYPE NNNN/YY [REV n]` |
| `hys_initiative`, `ares`, `hys_ref` | `14486`, `Ares(2025)813524`, `PLAN/2025/243` | Have your say | unchanged; Ares is not unique and never a key |
| `ep_register`, `ep_doc` | `P10_A(2025)0272`, `A-10-2025-0272` | EP API, Cellar | R2 links both notations |
| `ep_event` | `MTG-PL-2026-01-20-VOT-ITM-981677` | EP API | without `eli/dl/event/` |
| `geda`, `mne` | `GEDA/A/(2024)000753`, `MNE(2022)05537` | OEIL, Cellar NIM | unchanged |

The exact patterns and more examples are in [`identifier.schema.json`](identifier.schema.json). An identifier that would map to two procedures is not resolved; the API answers `ambiguous` with both candidates.

## Step kinds

Commission: `planned`, `call_for_evidence`, `public_consultation`, `draft_for_feedback`, `proposal_adopted`, `swd_published`, `delegated_act_adopted`, `transmitted`. Parliament: `referral`, `committee_report_tabled`, `plenary_debate`, `plenary_vote`, `trilogue`, `committee_approves_agreement`, `objection_tabled`, `objection_vote`, and one kind for each further EP activity type. Council: `council_document`, `general_approach` (derived), `coreper_confirmation` (derived), `council_adoption` (only with an official reference). After adoption: `signed`, `published_oj`, `entered_into_force`, `transposition_deadline`, `nim_notified`.

Every EP activity type maps to exactly one step kind; the original type stays in `source_kind`. The mapping in v0.1 covers the 19 EP activity types seen in the reference cases. A new EP activity type is a schema change (new minor version), never silently dropped.

## Reasons for gaps

`council_votes_not_machine_readable`, `cellar_lag`, `ep_dea_without_c_code`, `match_below_threshold`, `hys_without_com_reference`, `limite_metadata_only`, `not_yet_issued`; `source_unavailable` exists only in source health, never on a procedure.

## Derivation rules

| Rule | Link | Quality |
|---|---|---|
| R1 | Procedure number from three spellings | exact |
| R2 | EP document ↔ Cellar work (register notation) | exact |
| R3 | Have your say initiative ↔ procedure (COM or C number) | exact, else missing |
| R4 | Council document ↔ procedure (work in Cellar dossier) | official |
| R5 | Council document ↔ procedure and step meaning (PDF header, subject line) | high / medium |
| R6 | EP delegated-act procedure ↔ C number (title, basic act, date window) | high / medium |
| R7 | Delegated act ↔ basic act | exact |
| R8 | HowTheyVote vote ↔ EP vote event (only in `votes/`) | high |
| R9 | Legal act ↔ procedure (Cellar) | official |
| R10 | National implementing measure ↔ legal act (Cellar) | official |
| R11 | End of the scrutiny period of DEA/RPS | medium |

The measured quality of each rule is published with the rule when it is built.

## Reference cases

Twelve procedures in [`../../test/reference-cases/`](../../test/reference-cases/) are validated against this schema in CI: five fixed cases (AI Act 2021/0106(COD), Critical Medicines Act 2025/0102(COD), 2025/0360(COD), 2025/0359(COD), delegated act C(2026)4534) and seven drawn at random from the Module 1 scope (seed and draw in `index.json`). Each case has `procedure.json` (the document) and `expected.json` (values the later build steps must reproduce).

## Citation

Regesta (Berth): Procedure schema v0.1. https://regesta.io/schema/v0.1/. CC BY 4.0.
