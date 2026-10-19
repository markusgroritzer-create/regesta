# Modul 1: exakter Umfang
- Datum: 2026-10-18 · Phase B H3-17
- Grundlagen: fuer-die-spezifikation.md (Funde 1–10), blocker.md (Auflagen 1–13), datenquellen.md (Abschnitte 1, 3–6), aerger.md (Abschnitt 9, [50]), nutzer.md (4.3, 6), kanaele.md (4, 5), wettbewerb.md (7, 8), projektanweisung.txt (Entscheidungen 1–4)
- Verweise: Datenmodell 03-datenmodell.md, Quellen 04-datenquellen.md, Betrieb 05-architektur.md, Recht 06-recht.md, Grenze offen/bezahlt 10-offen-bezahlt-grenze.md, Wahl zwischen Varianten entscheidungen.md

Maßstab: wenige Dinge, jedes exzellent. Alles, was hier nicht steht, wird in Modul 1 nicht gebaut.

---

## 1. Welche Verfahren

| Verfahrensart | Umfang in Modul 1 | Kanonische Kennung | Beleg für die Aufnahme |
|---|---|---|---|
| **COD** (ordentliches Gesetzgebungsverfahren) | Alle COD-Verfahren mit mindestens einem Ereignis seit Beginn der 10. Wahlperiode (16.07.2024). Damit sind alle laufenden Verfahren drin, auch die aus der 9. Wahlperiode übernommenen, dazu die in dieser Wahlperiode abgeschlossenen. | interinstitutionelle Verfahrensnummer, z. B. `2025/0102(COD)` | Kern der Achse; EP-API COD 2025: 120, 2026: 53 (datenquellen.md 2.1 [4]) |
| **DEA** (delegierte Rechtsakte) | Alle delegierten Rechtsakte, die seit dem 16.07.2024 im Register delegierter Rechtsakte geplant, angenommen oder übermittelt wurden, und alle EP-DEA-Verfahren dieses Zeitraums. | C-Nummer der Kommission, z. B. `C(2026)4534`; EP-Nummer `2026/2805(DEA)` als Alias | Amtlich bestätigte Lücke: EU Law Tracker nur COD, 142/142 EP-DEA ohne C-Nummer (Fund 2; datenquellen.md B1–B4; aerger.md [18]) |
| **RPS** (Regelungsverfahren mit Kontrolle) | Alle EP-RPS-Verfahren mit Ereignis seit dem 16.07.2024. Die Kommissionsseite (Entwurf im Komitologie-Register) folgt mit Modul 1.1. | EP-Verfahrensnummer, z. B. `2025/2xxx(RPS)` | Gleiche Kontrolllogik wie DEA; EP-API RPS gesamt 2.006 (datenquellen.md 2.1 [4]) |
| Durchführungsrechtsakte (Komitologie) | **Nicht in Modul 1, sondern Modul 1.1.** | – | Grund: 86.088 Zeilen ohne CELEX und ohne Verfahrensnummer, Zuordnung nur über Textabgleich, fehlerhafte Daten (datenquellen.md 2.9, B19). Der Aufwand passt nicht in sechs Wochen neben DEA (entscheidungen.md E3). |

Größenordnung (Einschätzung, wird im ersten Baumodul gemessen): einige hundert COD-, einige hundert DEA- und eine niedrige dreistellige Zahl RPS-Verfahren.

## 2. Was je Verfahren gezeigt wird

Jedes Verfahren ist ein durchgehender Verlauf über Kommission, Parlament und Rat. Jedes Element trägt Fundstelle, Herkunft und Lizenz (03-datenmodell.md).

### 2.1 Kopf
- Titel (amtlich, Englisch), kanonische Kennung, alle bekannten Kennungen (Alias-Liste: COM, CELEX, ELI, ST/WK/CM, HYS-Initiative, Ares, C-Nummer, EP-Registernotation; die HowTheyVote-ID nur im Abstimmungsteil, wegen der ODbL-Trennung).
- Verfahrensart, Status (laufend, abgeschlossen, zurückgezogen, abgelehnt/Einwand), federführende Generaldirektion, federführender EP-Ausschuss, Berichterstatterin oder Berichterstatter mit Fraktion (nur Mandatsbezug, Auflage 7).

