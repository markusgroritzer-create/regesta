# Architektur
- Datum: 2026-10-18 · Phase B H3-17
- Grundlagen: fuer-die-spezifikation.md Funde 1, 4, 6, 7; aerger.md 1.2, 9.1–9.3, 9.8, [50]; datenquellen.md 2.1 (Drosselung), B2, B13; blocker.md Auflagen 3, 7, 8, 11; kanaele.md 1.4 [41], [42]; v3/07-angriffsachsen/h3-17-eu-policy-monitor.md Punkt 5; projektanweisung.md Entscheidungen 1–4; Preise: rohnotizen/preise-hosting.md (Anbieterangaben, Stand 2026-10-18)
- Kriterium für jede Wahl: **Einfachheit und Betreibbarkeit durch eine Person.** Varianten und Gründe: entscheidungen.md.

## 1. Überblick

```
                 geplante Läufe (täglich 03:00 UTC, wöchentlich Montag)
 Quellen Q1–Q8 ──► [1 Abruf] ──► Rohablage (unverändert, Prüfsumme)
                                   │
                                   ▼
                    [2 Normalisieren] ─► [3 Kennungen auflösen] ─► [4 Regeln R1–R11]
                                   │
                                   ▼
                    [5 Abgleich mit Vorstand] ─► Graph-Speicher (SQLite, nur anhängen)
                                   │
                         [6 Prüfen: Invarianten, Plausibilität]
                                   │  bestanden
                                   ▼
                    [7 Veröffentlichen: Ausgabe-Snapshot]
          ┌──────────┬──────────┬──────────┬──────────┬─────────┬──────────┐
     statische   Ausgabe-DB   Bulk-Export  Feeds/ICS  Daten-Repo  Änderungs-
      Seiten     (nur lesen)   CSV/JSONL               (Git)       satz
          │          │                                                │
        Caddy    API + MCP + Suche  ◄── Nutzer, Agenten               │
                                                                      ▼
                                  Alarmdienst (eigener Server) ◄── nur öffentliche API
```

Zwei Server, ein Code-Repository für den Kern, ein Daten-Repository. Kein Baustein des Kerns speichert Personendaten von Nutzern; der Alarmdienst ist der einzige Baustein mit Zustand und Personendaten (Abschnitt 6).

**Sprache und Laufzeit:** TypeScript auf Node.js (beim Baubeginn aktuelle LTS-Linie) für alle Bausteine. Grund: Die übernehmbaren Bausteine (Hack23, cyanheads) und das offizielle MCP-SDK sind TypeScript; eine Sprache für Ingestion, API, MCP und Seiten senkt den Aufwand für eine Person (entscheidungen.md E5).

## 2. Ingestion

### 2.1 Läufe
| Lauf | Zeit | Inhalt | erwartete Dauer (Einschätzung) |
|---|---|---|---|
| täglich | 03:00 UTC | Q1 laufende Verfahren, Q2, Q3, Q5 (neue Ratsdokumente), Q6 `last_updated.txt` | 1–2 h, bestimmt durch die EP-Drosselung |
| wöchentlich | Montag 03:00 UTC, vor dem Tageslauf | Q1 abgeschlossene Verfahren, Q4 Excel-Export, Q6 Export (falls neu), Q7 NIM | + 1 h |
| monatlich | 1. des Monats | Q8 Transparenzregister (nur Domain → Kategorie) | 10 min |

Jede Quelle hat ihren eigenen Abrufer mit eigener Drosselung (04-datenquellen.md). Abrufer laufen nacheinander, nie parallel gegen dieselbe Quelle.

