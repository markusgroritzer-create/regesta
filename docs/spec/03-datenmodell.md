# Datenmodell des Graphen
- Datum: 2026-10-18 · Phase B H3-17
- Grundlagen: datenquellen.md (Abschnitte 2–6, Bruchstellen B1–B22), fuer-die-spezifikation.md (Funde 1–3, 5, 7), blocker.md (Auflagen 1, 3, 6, 7, 13), aerger.md [16], [19]
- Das Schema wird als eigene, versionierte Spezifikation veröffentlicht (02-modul-1.md A10). Diese Datei ist ihre Grundlage. Schemabeispiele in JSON und Tabellen, kein Produktcode.

## 1. Grundsätze

1. **Eine kanonische Kennung je Verfahren, alle anderen Schreibweisen und Fremdkennungen als Alias** (Fund 1; datenquellen.md B21).
2. **Jede Kante trägt ihre Herkunft:** `amtlich`, `abgeleitet` (mit Regel, Regelversion und Güte) oder `fehlt` (mit Grund). Lücken werden nicht still gefüllt (Fund 1; aerger.md 9.3).
3. **Nichts wird überschrieben.** Jede Aussage hat einen Gültigkeitszeitraum in der Beobachtungszeit; jede Änderung ist ein datierter Eintrag (Fund 5; selbstbau.md Abschnitt 3).
4. **Jeder Knoten und jede Kante trägt Quelle, URL, Abrufzeit und Lizenz** (Auflage 3).
5. **Personendaten nur im Mandatsbezug** (Auflage 7); keine Namen aus „Have your say“ (Auflage 6).

## 2. Kennungen

### 2.1 Kanonische Verfahrenskennung

| Verfahrensart | Kanonische Kennung | Slug für URLs | Begründung |
|---|---|---|---|
| COD | interinstitutionelle Verfahrensnummer in EP-Schreibweise `JJJJ/NNNN(COD)` | `2025-0102-cod` | gemeinsamer Schlüssel von EP, Cellar, HowTheyVote und Rats-PDF (datenquellen.md 3, B7) |
| DEA | C-Nummer der Kommission `C(JJJJ)NNNN` | `c-2026-4534` | Der delegierte Rechtsakt ist das Objekt. Er existiert bei der Kommission vor der Übermittlung ans EP, und die EP-Nummer fehlt im Register in 2.171 von 2.171 Fällen (B3). |
| DEA ohne zugeordnete C-Nummer | EP-Nummer `JJJJ/NNNN(DEA)` | `2026-2805-dea` | vorläufig; bei späterer Zuordnung Zusammenführung (2.3) |
| RPS | EP-Nummer `JJJJ/NNNN(RPS)` | `2025-2xxx-rps` | Kommissionsseite erst mit Modul 1.1 |

### 2.2 Alias-Tabelle

Jede Zeile ordnet eine Fremdkennung oder Schreibweise genau einer kanonischen Kennung zu, mit Herkunft.

| Alias-Typ | Beispiel | Quelle | Normalisierung | Herkunft der Zuordnung |
|---|---|---|---|---|
| `ep_proc` | `2025/0102(COD)` | EP-API `label`, HowTheyVote `procedure_reference` | kanonisch | amtlich |
| `cellar_proc` | `2025/0102/COD` | Cellar `procedure_code_interinstitutional_reference_procedure` | `/`→`(…)` | amtlich (R1) |
| `council_proc` | `2025/0102 (COD)` | Rats-PDF-Kopfzeile „Interinstitutional File“ | Leerzeichen entfernen | abgeleitet (R5) |
| `ep_proc_id` | `2025-0102`, `eli/dl/proc/2025-0102` | EP-API `process_id`, ELI-DL | Format | amtlich (R1) |
| `com` | `COM(2025)102` | Cellar, „Have your say“, Register der Kommissionsdokumente | ohne „final“, ohne führende Nullen | amtlich |
| `sec`, `swd` | `SWD(2021)84` | Cellar, „Have your say“ | wie COM | amtlich |
| `c_code` | `C(2026)4534` | Register delegierter Rechtsakte „CCode“, Cellar, „Have your say“ | wie COM | amtlich |
| `celex` | `32024R1689`, `52025PC0102` | Cellar, Register delegierter Rechtsakte | unverändert | amtlich |
| `eli` | `http://data.europa.eu/eli/reg/2024/1689/oj` | Cellar `resource_legal_eli` | unverändert | amtlich |
| `council_doc` | `ST 6872/25`, `WK 10885/25`, `CM …/26`, `PE-CONS 24/24` | Cellar-Werke im Dossier | `TYP NNNN/JJ [REV n]` | amtlich (Dossier) |
| `hys_initiative` | `14486` | „Have your say“ `id` | Zahl | abgeleitet (R3) |
| `ares` | `Ares(2025)813524` | „Have your say“ `reference`, Cellar-Werke | unverändert; **nicht eindeutig** (B8), daher nur als Alias einer Initiative, nie als Schlüssel | amtlich je Initiative |
| `hys_ref` | `PLAN/2025/243`, `ISC/2026/02379`, `PE/2026/3948` | „Have your say“ `referenceNumber` | unverändert | amtlich |
| `ep_register` | `P10_A(2025)0272` | EP-API `notation_publicRegister`, Cellar `ep:` | ↔ `A-10-2025-0272` | amtlich (R2) |
| `ep_doc` | `A-10-2025-0272`, `TA-10-2026-0001` | EP-API `eli/dl/doc/…` | unverändert | amtlich |
| `ep_event` | `MTG-PL-2026-01-20-VOT-ITM-981677` | EP-API Ereignis | unverändert | amtlich |
| `htv_vote` | `183050` | HowTheyVote `id` | Zahl | abgeleitet (R8); **nur in der Abstimmungs-Teildatenbank `votes/` (ODbL), nie in der CC-BY-Alias-Tabelle** (Trennregel 06-recht.md Auflage 1) |
| `geda` | `GEDA/A/(2024)000753` | OEIL (nur Kennung, Link) | unverändert | amtlich |
| `mne` | `MNE(2022)05537` | Cellar-NIM | unverändert | amtlich |