### 2.2 Stand je Institution
Drei Felder, eines je Organ. Je Feld: **letztes belegtes Ereignis** (Datum, Art, Fundstelle), Quellenstand (wann zuletzt erfolgreich abgerufen) und offene Lücken. Das beantwortet die Frage, die OEIL verdeckt, weil es den nächsten statt den letzten Schritt zeigt (aerger.md [17]; Fund 5).

### 2.3 Zeitleiste
Alle Schritte chronologisch, je Schritt Datum, Organ, Art, Fundstelle(n), Herkunftsmarke (amtlich / abgeleitet mit Regel und Güte / fehlt mit Grund). Dazu gehören:
- **Kommission:** Planung und Konsultationen aus „Have your say“ (Phase, Zeitraum, Zahl der Rückmeldungen, Link; keine Namen, keine Texte, Auflage 6), Annahme des Vorschlags (COM-Nummer), Arbeitsunterlagen (SWD), bei DEA Planung, Entwurf zur Rückmeldung, Annahme (C-Nummer), Übermittlung.
- **Parlament:** Überweisung, Ausschussbefassung, Bericht, Plenardebatte, Abstimmung, **Trilogsitzungen** (EP-Ereignisse), Billigung der vorläufigen Einigung, bei DEA/RPS Überweisung und ggf. Einwand.
- **Rat:** Ratsdokumente aus dem Cellar-Dossier (ST, WK, CM, PE-CONS) mit Kennung und Datum; Schrittbedeutung (z. B. allgemeine Ausrichtung, Coreper-Bestätigung) nur, wenn sie aus Kopfzeile oder Dokumenttyp ableitbar ist (abgeleitet, Regel R5). Ratsabstimmungen erscheinen als Lücke „nicht maschinenlesbar verfügbar seit 10.03.2025“ (datenquellen.md B9).
- **Plenarabstimmungen** aus HowTheyVote (Ja/Nein/Enthaltung, Link), sichtbar als eigene Teildatenbank mit eigener Lizenzzeile (Entscheidung 1; Auflage 1).
- **Nach der Annahme:** Rechtsakt mit CELEX, ELI, Amtsblatt; Inkrafttreten, Geltungsbeginn, Umsetzungsfrist; Zahl der gemeldeten nationalen Umsetzungsmaßnahmen je Mitgliedstaat (Cellar-NIM, datenquellen.md 2.12). Für COD-Rechtsakte zusätzlich die daran hängenden delegierten Rechtsakte.

### 2.4 Fristen
Nur datierte, belegte oder regelbasiert abgeleitete Termine:
| Frist | Herkunft | Quelle |
|---|---|---|
| Ende einer Konsultation oder Rückmeldefrist | amtlich | „Have your say“ `endDate` (datenquellen.md 2.4) |
| Inkrafttreten, Geltungsbeginn, Umsetzungsfrist | amtlich | Cellar `resource_legal_date_*` (datenquellen.md 2.3) |
| Ende der Kontrollfrist bei DEA/RPS | **abgeleitet**, Regel R11: Übermittlung + Regelfrist des Basisrechtsakts; ohne belegte Frist im Basisrechtsakt wird „Regelfrist nicht bestätigt“ angezeigt | Register delegierter Rechtsakte (Phase „Scrutiny“), EP-Ereignis REFERRAL |
| Termin einer angesetzten Trilogsitzung oder Abstimmung | amtlich, nur wenn die Quelle das Ereignis im Voraus führt | EP-API-Ereignisse |

Keine Frist wird geschätzt oder aus Erfahrungswerten erzeugt.

### 2.5 Änderungsprotokoll
Die letzten 20 Änderungen am Verfahren (neuer Schritt, neues Dokument, Statuswechsel, neue Frist, korrigierte Kante, an der Quelle entfernt), je mit Beobachtungsdatum. Vollständig über API und Export (03-datenmodell.md Abschnitt 5).

### 2.6 Zitierzeile und Lizenz
Jede Verfahrensseite trägt eine fertige Zitierzeile mit fester URL und Stand, die Attributionszeile der Quellen und den Hinweis „nicht offiziell“ (Wortlaut 06-recht.md; Auflage 4; Fund 9).

---

## 3. Ausgaben

Alle Ausgaben entstehen aus demselben versionierten Stand (Snapshot). Keine Nutzeranfrage geht live an eine Quelle (Fund 4; aerger.md 9.2).