### 2.2 Drosselung und Wiederholung
- **EP-API:** höchstens ein Abruf je 2 s und 100 je 5 Minuten (dokumentiert 500 je 5 Minuten; Burst-Grenze beobachtet nach rund 66 schnellen Abrufen, datenquellen.md 2.1 [3], blocker.md B1). Bei 429 wird mindestens `Retry-After` gewartet, danach mit halbem Tempo weiter. Zeitlimit 120 s (aerger.md 1.2). Listenabfragen immer nach Art und Jahr geteilt (10.000er-Fenster, B2).
- **Alle Quellen:** drei Versuche mit wachsender Wartezeit (z. B. 30 s, 2 min, 10 min); danach Quelle für diesen Lauf „teilweise“ (einige Objekte fehlen) oder „nicht abrufbar“ (nichts kam). Die fehlenden Objekte behalten ihren letzten Stand.
- **Bot-Prüfung, 403, HTTP 202 ohne Inhalt:** sofortiger Abbruch für diese Quelle, Status „nicht abrufbar“, kein Umgehungsversuch (aerger.md 1.1; Auflage 8).

### 2.3 Rohablage und Snapshots
- Jede Rohantwort wird unverändert, komprimiert und mit SHA-256 unter `raw/{quelle}/{lauf}/` abgelegt. Gleiche Prüfsumme wie im Vorlauf → nur Verweis. Ausnahme: Rats-PDFs werden nicht abgelegt, nur Prüfsumme und extrahierte Kopfzeilen (04-datenquellen.md Q5).
- Ein **Lauf** (`run`) ist die Einheit der Versionierung: Jede Aussage im Graphen zeigt auf den Lauf, der sie erzeugt oder beendet hat (03-datenmodell.md Abschnitt 5).
- Nutzeranfragen gehen nie an die Quellen, nur an den jüngsten veröffentlichten Snapshot (Fund 4; aerger.md 9.2).

### 2.4 Prüfen vor dem Veröffentlichen
1. **Invarianten** (Lauf schlägt fehl, wenn verletzt): jede Kante hat `provenance` und `license`; jede abgeleitete Kante hat Regel und Güte; kein Feld außerhalb der Positivliste für Personen (Auflage 7); jede kanonische Kennung ist eindeutig; jede früher veröffentlichte URL ist auflösbar.
2. **Plausibilität** (Veröffentlichung wird angehalten, Betreiber prüft): mehr als 5 % der Aussagen würden beendet; mehr als 50 Verfahren wechseln den Status; eine Quelle liefert weniger als 80 % der Objekte des Vorlaufs ohne Fehlercode (Schwellen sind Einschätzung, im Bau einstellen). Schutz gegen Quellenfehler, die sonst als Massenänderung bei allen Alarm-Empfängern landen.
3. Bestanden → Veröffentlichung. Nicht bestanden → der vorige Snapshot bleibt online, die Statusseite zeigt „Veröffentlichung angehalten“.

### 2.5 PDF-Auswertung isoliert
Die Rats-PDFs sind die einzige fremde Binärdatei im System. Ihre Auswertung läuft in einem eigenen Unterprozess ohne Netz, mit Zeit- und Speichergrenze, nur Seite 1, nur Text. Fällt er aus, wird das Dokument als „Kopfzeile nicht lesbar“ geführt.

## 3. Quellengesundheit

Je Lauf und Quelle werden gespeichert: Status (`ok` / `partial` / `unavailable`), Zahl der Abrufe, Fehlercodes, Antwortzeiten (Median, 95. Perzentil), Zahl der Objekte, Zeit des letzten Erfolgs. Daraus entstehen:
- die Statusseite `/status` und `GET /v1/sources` (02-modul-1.md A9);
- im Kopf jeder Verfahrensseite und in jeder API-/MCP-Antwort der Quellenstand je Institution („Parlament: geprüft 2026-10-18 05:12 UTC“).

Regel: Ein Ausfall erzeugt nie eine Änderung am Verfahren und nie einen Alarm. Er erzeugt nur einen Eintrag in der Quellengesundheit. „Nicht abrufbar“ wird nie als „nichts passiert“ dargestellt (aerger.md [9]; Fund 4).

Die über Wochen gesammelten Messwerte sind zugleich Material für eine Auswertung zur Erreichbarkeit amtlicher Quellen (ideen-parkplatz.md; 09-inbound-und-messung.md).

