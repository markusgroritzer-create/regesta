# Regesta

An open graph of EU legislative procedures. Regesta shows each procedure as one continuous record across the European Commission, the European Parliament and the Council of the EU. Every step has an official reference. Every link says where it comes from: official, derived (with rule and match quality) or missing (with a reason). Nothing is overwritten; every change is a dated entry.

Scope of Module 1: ordinary legislative procedures (COD), delegated acts (DEA) and regulatory procedures with scrutiny (RPS) with activity since 16 July 2024.

> **Status: pre-release (M0 scaffold).** This repository currently contains the published procedure schema v0.1, twelve reference cases as test data, licences, the contributor licence agreement and the CI checks. There is no data pipeline, API, MCP endpoint or website yet.

Regesta is an independent service by Berth. It is not an official publication and is not operated, endorsed or reviewed by any institution of the European Union. The institutions' original documents prevail; every entry links to them.

## Our commitment

Regesta data, the bulk export, the read API and the source code are free to use and accessible without an account. Future paid offerings will not change this.

- Data are licensed under CC BY 4.0, voting data under ODbL 1.0, code under AGPL-3.0. Anything once published remains usable under these licences; the CC BY licence is irrevocable.
- Berth never charges for access to data, only for add-on services that cause ongoing work or server costs, such as team alerts, higher rate limits with an availability commitment, or integrations.
- Fair-use rate limits per IP address apply to the API and MCP endpoint. The bulk export is unlimited and free.
- Should Berth discontinue the service, we will announce it here at least 90 days in advance and publish the last complete export and the code permanently under the same licences on Zenodo, with a DOI.

<details>
<summary>Unsere Zusage (Deutsch)</summary>

Die Daten von Regesta, der Bulk-Export, die lesende API und der Quellcode sind frei nutzbar und ohne Konto zugänglich. Daran ändern auch künftige bezahlte Angebote nichts.

- Die Daten stehen unter CC BY 4.0, die Abstimmungsdaten unter ODbL 1.0, der Code unter AGPL-3.0. Was einmal veröffentlicht ist, bleibt unter diesen Lizenzen nutzbar; die CC-BY-Lizenz ist unwiderruflich.
- Bezahlt wird bei Berth nie der Zugang zu Daten, sondern nur Zusatzleistungen, die laufend Arbeit oder Serverkosten verursachen, etwa Alarme für Teams, höhere Abruflimits mit Verfügbarkeitszusage oder Integrationen.
- Für API und MCP-Endpunkt gelten faire Abruflimits je IP-Adresse. Der Bulk-Export ist unbegrenzt und kostenlos.
- Sollte Berth den Dienst einstellen, kündigen wir das mindestens 90 Tage vorher hier an. Den letzten vollständigen Export und den Code veröffentlichen wir dann dauerhaft unter denselben Lizenzen bei Zenodo, mit DOI.

</details>

## Roadmap

- **Planned: implementing acts (comitology), Module 1.1**
- M0 Scaffold and schema (this version)
- M1 Ingestion: European Parliament and Cellar
- M2 Commission, delegated acts, Council, votes
- M3 Versioning, checks, data outputs (bulk export, API, data repository)
- M4 MCP endpoint and website
- M5 Alerts
- M6 Operations, security, launch

## Procedure schema v0.1

The data model is published as its own versioned specification under CC BY 4.0: [`schema/v0.1/`](schema/v0.1/README.md). It contains the JSON Schema of a procedure document, the identifier types with their normalisation rules, the step kinds and the reasons for gaps. The twelve reference cases in [`test/reference-cases/`](test/reference-cases/) are validated against it in CI.

## Licences

| What | Licence | File |
|---|---|---|
| Source code | GNU Affero General Public License v3.0 only (`AGPL-3.0-only`) | [`LICENSE`](LICENSE) |
| Procedure schema and reference cases | Creative Commons Attribution 4.0 International (`CC-BY-4.0`) | [`LICENSES/CC-BY-4.0.txt`](LICENSES/CC-BY-4.0.txt) |
| Data (graph, bulk export, data repository) | CC BY 4.0; sources © European Union, see `LICENSE-DATA` | [`assets/export/LICENSE-DATA`](assets/export/LICENSE-DATA) |
| Voting data (`votes/` in the bulk export only) | Open Database License 1.0, contents Database Contents License 1.0 | [`assets/export/votes/`](assets/export/votes/) |

Per-file licence information follows [REUSE](REUSE.toml) conventions.

## Contributing

Contributions need the contributor licence agreement in [`CLA.md`](CLA.md): post `I have read the CLA v1.0 and I agree` as a comment in your pull request. Details: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

Please report vulnerabilities privately, see [`SECURITY.md`](SECURITY.md). Security support: latest minor version.

## Manufacturer

Manuel Wechner, sole proprietor, trading as Berth · Berwang, Austria (full postal address will be added before the first release) · security@regesta.io · https://regesta.io

## Disclaimer

Regesta is an independent service by Berth. It is not an official publication and is not operated, endorsed or reviewed by any institution of the European Union. The institutions' original documents prevail; every entry links to them.

The European Commission and the Council of the European Union are not liable for any consequence stemming from the reuse of their documents in Regesta. The European Parliament is not responsible for this service.

CLA test