| # | Ausgabe | Inhalt | Takt | Form |
|---|---|---|---|---|
| A1 | **Verfahrensseite** | Abschnitt 2, statisches HTML, feste URL `/p/2025-0102-cod`; jede Alias-Kennung leitet mit 301 auf die kanonische URL | nach jedem Lauf (täglich) | HTML, ohne JavaScript voll nutzbar |
| A2 | **Startseite mit Suche** | Suche nach Kennung (jede Schreibweise und jeder Alias) und Titelwörtern; Filter Verfahrensart, Status; Liste „zuletzt geändert“ | live gegen den Snapshot | HTML |
| A3 | **Bulk-Export** | Vollständiger Graph: Verfahren, Schritte, Dokumente, Kennungen/Aliase, Kanten mit Herkunft, Fristen, Änderungsprotokoll; Abstimmungen als getrennte Teildatenbank (ODbL) | wöchentlich (Montag), dazu immer der jüngste Tagesstand | CSV (eine Datei je Tabelle) und JSON-Lines; README mit Schema, Lizenz- und Zitierzeile |
| A4 | **Daten-Repository** | Eine JSON-Datei je Verfahren, Änderungen als Commits | täglich | öffentliches Git-Repository (Entscheidung E9) |
| A5 | **REST-API** | Lesend, ohne Schlüssel, Fair-Use-Ratenbegrenzung je IP | live gegen den Snapshot | JSON, OpenAPI 3.1 |
| A6 | **MCP-Endpunkt** | Vier Werkzeuge (Abschnitt 4), gehostet über Streamable HTTP ohne Login; dasselbe Paket auf npm für lokalen Betrieb | live gegen den Snapshot | MCP |
| A7 | **Atom-Feed** | je Verfahren und ein Gesamtfeed „alle Änderungen“ | täglich | Atom 1.0 |
| A8 | **Kalender** | je Verfahren und als Sammel-URL für bis zu 50 Verfahren (`?ids=…`) | täglich | ICS (RFC 5545) |
| A9 | **Quellengesundheit** | Status je Quelle, letzter Erfolg, Antwortzeiten, Ausfälle; auf `/status` und im Kopf jeder Verfahrensseite | nach jedem Lauf | HTML und API |
| A10 | **Verfahrensschema** | Das Datenmodell als eigene, versionierte Spezifikation (JSON Schema + Textbeschreibung), damit Übernahmen als Repositories zählbar werden (kanaele.md 5.7) | mit jedem Schema-Release | Markdown + JSON Schema, CC BY 4.0 |

Sammel-URLs (A5 `?ids=`, A8) sind zustandslos: Die Liste steht in der URL, nicht auf dem Server. Eine gespeicherte, geteilte oder alarmierende Liste ist Komfortschicht (10-offen-bezahlt-grenze.md).

### 3.1 REST-API (v1)

| Endpunkt | Zweck |
|---|---|
| `GET /v1/procedures?q=&type=&status=&ids=&cursor=&format=json\|csv` | Suche und Sammelabfrage |
| `GET /v1/procedures/{kennung}` | Verfahren über jede Kennung; Antwort nennt `canonical_id` |
| `GET /v1/procedures/{kennung}/timeline?cursor=` | Schritte, blätterbar |
| `GET /v1/procedures/{kennung}/documents` | Dokumente mit Kennungen und Links |
| `GET /v1/procedures/{kennung}/votes` | Abstimmungen (Teildatenbank, Lizenzfeld ODbL) |
| `GET /v1/procedures/{kennung}/history` | alle Versionseinträge |
| `GET /v1/changes?since=&ids=&type=&cursor=` | Änderungen seit Datum (höchstens 90 Tage je Abfrage) |
| `GET /v1/deadlines?days=30&ids=&type=` | Fristen der nächsten n Tage (höchstens 90) |
| `GET /v1/identifiers/{kennung}` | Kennung auflösen: kanonische ID, Typ, alle Aliase |
| `GET /v1/sources` | Quellengesundheit |
| `GET /v1/snapshots` | Liste der Läufe mit Zeitpunkt und Prüfsumme |

Jede Antwort trägt `snapshot` (Zeitpunkt und Kennung des Stands), `attribution` (Wortlaut 06-recht.md) und `license`. Fehler im Format RFC 9457 (Problem Details).

## 4. MCP-Server