## 4. Speicher

**SQLite**, eine Datei für den Graphen, nur anhängend (Aussagen mit `valid_from`/`valid_to`), WAL-Modus. Aus ihr erzeugt jede Veröffentlichung eine **Ausgabe-DB**: eine schreibgeschützte SQLite-Datei mit dem jüngsten Stand und den Indizes für API, MCP und Suche (Volltext über SQLite FTS5 auf Titeln und Kennungen). API und MCP öffnen nur die Ausgabe-DB; der Wechsel auf einen neuen Snapshot ist ein atomarer Austausch eines Verweises.

Begründung: Die Datenmenge ist klein (einige tausend Verfahren, Zehntausende Schritte und Kanten, Einschätzung); SQLite braucht keinen Datenbankserver, keine Wartung, lässt sich als Datei sichern, prüfen und weitergeben. Verworfen: PostgreSQL (zusätzlicher Dienst ohne Gewinn bei dieser Größe), Graphdatenbanken (Betrieb, Lizenz, Lernaufwand), RDF-Triplestore (Cellar ist RDF, aber Abfragen und Betrieb sind für eine Person zu schwer), Git als Datenbank (Abschnitt 8). Einzelheiten: entscheidungen.md E4.

## 5. Ausgaben

| Baustein | Umsetzung |
|---|---|
| **Statische Seiten** | Der Veröffentlichungsschritt rendert je Verfahren eine HTML-Datei und die Textseiten; Caddy liefert sie aus. Kein Client-Framework; ein Copy-Skript ≤ 5 kB (07-design.md). Alias-URLs als 301-Weiterleitungen aus der Alias-Tabelle. |
| **Suche** | Ein serverseitiger Endpunkt im API-Prozess rendert die Ergebnisliste als HTML (Startseite) bzw. JSON (API) aus der Ausgabe-DB. |
| **REST-API** | Ein Node-Prozess, nur lesend auf der Ausgabe-DB; OpenAPI 3.1 als Datei im Repo und unter `/v1/openapi.json`; `ETag` = Snapshot-Kennung; Fair-Use-Grenze 60 Anfragen je Minute und IP, Burst 20 (Einschätzung), Antwort 429 mit `Retry-After`. Keine Schlüssel, kein Konto. |
| **MCP-Endpunkt** | Im selben Prozess unter `/mcp`, offizielles TypeScript-SDK, Transport Streamable HTTP, zustandslos: keine Sitzungskennung (`Mcp-Session-Id`), damit nichts im Endgerät gespeichert wird (06-recht.md 5.0). Vier Werkzeuge mit `title` und `readOnlyHint: true` (02-modul-1.md Abschnitt 4). Antwortgröße wird vor dem Senden geprüft und auf die Zielgröße gekürzt (Blättern statt Abschneiden; aerger.md [50]). Grenze 30 Werkzeugaufrufe je Minute und IP. Dazu: Datenschutzerklärung und Doku unter festen URLs (Claude-Verzeichnis, kanaele.md 1.4 [41], [42]). Dasselbe Paket erscheint auf npm für den lokalen Betrieb; lokal fragt es die öffentliche API ab, nie die Quellen. |
| **Bulk-Export** | Wöchentlich (Montag nach dem Lauf) und als „latest“ täglich: CSV je Tabelle und JSON-Lines, gezippt, mit README (Schema, Attribution, Zitierzeile, Lizenzen), Prüfsummen-Datei. Abstimmungen in `votes/` mit eigener LICENSE (ODbL/DbCL). Auslieferung als statische Dateien über Caddy; Archiv der Wochenstände im Object Storage. |
| **Atom, ICS** | Je Verfahren als statische Datei; Gesamtfeed; ICS-Sammel-URL dynamisch aus der Ausgabe-DB (höchstens 50 Kennungen). |
| **Änderungssatz** | Je Veröffentlichung eine JSON-Datei mit allen Änderungen des Laufs; gleichzeitig über `GET /v1/changes` abfragbar. Der Alarmdienst nutzt ausschließlich die öffentliche API. |

