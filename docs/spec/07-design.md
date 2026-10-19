# Designsystem
- Datum: 2026-10-18 · Phase B H3-17
- Grundlagen: fuer-die-spezifikation.md Funde 4, 5, 8, 9; aerger.md 9.1, 9.5, 9.7; nutzer.md 6.2, 6.4; blocker.md Auflage 5 (keine Nähe zu EU-Organen), A21 (Emblem); projektanweisung.txt Entscheidung 4 (Hinweisstellen)
- Gilt für die zwei Seitenarten (Startseite mit Suche, Verfahrensseite) und die Textseiten (Über die Daten, Status, Export/API, Doku, Datenschutz, Impressum, Zusage). Oberflächensprache Englisch (entscheidungen.md E18); Beispieltexte unten auf Englisch.

## 1. Haltung

Ruhig, dicht, lesbar. Die Seite sieht aus wie ein gut gesetztes Arbeitsdokument, nicht wie ein Produkt, das etwas verkaufen will. Drei Regeln:

1. **Belege sind sichtbar, nicht versteckt.** Jede Zeile der Zeitleiste zeigt ihre Fundstelle direkt, nicht erst nach Klick (Fund 8: Genauigkeit ist die Hauptsorge).
2. **Herkunft ist erkennbar ohne Farbe.** Amtlich, abgeleitet und fehlend unterscheiden sich durch Form und Wort, Farbe ist nur Verstärkung (WCAG 1.4.1).
3. **Nichts wirkt amtlich.** Kein EU-Emblem, keine Sternenkreise, kein Europablau mit Gelb, keine Logos der Organe (Auflage 5; blocker.md A21, A22). Die Organe erscheinen nur als Text.

## 2. Typografie

| Rolle | Schrift | Größe / Zeilenhöhe | Verwendung |
|---|---|---|---|
| Fließtext | IBM Plex Sans 400 | 16 px / 1,5 (mobil und Desktop) | Text, Zeitleiste |
| Dichte Tabellen | IBM Plex Sans 400, Ziffern tabellarisch | 15 px / 1,4 | Dokumente, Fristen, Änderungen |
| Kennungen | IBM Plex Mono 400 | 0,94 em des Umfelds | `2025/0102(COD)`, `ST 10713/26`, `32024R1689` |
| Überschriften | IBM Plex Sans 600 | 34 / 26 / 20 px, Zeilenhöhe 1,2 | Titel, Abschnitte |
| Meta | IBM Plex Sans 400 | 13 px / 1,4 | Abrufzeit, Lizenz, Quellenstand |

- Schriften liegen auf dem eigenen Server (WOFF2, auf Latin Extended reduziert); keine Abrufe bei Dritten (Datenschutz, 06-recht.md). Lizenz SIL Open Font License (im Bau mit Lizenzdatei belegen).
- Ersatzschriften: `system-ui`, `ui-monospace`.
- Textbreite höchstens 72 Zeichen; Seitenrahmen höchstens 1.120 px.
- Datumsformat überall ISO `2026-07-14`, in Fließtext zusätzlich ausgeschrieben nicht nötig. Keine relativen Zeitangaben („vor 3 Tagen“) ohne absolutes Datum.

## 3. Farben

Farben sind als Design-Token definiert. Hell und dunkel folgen `prefers-color-scheme`; es gibt keinen Umschalter, weil er Zustand im Browser bräuchte (entscheidungen.md E15).

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--bg` | `#FBFAF7` | `#121211` | Seitenhintergrund |
| `--surface` | `#FFFFFF` | `#1A1A18` | Karten, Tabellenkopf |
| `--ink` | `#1C1B19` | `#ECEAE4` | Text |
| `--ink-2` | `#4A4843` | `#BDB9AF` | Sekundärtext, Hinweisstellen |
| `--ink-3` | `#6B6862` | `#9A968C` | Meta |
| `--rule` | `#E3E0D8` | `#2C2B28` | Linien |
| `--accent` | `#0F5E59` | `#5FC1B8` | Links, Fokus, aktive Elemente |
| `--lane-commission` | `#5B4B8A` | `#A99BD6` | Markierung Kommission |
| `--lane-parliament` | `#8A4B2F` | `#D99A7C` | Markierung Parlament |
| `--lane-council` | `#2F5F7A` | `#86B7D1` | Markierung Rat |
| `--ok` | `#2E6B30` | `#7CC47F` | Quelle erreichbar |
| `--partial` | `#8A5A00` | `#E0B04A` | Quelle teilweise |
| `--down` | `#A3261E` | `#F08A80` | Quelle nicht abrufbar |