Vier Werkzeuge. Drei sind vorgegeben (Verfahren holen, Änderungen seit Datum, Fristen der nächsten 30 Tage). Das vierte, die Suche, ist nötig, weil ein Agent sonst keinen Einstieg hat, wenn der Nutzer nur einen Titel nennt; ohne Suche müsste das Modell die Kennung raten, und Halluzinationen sind die größte Sorge der Nutzer (nutzer.md 4.3; entscheidungen.md E6).

| Werkzeug | `title` | Eingabe | Ausgabe (Standard) |
|---|---|---|---|
| `search_procedures` | Search EU legislative procedures | `query` (Titelwörter oder beliebige Kennung), optional `type`, `status`, `cursor` | höchstens 10 Treffer: Kennung, Titel, Art, Status, letztes Ereignis je Organ, URL |
| `get_procedure` | Get an EU legislative procedure | `id` (jede Kennung), optional `part` = `overview` (Standard) \| `timeline` \| `documents` \| `votes` \| `deadlines`, `cursor` | Überblick: Kopf, Stand je Institution mit Fundstelle, nächste Fristen, Lücken, Zitierzeile |
| `changes_since` | List changes since a date | `since` (Datum, höchstens 90 Tage zurück), optional `ids` (≤ 50), `type`, `cursor` | höchstens 20 Änderungen je Seite: Verfahren, beobachtet am, Art, eine Zeile, Fundstelle |
| `upcoming_deadlines` | List upcoming deadlines | optional `days` (Standard 30, höchstens 90), `ids`, `type`, `cursor` | höchstens 20 Fristen je Seite: Datum, Verfahren, Fristart, Herkunft, Fundstelle |

Der Endpunkt läuft zustandslos und vergibt keine Sitzungskennung, damit nichts im Endgerät gespeichert wird (06-recht.md 5.0). Alle vier tragen die Annotationen `readOnlyHint: true`, `idempotentHint: true`, `openWorldHint: false` und einen `title` (Voraussetzung für das Claude-Verzeichnis, kanaele.md 1.4 [41], [42]).

**Regeln für jede MCP-Antwort** (aerger.md [50]; nutzer.md 4.3):
1. **Knapp:** Zielgröße unter 2.000 Tokens je Antwort, harte Grenze 8.000 (Einschätzung; der cyanheads-Fall mit rund 38.000 Tokens überschritt die Ausgabegrenzen vieler Clients).
2. **Blätterbar:** `next_cursor`, solange mehr da ist; die Antwort sagt, wie viel noch fehlt.
3. **Jede Aussage mit amtlicher Fundstelle:** Jedes Ereignis, jede Frist und jede Kennung trägt `source` (Quelle, Kennung, URL). Abgeleitete Aussagen tragen `derived: {rule, quality}`. Lücken werden als Lücke ausgegeben, nicht weggelassen.
4. **Stand und Herkunft:** `snapshot` und Quellenstand je Institution in jeder Antwort, damit der Agent „Stand vom …“ sagen kann.
5. **Kein Fließtext, keine Bewertung:** strukturierte Felder; die Formulierung übernimmt der Agent des Nutzers.
6. **Attribution im Text:** Neben dem Feld `attribution` endet jede Antwort mit einer Textzeile zur Quelle, weil Agenten oft nur den Text weitergeben (Wortlaut 06-recht.md 3.3).

Beispiel `get_procedure` (gekürzt, Werte aus datenquellen.md Fall 2):

```json
{
  "id": "2025/0102(COD)",
  "title": "Critical Medicines Act",
  "type": "COD",
  "status": "ongoing",
  "latest_by_institution": {
    "commission": {"date": "2025-09-02", "event": "SWD published",
                   "source": {"name": "Have your say", "ref": "Ares(2025)7127810",
                              "url": "https://ec.europa.eu/info/law/better-regulation/brpapi/groupInitiatives/14486"}},
    "parliament": {"date": "2026-07-14", "event": "Committee approves provisional agreement",
                   "source": {"name": "EP Open Data API", "ref": "eli/dl/proc/2025-0102",
                              "url": "https://data.europarl.europa.eu/api/v2/procedures/2025-0102"}},
    "council": {"date": "2026-06-26", "event": "Council document ST 10915/2/26 REV 2",
                "source": {"name": "Cellar", "ref": "ST 10915/2/26 REV 2"},
                "gap": "Cellar has no Council step after 2026-06-26"}
  },
  "trilogue_meetings": ["2026-02-02", "2026-03-16", "2026-05-11"],
  "next_cursor": null,
  "snapshot": "2026-10-18T05:00:00Z",
  "attribution": "‹Attributionszeile, 06-recht.md›",
  "license": "CC-BY-4.0"
}
```