## 6. Alarmdienst (einziger Baustein mit Zustand und Personendaten)

### 6.1 Abgrenzung
- **Eigener Server** (kleinste Größe), eigene Subdomain `watch.‹domain›`, eigenes Systemkonto, eigene Datenbankdateien. Grund: Der Kernserver verarbeitet fremde Dateien (Rats-PDFs) und ist öffentlich stark belastet; Personendaten liegen deshalb physisch getrennt (entscheidungen.md E11).
- Der Alarmdienst liest den Kern **nur über die öffentliche API** (`/v1/changes`, `/v1/procedures`). Damit ist er zugleich der erste Prüfstein für die Grenze, die später Modul 2 einhält (Abschnitt 7).

### 6.2 Datenhaltung (zwei getrennte Dateien)
| Datei | Inhalt | Kein Inhalt |
|---|---|---|
| `subscribers.db` | E-Mail-Adresse, Status (`pending` / `active`), Bestätigungs- und Abmeldetoken (nur als Hash), gemerkte Verfahren (≤ 10), Zweck (`watch` / `interest:H2|H3|H4`), Anlagedatum (nur Tag), Datum der Bestätigung (nur Tag) | IP-Adresse, Browserdaten, Klickverhalten, Organisationstyp |
| `events.db` | Tabellen `hint_clicks`, `hint_signups` und Zähler `org_type_counts` (10-offen-bezahlt-grenze.md Abschnitt 4); Einträge zu Aktionen mit Adresse nur mit Kalenderwoche und ohne Verfahren | Adresse, Domain, IP, Token, jede gemeinsame Kennung mit `subscribers.db` |

Die Organisationstyp-Ableitung aus der Domain läuft im Speicher bei der Bestätigung; geschrieben wird nur ein Zähler je `{week, spot, org_type}` (06-recht.md 5.0).

### 6.3 Abläufe
1. **Eintragen:** Hinweis-Link → Formularseite (Klick wird als `click` protokolliert) → Adresse abschicken (`submitted`). Schutz gegen Missbrauch ohne Fremd-Captcha: verstecktes Feld, Grenze je IP im Speicher (nicht gespeichert), höchstens drei offene Bestätigungen je Adresse.
2. **Double-Opt-in:** Eine Mail mit Bestätigungslink. Der Link öffnet eine Seite mit Knopf; erst der Knopf (POST) bestätigt. So lösen Link-Scanner von Mailprogrammen keine Bestätigung aus. Danach `confirmed` im Protokoll (nur Woche und Stelle) und Zähler für den Organisationstyp.
3. **Änderungserkennung:** Täglich nach der Veröffentlichung (spätestens 06:30 Brüssel) fragt der Alarmdienst `/v1/changes?since=<letzter Stand>&ids=<alle gemerkten Verfahren>` ab und filtert die alarmrelevanten Änderungsarten (02-modul-1.md Abschnitt 5).
4. **Versand:** 07:00 Brüssel eine Sammelmail je Adresse, nur wenn es Änderungen gibt; Text- und schlichte HTML-Fassung; je Änderung eine Zeile mit Fundstelle und Link; keine Zählpixel, keine umgeleiteten Links; im Fuß jeder Mail die Impressumzeile (Medieninhaber, Anschrift, Link zur Offenlegung; MedienG § 24 Abs. 3, 06-recht.md 13.1); **kein Hinweis auf Modul 2 oder „Für Organisationen“ in Alarm- und Bestätigungsmails**, sonst wären sie Direktwerbung (TKG 2021 § 174 Abs. 3, 06-recht.md 5.3). Versand über einen Transaktionsmail-Dienst in der EU mit Auftragsverarbeitungsvertrag (Vorschlag Brevo: Free-Plan 300 Mails/Tag, Hosting in FR/BE, List-Unsubscribe-Header laut Hilfe auch bei Transaktionsmails; Alternative Mailjet; Anbieterangaben, rohnotizen/preise-hosting.md). SPF, DKIM, DMARC auf der Absenderdomain. Der Mail-Anbieter wird erst nach Prüfung von Auftragsverarbeitungsvertrag und Unterauftragsverarbeitern (keine außerhalb der EU) gewählt (06-recht.md 5.3).
5. **Abmelden mit einem Klick:** Link in jeder Mail und Header `List-Unsubscribe` plus `List-Unsubscribe-Post` (RFC 8058). Abmelden löscht die Adresse sofort; ein Verfahren einzeln entfernen geht über einen zweiten Link.
6. **Interesse für Organisationen (H2–H4):** gleicher Ablauf ohne Versand von Alarmen; die Adresse bekommt genau eine Nachricht, wenn Modul 2 startet.

