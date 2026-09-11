# Robust Agent Import Fix

This update makes the Agents Excel/CSV import detect the correct roster table instead of assuming the first worksheet is the roster.

## What changed
- Scans every worksheet and the first 60 rows to find the real agent header row.
- Requires the roster fields HR ID, MIS, Name, and LOB Skill (LOB is supported as a fallback when LOB Skill does not exist).
- If a workbook contains more than one HR ID column, selects the HR ID closest to the MIS column. This avoids using Manager/TL HR IDs.
- Prefers LOB Skill over the generic LOB column.
- Prefers sheets that contain Resigned/Transferred, allowing resigned rows to be removed before preview/import.
- Rows whose Resigned/Transferred cell contains `Resigned` are excluded completely.
- Employment status is optional. Missing/blank values become Active.
- Ignores unrelated columns.
- Keeps the existing LOB Skill normalization and duplicate HR ID/MIS protection.
- Works with multi-sheet XLSX files and CSV files without relying on worksheet order.

## Verified against
`Team Allocation - Keeta - Sep 26.xlsx`

The workbook contains a summary sheet first, multiple HR ID columns in Vertical View, a generic LOB column, a LOB Skill column, and a Resigned/Transferred column. The importer now selects the roster table instead of the summary sheet and maps the agent HR ID next to MIS.
