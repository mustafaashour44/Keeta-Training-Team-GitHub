# Keeta Training Team — Final System Update

This build includes the previously prepared user/login/admin/history-preservation changes plus the final training workflow additions.

## Batch
- Replaces Updates in the sidebar and routing.
- Any trainer can create a new-hire batch with Batch name, LOB, responsible trainer, start date, duration and notes.
- New hires are initially added by name only.
- MIS and HR ID can be entered later, manually, per new hire.
- Day-by-day attendance supports Not Marked / Attended / Absent and a daily note.
- Each new hire has a general note and Certification status: Pending / Passed / Failed.
- Only Passed new hires with both MIS and HR ID are eligible for Graduate to Agents.
- Graduation creates an official Active Agent record, so Head Count increases automatically.
- Graduated Agents stay in Agents/Head Count even if the original Batch is later deleted.
- Batch Excel export includes a New Hires sheet plus one attendance sheet for each training day.

## Exam Link
- New sidebar tab for quiz/certification links.
- Stores name, LOB, type, URL, status, notes, Added By and Date Added.
- Supports add, edit, delete, search/filter and Excel export.

## Existing access/history rules preserved
- Mustafa remains Main Admin.
- Settings remains admin-only.
- Deleting a trainer user removes login access only; historical sessions, attendance, workload and activity remain under the trainer's name.
- Recent Activity logs the signed-in user for changes.
- Dashboard Sessions by Trainer remains sorted highest-to-lowest by completed sessions.
- Activity agent selection keeps Search, LOB filter, Select all shown and Clear shown.