### 6.4 Löschfristen
| Was | Wann gelöscht |
|---|---|
| unbestätigte Adresse | 7 Tage nach Anlage |
| Adresse nach Abmeldung | sofort |
| Beobachtung eines abgeschlossenen Verfahrens | 30 Tage nach Abschluss; Hinweis in der letzten Mail |
| Adresse ohne verbleibende Beobachtung | sofort |
| Interesse-Adresse | nach der einen Nachricht zum Start von Modul 2, spätestens beim Abbruch der Sonde |
| Sicherungen von `subscribers.db` | Aufbewahrung 7 Tage, damit gelöschte Adressen binnen 7 Tagen auch aus Sicherungen verschwinden |
| `events.db` | Rohdaten bis 12 Monate nach dem Stichtag, danach nur Aggregate |
| Server-Protokolle mit IP (beide Server) | 7 Tage, danach nur Zählungen je Seite, Tag, Referrer-Domain |

Rechtsgrundlagen und Datenschutzerklärung: 06-recht.md. Daneben vor dem Start: Auftragsverarbeitungsverträge mit Hetzner (Server, Object Storage, Storage Box) und dem Mail-Anbieter (Art. 28 DSGVO), Verzeichnis der Verarbeitungstätigkeiten (Art. 30, Pflicht wegen der Abstimmungsdaten), Kurz-Datenschutz-Folgenabschätzung (06-recht.md 5.3).

## 7. Grenze zwischen Kern und Komfortschicht

- Die Komfortschicht (Modul 2) ist ein **eigener Prozess** in einem **eigenen, nicht offenen Repository**. Sie bindet keinen Code des Kerns ein (keine Abhängigkeit, kein Import, keine gemeinsame Datenbank).
- Sie nutzt den Kern **nur** über die öffentliche API (ggf. mit einem Schlüssel für höhere Grenzen) oder den öffentlichen Export.
- Braucht Modul 2 eine Änderung am Kern, wird sie im offenen Kern gebaut und veröffentlicht.
- Damit bleibt der Kern AGPL-3.0 und die Komfortschicht unberührt von AGPL § 13 (rechtliche Prüfung und Restfragen: 06-recht.md, Abschnitt AGPL-Grenze; blocker.md C9).
- Prüfbar ist die Grenze schon in Modul 1: Der Alarmdienst hält sie ein (Abschnitt 6.1).

## 8. Prüfung: „EU-Verfahren als Git-Repository“ (v3/07 Punkt 5)

**Vorschlag aus v3/07:** je Verfahren eine versionierte Datei, Änderungen als Commits.

| Rolle | Bewertung |
|---|---|
| Git als **Speicher und Quelle der Wahrheit** | **Verworfen.** (1) „Änderungen seit Datum“ über tausende Dateien ist mit Git-Historie langsam und umständlich; SQLite mit `valid_from`/`valid_to` beantwortet es mit einem Index. (2) Personendaten, die an der Quelle gelöscht werden, müssen auch aus der Historie verschwinden (Auflage 7); in Git heißt das Historie umschreiben und alle Klone brechen. (3) Zusammenführungen von Verfahren (03-datenmodell.md 2.3) sind in Git Dateiumbenennungen ohne Semantik. |
| Git als **Verbreitungs- und Sichtschicht** | **Gewählt.** Der Veröffentlichungsschritt schreibt täglich je Verfahren eine JSON-Datei (`procedures/cod/2025/2025-0102-cod.json`) in ein öffentliches Daten-Repository und committet den Änderungssatz mit sprechender Nachricht. Wöchentlich ein Tag (Release ohne Export-Anhang). Der vollständige Bulk-Export mit Namen liegt nur auf den eigenen Servern in Deutschland. |

