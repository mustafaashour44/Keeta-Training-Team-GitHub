# Backup / Restore + Activity Deadline Update

## Full system backup (Mustafa only)
- Added **Settings → Backup & restore**.
- `Download full backup` exports the complete shared workspace to one JSON file:
  agents, activities, sessions, attendance, batches, batch attendance/quiz/typing, exam packages, question banks, users, logs, snapshots and counters.
- `Restore backup` replaces the current shared Firebase workspace with the selected backup file.
- Both operations are enforced as Main Admin (Mustafa) only, not just hidden in the UI.
- Restore adds a `Full System Restored` entry to Recent Activity and reloads the site.

## Activity deadlines
- Deadline is calculated automatically from the Activity **End Date**.
- Active/In Progress activities with pending agents show:
  - Overdue by X days
  - Due today
  - Due in X days
- Activities page has a new **Deadline** column.
- Activity detail shows a deadline alert with pending-agent count.
- Overview → Attention Queue now shows deadline urgency, pending count and coverage, sorted by the closest/most overdue deadline first.
