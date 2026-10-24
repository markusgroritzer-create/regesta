# Datenquellen
- Datum: 2026-10-18 · Phase B H3-17
- Grundlagen: datenquellen.md (Abschnitte 2–6, Quellen [1]–[41]), blocker.md (Prüfpunkte A1–A23, B1–B9, Auflagen 3, 6, 7, 8, 13), aerger.md (Abschnitte 1, 9)
- Alle Lizenzzitate stammen aus den in Phase A im Original geöffneten Texten; die Fundstelle nennt Datei und Quellennummer. Neue Abrufe in Phase B: keine.

## Übersicht

| # | Quelle | Rolle | Takt | Lizenz (Kurzform) |
|---|---|---|---|---|
| Q1 | EP Open Data API v2 | Parlamentsschritte, Trilogsitzungen, EP-Dokumente, Berichterstatter, DEA/RPS-Verfahren | täglich | CC BY 4.0 / CC0 |
| Q2 | Cellar SPARQL und REST | Kennungsknoten: COM, SWD, ST/WK/CM, CELEX, ELI; Ratsdokumente; Rechtsakte | täglich | CC0 (Metadaten), 2011/833 |
| Q3 | „Have your say“ (brpapi) | Planung, Konsultationen, Rückmeldefristen, Ares/C-Brücke | täglich | 2011/833 (CC BY 4.0) |
| Q4 | Register delegierter Rechtsakte (Excel-Export) | C-Nummer, Status, Phase, Basisrechtsakt, Ermächtigung | wöchentlich | 2011/833 (kein eigener Hinweis) |
| Q5 | Rats-PDFs (Dokumentserver) | Kopfzeile „Interinstitutional File“, Betreff, LIMITE-Vermerk | je neuem Ratsdokument einmal | 2017/1842 |
| Q6 | HowTheyVote-Export | Plenarabstimmungen mit Verfahrensbezug | wöchentlich | ODbL 1.0 / DbCL 1.0 |
| Q7 | Cellar-NIM | nationale Umsetzungsmaßnahmen | wöchentlich | CC0 |
| Q8 | Transparenzregister-Export (data.europa.eu) | nur Zuordnung Web-Domain → Registerkategorie, für den Organisationstyp im Klick-Protokoll | monatlich | 2011/833 |
| Q9 | Komitologie-Register (CSV) | **Modul 1.1**, Durchführungsrechtsakte | – | 2011/833 |

## Gemeinsame Regeln für alle Quellen

- **Nutzeranfragen gehen nie live an eine Quelle.** Alle Abrufe laufen in geplanten Läufen (05-architektur.md Abschnitt 2).
- **Ein Abruf zur Zeit je Quelle**, keine Parallelität. `Retry-After` wird immer befolgt. Nach drei Fehlversuchen mit wachsender Wartezeit gilt die Quelle im Lauf als „teilweise“ bzw. „nicht abrufbar“; der Graph behält den letzten Stand (03-datenmodell.md Abschnitt 5).
- **User-Agent** im Format der EP-API `{user-id}-{environment}-{version}`, ohne Namen oder E-Mail (datenquellen.md 2.1 [1]), z. B. `berth-regesta-prod-1.0.0`, für alle Quellen gleich.
- **Keine Umgehung.** Antwortet eine Quelle mit Bot-Prüfung, 403 oder WAF-Challenge (HTTP 202 ohne Inhalt, aerger.md 1.1), wird der Abruf beendet und als „nicht abrufbar“ gemeldet. Kein Wechsel der IP, kein Browser-Automat, kein Index-Ersatz im Betrieb.
- **Rohantworten** werden je Lauf mit Prüfsumme abgelegt (außer Rats-PDFs, siehe Q5).
- **robots.txt** wird je Domain beachtet (blocker.md B6).

---

## Q1 EP Open Data API v2