Die Normalisierungsregeln sind Teil des veröffentlichten Schemas. Eine Kennung, die zwei Verfahren zugeordnet würde, wird nicht aufgelöst, sondern als mehrdeutig markiert (API-Antwort `ambiguous` mit beiden Kandidaten).

### 2.3 Zusammenführung und stabile URLs

Wird ein EP-DEA-Verfahren nachträglich einer C-Nummer zugeordnet, entsteht kein neuer Datensatz, sondern ein Versionseintrag „zusammengeführt“: Die C-Nummer wird kanonisch, die EP-Nummer bleibt Alias, und die alte URL leitet dauerhaft mit 301 weiter. Eine einmal veröffentlichte URL liefert nie 404 (Zitierfähigkeit, Fund 9).

## 3. Knoten

| Knotentyp | Pflichtfelder | Beispiel |
|---|---|---|
| `procedure` | `id`, `type` (COD/DEA/RPS), `title`, `status`, `institution_leads` (DG, EP-Ausschüsse als Liste `ep_committees`, weil gemeinsam federführende Ausschüsse vorkommen; entscheidungen.md, Entscheidung 21.10.2026 V6) | `2025/0102(COD)` |
| `step` | `id`, `procedure`, `institution` (commission/parliament/council), `kind` (kontrolliertes Vokabular, Anhang A), `date`, `date_precision` | EP-Ereignis „Trilog“ 2026-02-02 |
| `document` | `id` (kanonische Dokumentkennung), `institution`, `doc_type`, `date`, `url`, `access` (`public` / `limite` / `not_public`) | `ST 10713/26`, `access: limite` |
| `legal_act` | `celex`, `eli`, `oj_ref`, `dates` (Inkrafttreten, Geltung, Umsetzungsfrist) | `32024R1689` |
| `consultation` | `hys_initiative`, `phase` (Call for evidence, öffentliche Konsultation, Entwurf zur Rückmeldung), `start`, `end`, `feedback_count`, `url` | Initiative 14486 |
| `vote` | `htv_vote`, `date`, `result` (Ja/Nein/Enthaltung), `is_main`, `texts_adopted_ref` – **nur in der Teildatenbank** | 183050 |
| `deadline` | `procedure`, `kind`, `date`, Herkunft wie Kanten | Ende Rückmeldefrist |
| `actor` | `id`, `kind` (institution, committee, dg, council_configuration, mep) | Ausschuss ENVI |
| `mep` (Untertyp von `actor`) | nur `ep_person_id`, Name, Fraktion, nationale Partei, Funktion | Berichterstatterin |
| `nim` | `mne`, `member_state`, `celex`, `date_notified` | `MNE(2022)05537` |
| `gap` | `procedure`, `institution`, `kind`, `reason`, `since` | „Ratsabstimmung nicht maschinenlesbar“ |
| `run` | `id`, `started`, `finished`, `sources` (Status je Quelle), `checksum` | Lauf 2026-10-18T05:00Z |

