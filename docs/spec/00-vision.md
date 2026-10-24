# Vision Modul 1
- Datum: 2026-10-18 · Phase B H3-17 · Produktname offen (Platzhalter ‹Produktname›, Vorschläge in 01-produktname.md)
- Grundlagen: projektanweisung.md (Ergänzung vom 18.10.2026, Entscheidungen 1–4); h3-17/01-marktanalyse/fuer-die-spezifikation.md (Funde 1–10); blocker.md (Auflagen 1–13)

## Was Modul 1 ist

Ein offener Graph aller laufenden EU-Gesetzgebungsverfahren. Er zeigt jedes Verfahren als einen durchgehenden Verlauf über Kommission, Parlament und Rat. Jeder Schritt hat eine amtliche Fundstelle. Jede Verknüpfung sagt, woher sie stammt: amtlich, abgeleitet (mit Regel und Trefferqualität) oder fehlend. Nichts wird überschrieben; jede Änderung ist ein datierter Eintrag.

Der Graph ist überall dort, wo die Arbeit stattfindet: als Seite je Verfahren mit fester URL und Zitierzeile, als wöchentlicher Bulk-Export, als lesende API, als MCP-Endpunkt für den eigenen KI-Assistenten, als Atom-Feed und als Kalender. Alles ohne Konto, unter offener Lizenz.

**Die Achse in einem Satz:** Offene Verfahrensdaten im eigenen Agenten des Nutzers statt Sitze in fremder Oberfläche.

## Für wen

- **Analysten mit eigenem Newsletter oder eigener Auswertung.** Sie sind die Zielrolle der Sonde, weil sie Daten mit Quellenzeile weiterverwenden (fuer-die-spezifikation.md Fund 9; kanaele.md Abschnitt 2, 5.3).
- **Public-Affairs-Leute in Verbänden, Beratungen, Unternehmen, NGOs.** Ihr Arbeitsprodukt ist der Bericht, der Kalender und die Tabelle, nicht die Suche. 45 % nutzen schon Claude, 83 % fürchten Halluzinationen (Fund 8; nutzer.md 4.3, 6.2).
- **Entwickler und Datenteams**, die heute an WAF-Sperren, langsamen APIs und fehlenden Verknüpfungen scheitern (Fund 4; aerger.md [1]–[15]).

## Was Modul 1 nicht ist

- Keine Redaktion, keine Zusammenfassungen durch KI, keine Prognosen, keine Bewertung von Abgeordneten (blocker.md Auflage 10; recht-eu-policy-monitor.md Nr. 10).
- Keine Konten, keine Sitze, keine Personensuche. Die E-Mail-Adresse ist freiwillig und nur für Alarme da.
- Keine weitere Oberfläche für Recherche. Es gibt genau zwei Seitenarten: die Startseite mit Suche und die Seite je Verfahren (Fund 8).
- Kein Ersatz für nicht öffentliche Information.

## Die öffentliche Zusage (ab Tag eins in Repo und Website)

> Daten, Bulk-Export, lesende API und Code bleiben für immer frei und ohne Konto nutzbar. Bezahlt wird nur, was Berth laufend Arbeit und Server kostet. (Vorgabe, Entscheidung 4)

Veröffentlicht wird die rechtlich tragfähige Fassung aus 06-recht.md 10.2: Die Lizenzen sind unwiderruflich, bezahlt wird nie der Zugang zu Daten, und bei einer Einstellung gibt es eine Ankündigungsfrist und einen dauerhaft archivierten letzten Export. „Für immer“ wird so zu einer prüfbaren Zusage (Frage an Manuel in entscheidungen.md).

## Grenzen, die offen benannt werden

Diese Grenzen stehen auf jeder Verfahrensseite dort, wo die Lücke auftritt, und auf der Seite „Über die Daten“:

1. **Nicht öffentliche Trilog- und Ratsdokumente** (Kompromisstexte, Vierspaltendokumente, LIMITE-Inhalte) gibt es nicht. Bei LIMITE-Dokumenten erscheinen nur Kennung und Datum (aerger.md [22], [24]; datenquellen.md 2.6).
2. **Ratsabstimmungen** sind seit dem 10.03.2025 nicht mehr maschinenlesbar. Der Graph weist sie als Lücke aus, statt sie zu raten (datenquellen.md B9).
3. **Verzögerung von Cellar.** Ratsschritte kommen über Cellar und die Kopfzeilen der Rats-PDFs. Cellar hinkt dem Verfahren hinterher; im Fall 2025/0102(COD) endet der Ratsstrang am 26.06.2026, vor der Ausschussbilligung im EP am 14.07.2026 (datenquellen.md B13). Jede Seite zeigt den Quellenstand je Institution.
4. **Abgeleitete Verknüpfungen können falsch sein.** Delegierte Rechtsakte lassen sich zwischen Parlament und Kommission nur über Titel, Basisrechtsakt und Datum zuordnen (datenquellen.md B1–B4). Solche Kanten tragen Regel und Trefferqualität; schwache Treffer erscheinen nicht als Kante.
5. **Nicht abrufbar heißt nicht „nichts passiert“.** Fällt eine Quelle aus, zeigt der Graph das an (aerger.md [9]; Fund 4).
6. **Kein amtliches Angebot.** ‹Produktname› ist unabhängig und keine Veröffentlichung der EU (blocker.md Auflage 5).

## Woran Modul 1 gemessen wird

Weitergemacht wird genau dann, wenn 56 Tage nach dem Veröffentlichungstag mindestens drei unabhängige Weiterverwendungen mit Quellenangabe öffentlich belegt sind (Entscheidung 2). Deshalb ist Zitierfähigkeit kein Detail, sondern Kernfunktion: feste URLs, fertige Zitierzeile, Lizenzzeile in jedem Export (Fund 9).
