# Backup date range + Excel update

- Settings remains restricted to Mustafa (Main Admin).
- Backup period can be `All period` or a custom `Date range`.
- For one exact day, use the same From and To date.
- JSON backup follows the selected period.
- Excel backup follows the same selected period and exports organized sheets for Agents, Activities, Sessions, Attendance, Batches, batch attendance/quiz/typing, Exam, Head Count snapshots, and Recent Activity.
- All-period JSON backups can be restored normally.
- Date-range JSON backups are archive/export files only and are intentionally blocked from Restore, preventing a partial backup from wiping unrelated live Firebase data.