**Personendaten (Auflage 7):** `mep` enthält nur Name, Fraktion, nationale Partei, Funktion und Rolle im Verfahren; Abstimmungen nur als Gesamtergebnis, keine Einzelstimmen (E10, Bauregel B3-1 in 06-recht-anwaltsfragen.md). Nicht übernommen werden Geburtsort und -datum, Assistenten, E-Mail, soziale Netzwerke, persönliche Websites, Fotos (blocker.md C5; datenquellen.md 2.13). Personen aus „Have your say“ erscheinen überhaupt nicht, auch nicht als Zahl je Person; nur `feedback_count` je Konsultation (Auflage 6; recht-eu-policy-monitor.md Nr. 3).

## 4. Kanten und Herkunft

### 4.1 Kantentypen

| Kante | von → nach | typische Herkunft |
|---|---|---|
| `has_step` | procedure → step | amtlich (EP-API, Cellar, HYS) |
| `has_document` | procedure/step → document | amtlich (Cellar-Dossier, EP-API) oder abgeleitet (R5) |
| `has_consultation` | procedure → consultation | abgeleitet (R3) |
| `produces` | procedure → legal_act | amtlich (Cellar `dossier_produces_resource_legal`, R9) |
| `delegated_under` | procedure (DEA) → legal_act (Basisrechtsakt) | abgeleitet (R7) |
| `same_as` | procedure (EP-DEA) → procedure (C-Nummer) | abgeleitet (R6) |
| `vote_on` | vote → step (EP-Abstimmungsereignis) | abgeleitet (R8) |
| `implements` | nim → legal_act | amtlich (Cellar-NIM, R10) |
| `role_in` | mep/actor → procedure | amtlich (EP-API `had_participation`) |
| `amends` | legal_act → legal_act | amtlich (Cellar) |
| `has_deadline` | procedure → deadline | amtlich oder abgeleitet (R11) |

### 4.2 Herkunftsfelder je Kante (und je Knoten)

```json
{
  "edge": "same_as",
  "from": "2026/2805(DEA)",
  "to": "C(2026)4534",
  "provenance": {
    "status": "derived",
    "rule": "R6",
    "rule_version": "1.0",
    "quality": "high",
    "score": 0.955,
    "evidence": ["title_similarity=0.955", "basic_act=Directive (EU) 2024/2841", "referral_within_window=true"]
  },
  "sources": [
    {"source": "ep_api", "url": "https://data.europarl.europa.eu/api/v2/procedures/2026-2805", "retrieved": "2026-10-18T05:12:44Z",
     "license": "CC-BY-4.0", "legal_basis": "EP Bureau decision 16.12.2024, OJ C/2025/341, Art. 4"},
    {"source": "regdel", "url": "https://webgate.ec.europa.eu/regdel/", "retrieved": "2026-10-13T04:02:10Z",
     "license": "LicenseRef-EC-Decision-2011-833", "legal_basis": "Decision 2011/833/EU with C(2019) 1655 Art. 1 (CC BY 4.0)"}
  ],
  "license": "CC-BY-4.0",
  "modified": true,
  "valid_from": "2026-10-18T05:30:00Z",
  "valid_to": null
}
```

`status` ist genau einer von:
- `official`: Die Verknüpfung steht so in einer amtlichen Quelle (z. B. Werk im Cellar-Dossier).
- `derived`: Berth hat die Verknüpfung nach einer veröffentlichten Regel hergestellt. Pflichtfelder `rule`, `rule_version`, `quality` (`exact` / `high` / `medium`), `evidence`.
- `missing`: Die Verknüpfung müsste existieren, ist aber nicht belegbar. Pflichtfeld `reason` (Code, Anhang B). Beispiel: Ratsschritt zwischen Trilog-Einigung und EP-Billigung (B13).

Treffer mit Güte `low` werden **nicht** als Kante veröffentlicht. Sie erscheinen als `missing` mit Grund `match_below_threshold` und den Kandidaten nur in der API-Antwort `candidates` (für Prüfer, nicht im Graphen).

### 4.3 Regelkatalog für abgeleitete Kanten

Jede Regel ist versioniert und öffentlich beschrieben. Ihre Güte wird im Bau an einer handgeprüften Stichprobe gemessen und mit der Regel veröffentlicht (Abnahme in 08-modulplan.md).

