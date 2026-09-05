# Excel Export Update

This update adds browser-side `.xlsx` export across the Keeta Training Team site. No backend or database service is required for export.

## Export behavior
- Session detail: HR ID, Agent name, MIS, LOB, Date, Trainer, Attendance, Result, Notes.
- Activity detail: required agents with coverage status, date, trainer, result, and session ID.
- Agents: exports the currently filtered roster.
- Coverage: exports the currently filtered coverage table.
- Sessions: exports the currently searched session list.
- Activities: exports the currently searched activity list.
- Head Count: exports Current HC and Monthly Snapshots as separate workbook sheets.
- Updates: exports the currently searched updates.
- Workload: exports trainer workload metrics.
- Dashboard: exports a multi-sheet workbook with Summary, Coverage by LOB, Sessions by Trainer, and Needs Attention.
- Agent profile: exports that agent's training history.
- Reports: exports the selected report using the selected date range where applicable.

Exports are generated directly in the browser using the existing `xlsx` dependency. Filenames and worksheet names are sanitized automatically.