Alle Text-Hintergrund-Paare erfüllen mindestens 4,5:1 (im Bau mit Kontrastprüfung abnehmen). Ein Akzent, keine Verläufe, keine Schatten außer 1 px Linien.

## 4. Komponenten

### 4.1 Kopfzeile
Wortmarke ‹Produktname› als reiner Text, Suchfeld, Links „Data & API“, „Status“, „About the data“. Kein Logo mit Symbolik der EU.

### 4.2 Suche (Startseite)
Ein Feld: „Procedure number, COM, CELEX, council document or title words“. Erkennt jede Kennung in jeder Schreibweise (03-datenmodell.md 2.2) und springt bei eindeutigem Treffer direkt auf die Verfahrensseite. Ergebnisliste: Kennung (Mono), Titel, Art, Status, letztes Ereignis je Organ als drei kurze Daten. Darunter „Recently changed“: die zuletzt geänderten Verfahren. Suche läuft serverseitig, die Seite funktioniert ohne JavaScript.

### 4.3 Verfahrenskopf
Titel, kanonische Kennung, Art und Status als Textmarke, Alias-Kennungen als umbrechende Mono-Liste, federführende Stellen. Darunter in einer Zeile die **Quellengesundheit** (4.8).

### 4.4 Stand je Institution
Drei gleich breite Karten (mobil untereinander): „Commission“, „Parliament“, „Council“. Je Karte: letztes belegtes Ereignis (Datum groß, Art, Fundstelle), „Source checked 2026-10-18 05:12 UTC“, offene Lücke als Lückenhinweis (4.7). Die Karte nennt immer das **letzte belegte**, nie das nächste erwartete Ereignis (aerger.md [17]).

### 4.5 Zeitleiste
- **Desktop:** eine senkrechte Achse, Datum links, je Organ eine Spalte mit Marke; der Schritt steht in der Spalte seines Organs, seine Beschreibung und Fundstelle laufen über die volle Breite. Trilogsitzungen tragen ein durchgehendes Band über alle drei Spalten mit dem Wort „Trilogue“.
- **Mobil:** eine Spalte; das Organ steht als Textmarke („EP“, „COM“, „Council“) vor dem Schritt.
- Marken für Herkunft: **amtlich** = gefüllter Punkt; **abgeleitet** = Ring mit gestrichelter Verbindung und Text „derived · R6 · high“ (Link auf die Regel); **fehlt** = leerer Ring mit durchgestrichener Verbindung und Grund.
- Abstimmungen aus der ODbL-Teildatenbank stehen in der Zeitleiste mit Ergebnis („503 – 57 – 108“) und eigener kleiner Lizenzzeile.
- Semantik: `<ol>` mit `<time datetime>`; Reihenfolge = Ereignisdatum, bei gleichem Datum Organ-Reihenfolge Kommission, Parlament, Rat.

### 4.6 Fundstelle
Inline in jeder Zeile: Quellenname, Kennung (Mono), Pfeil-Link auf die amtliche Seite. Ein `<details>`-Element zeigt Abrufzeit, Lizenz und Lauf. Beispiel: `EP Open Data · eli/dl/proc/2025-0102 ↗`.

### 4.7 Lückenhinweis
Graue Zeile mit leerem Ring: „Gap: Council votes are not machine-readable since 2025-03-10. Why?“ Der Link führt auf „About the data“. Lücken sind Teil der Zeitleiste an der Stelle, an der sie auftreten, nicht in einer Fußnote (Fund 3, 5).

### 4.8 Quellengesundheit
Kompakt im Verfahrenskopf: `Sources: EP ● ok 05:12 · Cellar ● ok 05:20 · Have your say ● partial 05:31 · Council PDFs ● ok`. Punkt plus Wort, nie nur Farbe. Auf `/status` als Tabelle je Quelle: Status, letzter Erfolg, Antwortzeit (Median, 95. Perzentil), Fehler der letzten 30 Tage. „Unavailable“ heißt: Daten können veraltet sein; es heißt nie „nothing happened“ (aerger.md [9]).