| Regel | Zweck | Verfahren | Güte | Beleg |
|---|---|---|---|---|
| R1 | Verfahrensnummer aus drei Schreibweisen normalisieren | Formatregel | exact | B21 |
| R2 | EP-Dokument ↔ Cellar-Werk | Registernotation `P10_A(2025)0272` ↔ `A-10-2025-0272` | exact | datenquellen.md 1.2, Fall 2 |
| R3 | „Have your say“-Initiative ↔ Verfahren | COM- bzw. C-Nummer in `publications[].reference` = Werk im Cellar-Dossier; Ares nur ergänzend, weil mehrdeutig | exact, wenn COM/C vorhanden; sonst missing | B7, B8; Fall 1–3 |
| R4 | Ratsdokument ↔ Verfahren | Werk im Cellar-Dossier | official | datenquellen.md Fall 2 |
| R5 | Ratsdokument ↔ Verfahren und Schrittbedeutung | Kopfzeile „Interinstitutional File: JJJJ/NNNN (COD)“ auf Seite 1 des PDFs; Schrittbedeutung nur aus Betreff-Mustern (z. B. „General approach“) | high (Kennung), medium (Bedeutung) | B13, B17 |
| R6 | EP-DEA ↔ C-Nummer | Titelähnlichkeit **und** Nummer des Basisrechtsakts im Titel **und** Datumsfenster (Annahme durch die Kommission vor REFERRAL, höchstens 30 Tage; Einschätzung, im Bau zu messen) | high: alle drei; medium: zwei, darunter Basisrechtsakt; sonst low (nicht veröffentlicht) | B1, B2 (Titel allein: 0/141 exakt, 18/141 ≥ 0,95) |
| R7 | DEA ↔ Basisrechtsakt | Rechtsaktnummer aus dem Text „Basic legislative act“ parsen, über Cellar zu CELEX auflösen, über R9 zum Verfahren | exact bei eindeutigem Parse | B4 |
| R8 | HowTheyVote-Abstimmung ↔ EP-Abstimmungsereignis | gleiches Verfahren **und** gleicher Sitzungstag **und** Bericht bzw. angenommener Text (`reference`, `texts_adopted_reference`) | high | B16 |
| R9 | Rechtsakt ↔ Verfahren | Cellar `dossier_produces_resource_legal` | official | datenquellen.md 2.3 |
| R10 | NIM ↔ Rechtsakt | Cellar `measure_national_implementing_implements_resource_legal` | official | datenquellen.md 2.12 |
| R11 | Ende der Kontrollfrist DEA/RPS | Übermittlungsdatum + Frist laut Ermächtigungsartikel des Basisrechtsakts; ohne belegte Frist Anzeige „Regelfrist nicht bestätigt“ | medium | Register „Empowerment article“ (datenquellen.md 2.5) |

Gegen den EU Law Tracker wird nur geprüft (Stichprobe der COD-Verläufe), nicht übernommen (Auflage 13).

## 5. Versionierung

Jede Aussage im Graphen (Knoten, Kante, Attribut) ist ein Eintrag mit zwei Zeitachsen:

| Feld | Bedeutung |
|---|---|
| `event_date` | Datum des Geschehens laut Quelle (z. B. Trilog am 2026-02-02) |
| `valid_from` | Lauf, in dem Berth die Aussage zuerst beobachtet hat |
| `valid_to` | Lauf, in dem die Aussage nicht mehr beobachtet wurde (sonst leer) |
| `run` | Kennung des Laufs, der die Aussage erzeugt hat |
| `supersedes` | Eintrag, den diese Aussage ablöst (z. B. korrigiertes Datum) |

Daraus folgt:
- „Änderungen seit Datum“ ist eine Abfrage über `valid_from`/`valid_to`, nicht über `event_date`. Eine Quelle, die ein altes Ereignis nachträgt, erscheint als Änderung mit dem Beobachtungsdatum.
- **Eine ausgefallene Quelle beendet keine Aussage.** `valid_to` wird nur gesetzt, wenn die Quelle erfolgreich abgerufen wurde und die Aussage nicht mehr enthält. Ein Ausfall erzeugt einen Eintrag in der Quellengesundheit, keinen Eintrag im Verfahren (Fund 4).
- **Löschen an der Quelle:** Sachaussagen werden mit `valid_to` und dem Änderungstyp „an der Quelle entfernt“ beendet, bleiben aber in der Historie. **Personendaten**, die an der Quelle gelöscht werden, werden auch aus der Historie entfernt (Auflage 7; Ausnahme vom Grundsatz „nichts wird überschrieben“, dokumentiert als Versionseintrag ohne Inhalt).
- Rohantworten jeder Quelle werden je Lauf unverändert und mit Prüfsumme abgelegt (05-architektur.md), damit jede Aussage auf die Rohdaten zurückführbar ist.