| Punkt | Festlegung |
|---|---|
| Zugang | REST, anonym, `https://data.europarl.europa.eu/api/v2/`, OpenAPI-Beschreibung mit 55 Pfaden (datenquellen.md 2.1 [1]) |
| Format | JSON-LD; Kennungen als ELI-DL (`eli/dl/proc/2025-0102`, `eli/dl/doc/A-10-2025-0272`) |
| Genutzte Pfade | `/procedures` (gefiltert nach `process-type` und Jahr), `/procedures/{id}`, `/events/{id}`, `/documents/{id}` (nur für Datum und Registernotation), `/procedures/feed` nur als Hinweis auf geänderte Verfahren |
| Takt | täglich: alle laufenden Verfahren im Umfang einzeln; abgeschlossene Verfahren wöchentlich; Listenabfragen täglich je Verfahrensart und Jahr |
| Drosselung | dokumentiert „Maximum number of requests 500 in 5min“ je Endpunkt [52]; beobachtet Burst-Grenze nach rund 66 schnellen Abrufen, 429 mit `Retry-After: 60` (datenquellen.md 2.1 [3]). **Festlegung:** höchstens ein Abruf je 2 s, höchstens 100 Abrufe je 5 min (ein Fünftel der dokumentierten Grenze), Wartezeit nach 429 mindestens `Retry-After`, `Crawl-delay: 2` auf data.europarl (blocker.md B6) |
| Zeitlimit | 120 s je Abruf; Antwortzeiten von 15–90+ s sind belegt (aerger.md 1.2) |
| Paginierungsfenster | Abfragen ohne Filter enden bei 10.000 (B2); deshalb immer nach Verfahrensart und Jahr aufteilen |
| Feeds | nicht tragend, weil sie am 2026-10-18 HTTP 500 lieferten (aerger.md [12]–[15]; fuer-die-spezifikation.md Fund 4); die tägliche Einzelabfrage ist die Quelle der Wahrheit |
| Lizenz im Wortlaut | API-Beschreibung: „CC BY 4.0 - Attribution 4.0 International“ (blocker.md [52]). Präsidiumsbeschluss C/2025/341 Art. 4: Weiterverwendung nach „Creative Commons Attribution 4.0 International License (CC BY 4.0)“; Rohdaten und Metadaten alternativ unter „CC0 1.0“ (blocker.md A7 [2]) |
| Übernommen | Verfahren (Titel, Art, Status/Stufe), Ereignisse mit Typ und Datum (inkl. Trilogsitzungen, Abstimmungsereignisse, Billigung), EP-Dokumentkennungen und Registernotation, federführender Ausschuss, Berichterstatterrolle (Name, Fraktion, nationale Partei über die Personen-ID) |
| Nicht übernommen | Geburtsort/-datum, Assistenten, E-Mail, soziale Netzwerke, Websites, Fotos (Auflage 7, blocker.md C5 [48]); Reden-Texte; Schattenberichterstatter (Umfang) |

## Q2 Cellar (SPARQL und REST)

| Punkt | Festlegung |
|---|---|
| Zugang | SPARQL `https://publications.europa.eu/webapi/rdf/sparql`, anonym, JSON; REST je Ressource mit `Accept`/`Accept-Language` (datenquellen.md 2.3) |
| Abfragen | (a) Dossiers mit `procedure_code_interinstitutional_reference_procedure` im Umfang und ihre Werke; (b) neue Dossiers je Jahr; (c) Rechtsakte über `dossier_produces_resource_legal` mit CELEX, ELI, Daten; (d) Werke vom Typ REG_DEL für C-Nummern (DEA); Abfragen gebündelt (je bis 50 Dossiers) |
| Takt | täglich |
| Drosselung | keine dokumentierte Grenze gefunden (blocker.md B3); **Festlegung:** eine Abfrage zur Zeit, 1 s Pause, Zeitlimit 60 s, bei Zeitüberschreitung Abfrage halbieren |
| Lizenz im Wortlaut | EUR-Lex-Rechtshinweis: „EUR-Lex metadata is dedicated to the public domain“ (CC0 1.0); Rechtsdokumente dürfen „for commercial or non-commercial purposes“ weiterverwendet werden (blocker.md A4 [51]). Kommissionsdokumente nach 2011/833/EU Art. 4 „for commercial or non-commercial purposes“, ohne Einzelantrag (blocker.md A1 [1]); Lizenz CC BY 4.0 nach C(2019) 1655 Art. 1, Metadaten wahlweise CC0 nach Art. 2 (blocker.md A2 [33]). Eine Cellar-eigene Lizenz ist nicht im Wortlaut belegt; es gilt diese Rechtsgrundlage (blocker.md A4, Auflage 13) |
| Übernommen | Kennungen (COM, SEC, SWD, ST, WK, CM, PE-CONS, EP-Registernotation, CELEX, ELI), Datum je Werk, Dossierzuordnung, Rechtsaktdaten (Inkrafttreten, Geltung, Umsetzungsfrist), Änderungsbeziehungen |
| Nicht übernommen | Volltexte, Zusammenfassungen, konsolidierte Fassungen, EuroVoc-Volltexte |
| Bekannte Grenze | Verzögerung beim Rat (B13); delegierte Rechtsakte ohne Basisrechtsakt-Bezug (B11) |