Gründe für die Verbreitungsschicht: Änderungen werden ohne Werkzeug sichtbar (Diff je Verfahren); Forks, Sterne und Abhängigkeiten sind messbar (09-inbound-und-messung.md); das Repository ist ein kostenloser zweiter Verteilweg und zusätzliche Sicherung; Releases lassen sich mit einer DOI verbinden (kanaele.md 4 [99]). Grenze: Im Daten-Repository stehen **keinerlei Personendaten**, auch keine EP-Personenkennung, keine Fraktion, keine Partei, keine Abstimmungen; Rollen im Verfahren nur als Verweis auf den eigenen API-Endpunkt `/v1/procedures/‹slug›/people` (Bauregel G1; Pfad nach entscheidungen.md, Entscheidung 21.10.2026 V10, 06-recht-anwaltsfragen.md Abschnitt 5). So muss nie Historie umgeschrieben werden, und nichts Personenbezogenes geht in ein Drittland. Personendaten liefern Website, API und Export von den eigenen Servern. GitHub-Grenzen werden eingehalten: Repository unter 1 GB, keine Datei über 50 MiB, Release-Anhänge unter 2 GiB (docs.github.com, rohnotizen/preise-hosting.md). Entscheidung: entscheidungen.md E9.

## 9. Hosting-Plan und Kosten

Alle Preise Anbieterangaben vom 2026-10-18, netto, aus rohnotizen/preise-hosting.md. Brutto konservativ mit 20 % USt. gerechnet.

| Baustein | Produkt | €/Monat netto |
|---|---|---|
| Kernserver (Ingestion, Veröffentlichung, Caddy, API, MCP, Suche) | Hetzner Cloud CPX32, 4 vCPU, 8 GB, 160 GB NVMe, 20 TB Traffic, DE, inkl. IPv4 | 35,99 |
| Sicherung Kernserver | Hetzner Backup, 20 % des Serverpreises | 7,10 |
| Alarmdienst | Hetzner Cloud CPX02, 1 vCPU, 1 GB, DE, inkl. IPv4 | 6,49 |
| Sicherung Alarmdienst | 20 % | 1,20 |
| Rohablage, Exportarchiv, externe Sicherung | Hetzner Object Storage, 1 TB Speicher + 1 TB Egress inkl. | 6,49 |
| zweite Sicherungskopie an anderem Standort | Hetzner Storage Box BX11, 1 TB, HEL1 (FI) | 3,20 |
| Transaktionsmail | Brevo Free (300 Mails/Tag); Reserve Starter ab 7 € | 0,00 (Reserve 7,00) |
| Domains | .eu 10 €/Jahr + .org 15 €/Jahr (INWX, regulärer Preis) | 2,08 |
| Cron- und Erreichbarkeitsüberwachung | Healthchecks.io Free (20 Checks, Betreiber in Lettland) + gegenseitige Prüfung der beiden Server | 0,00 |
| CDN | Bunny.net, nur falls Last es verlangt (0,01 $/GB Europa, Mindestumsatz 1 $) | 0,00 (Reserve 3,00) |
| Messung Abbruchregel | Exa-Suchen (kanaele.md 4 [91]: unter 5 $ für acht Wochen, Einschätzung) | 3,00 |
| Code, Daten-Repository, CI | GitHub Free (öffentliche Repositories) | 0,00 |
| Modellbetrieb | Modul 1 nutzt kein Sprachmodell | 0,00 |
| **Summe netto** | | **65,55** (mit Reserven 75,55) |
| **Summe brutto (20 %)** | | **78,66** (mit Reserven 90,66) |