Änderungstypen (kontrolliertes Vokabular): `step_added`, `document_added`, `status_changed`, `deadline_added`, `deadline_changed`, `vote_added`, `edge_added`, `edge_corrected`, `identifier_added`, `merged`, `removed_at_source`.

## 6. Lizenzfeld

Jeder Knoten und jede Kante trägt `license` (Auflage 3) und `sources[]` mit eigener Lizenz. Werte:

| Wert | Bedeutung | Rechtsgrundlage (blocker.md) |
|---|---|---|
| `CC-BY-4.0` | EP-Open-Data; Kommissionsdokumente nach C(2019) 1655; eigene Ableitungen von Berth (Feld `modified: true`, weil CC BY das Kennzeichnen von Änderungen verlangt) | C/2025/341 Art. 4 [2]; C(2019) 1655 Art. 1 [33] |
| `CC0-1.0` | EUR-Lex-/Cellar-Metadaten | EUR-Lex-Rechtshinweis [51]; C(2019) 1655 Art. 2 [33] |
| `LicenseRef-EC-Decision-2011-833` (immer mit `CC-BY-4.0`) | Kommissionsdokumente ohne eigene Lizenzangabe (Register delegierter Rechtsakte, „Have your say“) | 2011/833/EU Art. 2 Abs. 1 lit. a, Art. 4 [1]; Auflage 13 |
| `LicenseRef-Council-Decision-2017-1842` | Ratsdokumente (nur Kennung, Datum, Kopfzeile) | 2017/1842 Art. 4, 6 [3] |
| `ODbL-1.0` (Inhalte `DbCL-1.0`) | HowTheyVote-Abstimmungen, nur in der Teildatenbank | ODbL § 4.4, 4.5 a [13]; Entscheidung 1 |

Der Graph als Ganzes steht unter CC BY 4.0 (Entscheidung 1). Die Abstimmungen liegen in einer getrennten Teildatenbank unter ODbL/DbCL (Auflage 1 Weg b). Weil nur `votes.csv` übernommen wird, ist sie nicht „unverändert“, sondern eine gefilterte, abgeleitete Datenbank (Derivative Database); sie steht selbst unter ODbL, der Graph daneben bleibt nach ODbL § 4.5 a CC BY (06-recht.md Auflage 1; Restfrage Anwalt Nr. 2). Getrennt heißt: eigene Dateien im Export, eigener Endpunkt `/votes`, eigenes Lizenzfeld, keine Vermischung in den CC-BY-Tabellen. Die Kante R8 (Abstimmung ↔ EP-Ereignis) liegt in der Teildatenbank.

## 7. Export-Tabellen (Auszug des Schemas)

| Datei | Zeile je | Schlüssel |
|---|---|---|
| `procedures` | Verfahren | `id` |
| `identifiers` | Alias | `alias_type`, `alias` |
| `steps` | Schritt | `id` |
| `documents` | Dokument | `id` |
| `edges` | Kante mit Herkunft | `id` |
| `deadlines` | Frist | `id` |
| `legal_acts`, `nim` | Rechtsakt, Umsetzungsmaßnahme | `celex`, `mne` |
| `history` | Versionseintrag | `id` |
| `gaps` | Lücke | `id` |
| `runs` | Lauf mit Quellengesundheit | `id` |
| `votes/votes`, `votes/vote_links` | Abstimmung, Kante R8 (ODbL-Teil) | `htv_vote` |

## Anhang A: Schrittarten (Auszug, kontrolliertes Vokabular)

Kommission: `planned`, `call_for_evidence`, `public_consultation`, `draft_for_feedback`, `proposal_adopted`, `swd_published`, `delegated_act_adopted`, `transmitted`. Parlament: `referral`, `committee_report_tabled`, `plenary_debate`, `plenary_vote`, `trilogue`, `committee_approves_agreement`, `objection_tabled`, `objection_vote`. Rat: `council_document`, `general_approach` (abgeleitet), `coreper_confirmation` (abgeleitet), `council_adoption` (nur mit Fundstelle). Nach Annahme: `signed`, `published_oj`, `entered_into_force`, `transposition_deadline`, `nim_notified`. Die EP-Ereignistypen (`had_activity_type`) werden 1:1 abgebildet und in der Schemadatei gemappt.

## Anhang B: Gründe für fehlende Kanten (`reason`)

`council_votes_not_machine_readable` (B9), `cellar_lag` (B13), `ep_dea_without_c_code` (B1), `match_below_threshold` (B2), `hys_without_com_reference` (B7), `limite_metadata_only` (datenquellen.md 2.6), `source_unavailable` (nur in der Quellengesundheit, nie am Verfahren), `not_yet_issued` (z. B. CRE-Protokoll, B20).