### 4.9 Zitierzeile
Kasten am Ende des Verfahrens und auf Wunsch je Abschnitt:
`‹Produktname› (2026). 2025/0102(COD) Critical Medicines Act – procedure timeline. Data as of 2026-10-18. https://‹domain›/p/2025-0102-cod. CC BY 4.0. Sources: European Parliament, European Commission, Council of the EU.`
Ein Knopf „Copy“ (einziges JavaScript der Seite, ohne JavaScript ist der Text markierbar). Wortlaut der Attribution aus 06-recht.md.

### 4.10 Lizenzhinweis und „nicht offiziell“
Fußzeile jeder Seite: Attributionszeile, „Not an official EU publication“, Link auf die Zusage, Impressum, Datenschutz. Bei Abstimmungen zusätzlich der ODbL-Hinweis (06-recht.md).

### 4.11 Hinweisstelle
Eine einzelne Textzeile im Seiteninhalt, an fester Stelle, in `--ink-2`, gleiche Schrift wie der Text, ein unterstrichener Link als Aktion. Kein Rahmen, keine Farbe, kein Symbol, kein Schließen-Knopf, keine Animation. Sie erscheint auf jeder Seite der jeweiligen Art an derselben Stelle und nie zweimal auf einer Seite; sie folgt nicht dem Scrollen und kommt nie als Overlay. Höchstens zwei Hinweisstellen pro Seite (Verfahrensseite: H1, H2). Wortlaut und Orte: 10-offen-bezahlt-grenze.md Abschnitt 3.

Muster: `Don't want to miss the next step? Get one email when this procedure changes.`

### 4.12 Formular „Watch this procedure“
Eine eigene schlichte Seite: ein Feld E-Mail, ein Satz zum Zweck, ein Satz zu Speicherdauer und Abmeldung, Link Datenschutz, Knopf „Send confirmation link“. Keine vorausgewählten Kästchen, kein Marketing-Häkchen.

### 4.13 Tabellen
Dokumente, Fristen und Änderungen als Tabellen mit fester Kopfzeile; auf schmalen Bildschirmen als gestapelte Zeilen (Beschriftung vor Wert). Ziffern tabellarisch.

## 5. Seitenaufbau Verfahrensseite (Reihenfolge)

1. Verfahrenskopf mit Quellengesundheit
2. Stand je Institution (drei Karten)
3. Nächste Fristen (höchstens 5) mit ICS-Link; darunter Hinweisstelle H2
4. Zeitleiste; darunter Hinweisstelle H1
5. Dokumente
6. Konsultationen
7. Nach der Annahme (falls vorhanden)
8. Änderungen (letzte 20)
9. Zitierzeile und Downloads (JSON, CSV, ICS, Atom)
10. Fußzeile

## 6. Mobil, Zugänglichkeit, Druck, Leistung

- **Mobil:** lesbar ab 360 px Breite ohne waagrechtes Scrollen; Karten und Spalten stapeln; Tippziele mindestens 44 × 44 px.
- **Zugänglichkeit:** WCAG 2.2 AA; Sprunglink zum Inhalt; sichtbarer Fokus in `--accent`; Überschriftenhierarchie ohne Sprünge; Farben nie allein bedeutungstragend.
- **Druck:** eigenes Druck-Stylesheet. Die Verfahrensseite druckt als sauberes Zwei-Seiten-Dossier mit ausgeschriebenen URLs und Zitierzeile, weil das Arbeitsprodukt der Nutzer der Bericht ist (nutzer.md 6.2).
- **Leistung:** keine Anfragen an Dritte; CSS höchstens 15 kB, JavaScript höchstens 5 kB (nur „Copy“), Schriften zusammen höchstens 80 kB; typische Verfahrensseite höchstens 60 kB komprimiert (Einschätzung, im Bau messen).
- **Bewegung:** keine Animationen.

## 7. Abnahme im Bau

Kontrast aller Token-Paare automatisch geprüft; Lighthouse Zugänglichkeit 100 und Leistung ≥ 95 auf der Verfahrensseite 2025/0102(COD); Darstellung bei 360 px, 768 px, 1.280 px in hell und dunkel; Seite ohne JavaScript vollständig nutzbar; Druckvorschau zwei Seiten (08-modulplan.md M4).