Unter der Grenze von 150 €/Monat (Entscheidung 3) mit rund 60 € Puffer. Günstigere Hetzner-Linie (CX33, 8,99 €) ist laut Anbieter derzeit „not available“; wird sie verfügbar, sinkt die Summe um rund 30 €. Einmalkosten: keine außer Zeit.

## 10. Sicherungen

- Täglich nach dem Lauf: konsistente SQLite-Sicherung des Graphen und neue Rohdateien in den Object Storage (versioniert, Aufbewahrung 30 tägliche, 12 wöchentliche Stände).
- Wöchentlich: Kopie in die Storage Box in Finnland (anderer Standort).
- Alarmdienst: tägliche verschlüsselte Sicherung von `subscribers.db` und `events.db` in den Object Storage, Aufbewahrung 7 Tage (Abschnitt 6.4).
- Wiederherstellung wird vor dem Start und danach monatlich geprüft: frischer Server, Sicherung einspielen, Prüfsummen und Stichprobe vergleichen. Ziel: Kern in 4 Stunden wieder online (Einschätzung).
- Das Daten-Repository auf GitHub ist eine dritte, öffentliche Kopie des jüngsten Stands.

## 11. Überwachung

- Jeder Lauf, jede Veröffentlichung, jeder Alarmversand, jede Sicherung meldet Erfolg und Fehlschlag an Healthchecks.io; ausbleibende Meldung → E-Mail an den Betreiber.
- Die beiden Server prüfen sich gegenseitig alle 5 Minuten (Startseite, `/v1/sources`, `/mcp`-Handshake, Formularseite) und melden an Healthchecks.io.
- Quellengesundheit (Abschnitt 3) ist öffentlich.
- Kennzahlen ohne Personenbezug: Laufdauer, Zahl der Änderungen, Fehler je Quelle, Antwortzeiten der API, Zahl der 429-Antworten.

## 12. Sicherheit und CRA-Schwachstellenprozess ab dem ersten Release

Grundlage: Auflage 11 (blocker.md), recht-eu-policy-monitor.md Nr. 5 (Meldepflichten nach Art. 14 CRA seit 11.09.2026). Rechtliche Einzelheiten und Fristen: 06-recht.md.

- **Meldeweg:** `SECURITY.md` im Repository, `/.well-known/security.txt` (RFC 9116), private Schwachstellenmeldung über GitHub, Adresse `security@‹domain›`.
- **Bearbeitung:** Eingang bestätigen binnen 3 Werktagen; Bewertung; kritische Lücken mit Korrektur binnen 30 Tagen (Ziel, wie 06-recht.md 11.2 und SECURITY.md; entscheidungen.md, Entscheidung 21.10.2026 V11); Sicherheitshinweis (GitHub Security Advisory) mit Version und Abhilfe.
- **Meldepflicht:** aktiv ausgenutzte Schwachstellen und schwerwiegende Vorfälle nach Art. 14 CRA über die vorgesehene Meldeplattform innerhalb der dort genannten Fristen (06-recht.md); Ablauf als Checkliste im Betriebshandbuch.
- **Lieferkette:** SBOM (CycloneDX) je Release; Abhängigkeiten wöchentlich automatisch aktualisiert und geprüft; npm-Veröffentlichung mit Herkunftsnachweis (Provenance); signierte Tags.
- **Betrieb:** nur SSH-Schlüssel, automatische Sicherheitsupdates des Betriebssystems, Hetzner-Firewall (nur 80/443, SSH nur von festen Adressen), Geheimnisse nicht im Repository, Dienste ohne Root-Rechte, PDF-Auswertung isoliert (Abschnitt 2.5).
- **Unterstützungszeitraum:** jede veröffentlichte Hauptversion des MCP-Pakets erhält Sicherheitsupdates, solange Modul 1 betrieben wird; bei Einstellung wird das angekündigt (06-recht.md, Zusage).