## Q3 „Have your say“ (Better-Regulation-API)

| Punkt | Festlegung |
|---|---|
| Zugang | JSON, anonym: `…/brpapi/searchInitiatives?text=&size=&language=EN`, `…/brpapi/groupInitiatives/{id}?language=EN` (datenquellen.md 2.4 [15], [17]) |
| Takt | täglich: alle verknüpften Initiativen; Suche nach neuen Initiativen mit Vorschlags- oder Rechtsakttyp |
| Drosselung | keine Angabe in den Headern (blocker.md B4); **Festlegung:** ein Abruf je 2 s |
| Lizenz im Wortlaut | Eigene Seite der Plattform nicht erreichbar (blocker.md A6). Es gilt der Kommissionshinweis: „licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0) licence“, mit Vorbehalt für Inhalte mit „identifiable private individuals or includes third-party works“ (blocker.md A3 [4]); Rechtsgrundlage 2011/833/EU (Auflage 13) |
| Übernommen | Initiative-ID, `reference` (Ares, nur als Alias), Veröffentlichungstypen und Referenzen (COM, C, PLAN, ISC, PE), Phase, Zeitraum, Rückmeldefrist, **Zahl** der Rückmeldungen, Link |
| Nicht übernommen | `authorName`, `authorMail`, Namen von Organisationen und Personen, Texte und Anhänge von Stellungnahmen (Auflage 6; recht-eu-policy-monitor.md Nr. 3; blocker.md C6) |

## Q4 Register delegierter Rechtsakte

| Punkt | Festlegung |
|---|---|
| Zugang | Excel-Export der Oberfläche `https://webgate.ec.europa.eu/regdel/web/delegatedActs/excel?lang=en&filter={}`, anonym, 1,3 MB, nicht als API dokumentiert (datenquellen.md 2.5 [10]; blocker.md B9 [43]) |
| Takt | **wöchentlich, ein Abruf** (Auflage 8: nur ergänzend und selten). Zwischen den Abrufen kommen DEA-Schritte aus Q1, Q2 und Q3 |
| Ausfall | Liefert der Export kein XLS oder ändert sich das Spaltenformat, gilt die Quelle als „nicht abrufbar“; DEA-Verfahren laufen mit Q1–Q3 weiter |
| Lizenz im Wortlaut | Kein eigener Rechts- oder Lizenzhinweis im Register (blocker.md A11 [42]; datenquellen.md 2.5 [41]): „Lizenz im Wortlaut nicht aus Original belegt“. Rechtsgrundlage 2011/833/EU Art. 2 Abs. 1 lit. a (Dokumente, die die Kommission über „websites or dissemination tools“ veröffentlicht) und Art. 4 (blocker.md [1]); Lizenz CC BY 4.0 bzw. CC0 für Metadaten nach C(2019) 1655 (blocker.md [33]). Prüfpunkt im Recht: 06-recht.md |
| Übernommen | „CCode“, „Celex number“, „Delegated act status“, „Delegated act phase“, „Planned adoption date“, „Basic legislative act“ (Text, zum Parsen nach R7), „Empowerment article“, „Policy area“, „Leading Service Commission“ |
| Nicht übernommen | Volltitel nur als Abgleichsmerkmal und Anzeige, keine weiteren Texte |