## 5. Hinweisstellen und kostenlose Einzel-Alarme

Beides gehört zum Umfang von Modul 1 (Entscheidung 4). Wortlaut und Klick-Protokoll: 10-offen-bezahlt-grenze.md. Technik und Datenschutz: 05-architektur.md Abschnitt 6, 06-recht.md.

- **Einzel-Alarm je Verfahren:** Wer will, trägt eine E-Mail-Adresse ein und merkt sich bis zu 10 Verfahren (Vorbild GitHub Watch). Bestätigung per Double-Opt-in. Bei Änderungen an einem gemerkten Verfahren kommt eine Sammelmail am Morgen (07:00 Brüssel; Rhythmus „vor 8 Uhr“, nutzer.md 6.8). Alarmrelevant sind: neuer Schritt, Statuswechsel, neue oder geänderte Frist, neue Abstimmung. Nicht alarmrelevant: neue Aliase, Korrekturen an Kanten, Quellengesundheit. Abmeldung mit einem Klick.
- **Interesse für Organisationen:** An den Hinweisstellen zu Teamfunktionen steht „Für Organisationen: Interesse hinterlassen“. Hinter dem Klick liegt nur ein Formular mit freiwilliger E-Mail-Adresse. Modul 2 ist nicht gebaut.
- **Drei bis vier Hinweisstellen**, jede eine kurze Frage im Seiteninhalt; kein Banner, kein Pop-up, nichts Wiederkehrendes, nichts im Browser gespeichert.
- **Ohne Konto:** Die Adresse ist der einzige Personendatensatz im ganzen Modul 1 und dient nur den Alarmen bzw. der einmaligen Nachricht zum Start von Modul 2.

## 6. Was nicht gebaut wird

| Nicht in Modul 1 | Grund | Wohin |
|---|---|---|
| Sitze, Konten, Teams, Rollen | Achse: keine Sitze (Fund 10; wettbewerb.md 6) | Teamfunktionen: Modul 2 |
| Alarme je Thema oder Suchbegriff | Braucht laufende Abstimmung und Pflege; zahlbarer Komfort (aerger.md 5, 9.6; zahlungssignale.md 8.3) | Modul 2 |
| Zusammenfassungen durch KI, Briefings | AI-Act-Kennzeichnung, Halluzinationsrisiko, Redaktion ist nicht die Achse (recht-eu-policy-monitor.md Nr. 6, 9) | nicht geplant; Agent des Nutzers fasst zusammen |
| Prognosen (Abstimmung, Ausgang) | Profiling nach Art. 4 Nr. 4 DSGVO, Auflage 10 | nie |
| Personensuche, Abgeordnetenprofile | Auflage 7, Datenminimierung | nie |
| Volltexte, Kompromisstexte, OEIL-Zusammenfassungen, „Have your say“-Stellungnahmen | Lizenz „entire item“ bzw. Werke Dritter (Auflage 6; datenquellen.md 2.2) | nie; Link auf die Quelle |
| Durchführungsrechtsakte (Komitologie) | Aufwand (Abschnitt 1) | Modul 1.1 |
| Ratsabstimmungen | Keine maschinenlesbare Quelle (B9) | als Lücke ausgewiesen |
| Lobbytreffen, Transparenzregister-Profile | Nebenquelle, Verfahrensbezug nur in 0,9 % (datenquellen.md B18) | Modul 1.1-Kandidat |
| Weitere Exportformate (Parquet, SQLite, RDF) | Pflegeaufwand; CSV und JSON-Lines decken Tabelle und Code ab | auf Nachfrage über Issues |
| Benutzeroberfläche in weiteren Sprachen | Quellen und Zielgruppe arbeiten auf Englisch | auf Nachfrage |

## 7. Ohne Konto

Jede Ausgabe in Abschnitt 3 und 4 ist ohne Konto, ohne Schlüssel und ohne Anmeldung nutzbar. Die E-Mail-Adresse ist freiwillig und dient nur den Alarmen (Abschnitt 5). Das ist Teil der öffentlichen Zusage (00-vision.md).