## Q5 Rats-PDFs

| Punkt | Festlegung |
|---|---|
| Zugang | Nur PDFs von Ratsdokumenten, die Cellar einem Dossier zuordnet, über den Dokumentserver `http://data.consilium.europa.eu/doc/document/{ST-nnnn-yyyy-INIT}/en/pdf` (in Phase A HTTP 200 ohne Bot-Prüfung, datenquellen.md 2.6 [13], [39]). **Keine Abrufe auf `www.consilium.europa.eu`** (Auflage 8; 403 mit Browser-Check, blocker.md B8) |
| Takt | je neuem Ratsdokument einmal (Ratsdokumente ändern sich nicht; Revisionen haben eigene Kennungen) |
| Drosselung | ein Abruf je 5 s, höchstens 200 je Tag (Einschätzung) |
| Auswertung | nur Seite 1: Kopfzeile „Interinstitutional File“ (R5), Betreff, Datum, Vermerk „LIMITE“ |
| Speicherung | **Das PDF wird nicht gespeichert.** Gespeichert werden Prüfsumme, Kennung, Datum, extrahierte Kopfzeile und `access`. Bei „LIMITE“ nur Kennung und Datum (datenquellen.md 2.6; Prüfpunkt 06-recht.md) |
| Lizenz im Wortlaut | Beschluss (EU) 2017/1842 Art. 4: Weiterverwendung „for commercial and non-commercial purposes“, kostenlos, ohne Antrag; Art. 6 Abs. 1: „acknowledge the source“, nicht „distort the original meaning or message“; Art. 6 Abs. 2: für einzelne Dokumentarten können weitere Bedingungen gelten (blocker.md A9 [3]) |
| Bei Sperre | Bekommt der Dokumentserver eine Bot-Prüfung, wird Q5 eingestellt; Ratsschritte kommen dann nur aus Q2 (amtliche Dossierzuordnung) |

## Q6 HowTheyVote-Export

| Punkt | Festlegung |
|---|---|
| Zugang | stabile Release-Links `https://github.com/HowTheyVote/data/releases/latest/download/votes.csv.gz` und `last_updated.txt` (datenquellen.md 2.13 [29]) |
| Takt | `last_updated.txt` täglich (ein Abruf); `votes.csv.gz` nur, wenn sich der Stand geändert hat (laut Projekt „updated on a weekly basis“) |
| Lizenz im Wortlaut | „We make our data available under the Open Database License (ODbL)“, Einzelinhalte unter der Database Contents License; ausgenommen sind Abgeordnetenfotos und Abstimmungszusammenfassungen (blocker.md A17 [53]). ODbL § 4.5 a: Collective Databases müssen nicht unter ODbL stehen, der ODbL-Teil schon; § 4.3 Hinweispflicht (blocker.md A15 [13]) |
| Übernommen | nur `votes.csv`: Abstimmungs-ID, Datum, Verfahrensbezug, `reference`, `texts_adopted_reference`, `is_main`, Ergebniszahlen. Als getrennte, gefilterte Teildatenbank unter ODbL (Derivative Database, 06-recht.md Auflage 1; Entscheidung 1, Weg b). HowTheyVote-IDs erscheinen nie in den CC-BY-Dateien; nie `export.zip` laden (enthält `members.csv`) |
| Nicht übernommen | `member_votes`, `members` (E-Mail, Geburtsdatum, soziale Netzwerke, datenquellen.md 2.13), Fotos, „vote summaries“ (Auflage 7), **kein Code** (Entscheidung 1) |
| Risiko | einzige offene Abstimmungsquelle; Format laut Projekt „experimental“ (datenquellen.md 2.13; fuer-die-spezifikation.md Abhängigkeit). Fällt sie aus, erscheinen Abstimmungen als Lücke; Ersatzweg EP-API-Abstimmungsergebnisse (CC BY) ist Modul-1.1-Kandidat |

## Q7 Cellar-NIM

| Punkt | Festlegung |
|---|---|
| Zugang | Cellar SPARQL, Eigenschaft `cdm:measure_national_implementing_implements_resource_legal` (datenquellen.md 2.12 [28]) |
| Takt | wöchentlich, nur für Richtlinien aus Verfahren im Umfang |
| Lizenz im Wortlaut | EUR-Lex-Metadaten CC0 1.0 (blocker.md A4 [51]) |
| Übernommen | MNE-Nummer, Mitgliedstaat, Datum der Mitteilung, CELEX Sektor 7, nationale ELI als Link; angezeigt wird die Zahl je Mitgliedstaat mit Link |
| Nicht übernommen | Texte nationaler Maßnahmen |

## Q8 Transparenzregister-Export (nur Organisationstyp)

| Punkt | Festlegung |
|---|---|
| Zweck | Ableitung des Organisationstyps aus der Domain einer freiwillig eingetragenen E-Mail-Adresse (10-offen-bezahlt-grenze.md Abschnitt 4). Kein Teil des Graphen, keine Anzeige |
| Zugang | amtlicher Download über den data.europa.eu-Eintrag „Organisations in Transparency Register“ (XML), nicht die HTML-Seiten; die robots.txt von ec.europa.eu sperrt `/transparencyregister/` für Crawler (datenquellen.md 2.16 [32]; blocker.md A13) |
| Takt | monatlich, ein Abruf (117 MB) |
| Lizenz im Wortlaut | Lizenzfeld „European Commission reuse notice“ (2011/833) für die laufenden Verteilungen; einzelne neuere Verteilungen ohne Lizenzfeld (blocker.md A13 [7]; datenquellen.md 2.16 [24]). Genutzt wird nur eine Verteilung mit Lizenzfeld |
| Übernommen | Website-Domain und Registerkategorie je Organisation, sonst nichts |
| Nicht übernommen | Namen, Adressen, Telefonnummern, Personen, Freitexte |

## Q9 Komitologie-Register (Modul 1.1)

CSV-Datensätze der Oberfläche (`/core/api/front/datasets/draftMeasures`, 63,8 MB, 86.088 Zeilen), Lizenz „European Commission reuse notice“ (2011/833) laut data.europa.eu (datenquellen.md 2.9 [24], [25]). Nicht in Modul 1 (entscheidungen.md E3).

---

## Nicht verwendet

| Quelle | Grund | Fundstelle |
|---|---|---|
| ParlTrack | keine Lizenz belegt, Dumps veraltet; projektanweisung.md schließt es aus | datenquellen.md 2.18 |
| EUR-Lex-HTML, doceo, Legislative Train, EP-Ausschussseiten | AWS-WAF-Challenge (HTTP 202 ohne Inhalt); Cellar liefert dieselben Metadaten | aerger.md 1.1; blocker.md B6 |
| EU Law Tracker als Datenquelle | Cellar-Ableitung, Backend nicht dokumentiert, keine eigene Lizenz; nur Prüfquelle für Stichproben | datenquellen.md 2.11; Auflage 13 |
| `www.consilium.europa.eu` | 403 mit Browser-Check | Auflage 8; blocker.md B8 |
| OEIL-HTML | Bedingung „entire item is reproduced“; Lizenz nicht CC BY. Verfahrensseiten verlinken OEIL über die Verfahrensnummer, ohne Abruf | datenquellen.md 2.2 |
| EUR-Lex-Webservice, EUR-Lex Data Dump | EU-Login-Konto nötig; Cellar genügt | datenquellen.md 2.19 |
| Register der Kommissionsdokumente | Felder CELEX/HYS leer, kein Bulk-Export; Bestätigungsquelle nur bei Bedarf | datenquellen.md 2.10, B15 |
| Hack23, cyanheads zur Laufzeit | Live-Durchleitung ohne Datenhaltung; nur Code-Übernahme (Apache-2.0), ohne Prognosewerkzeuge | datenquellen.md 2.14, 2.15 |
| legalize-eu | eigene Lizenz ohne Standard; Cellar direkt | blocker.md A20 |
| Plenarprotokolle (CRE) | Teilkennungen nicht auflösbar, Ausgabe nach Monaten; Verfahrensschritt „Debatte“ genügt | datenquellen.md 2.17, B20 |
