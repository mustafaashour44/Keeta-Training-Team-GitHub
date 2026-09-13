# Batch Certification, Nesting & Permissions Update

Built on top of: Keeta-Training-Team-Backup-Range-Excel-Update.zip

## Batch workflow
- Added Certification tab with Knowledge Test and Mock Chat.
- Each Certification item has Attempt 1 and Attempt 2.
- Attempt 2 is enabled only after Attempt 1 fails.
- Both items must pass before the trainee enters Nesting Week 1.
- Added Nesting tab with First Week and Second Week.
- Failed Nesting W1/W2 is removed from current HC by archiving the linked agent while preserving history.
- Passed Nesting W2 becomes Active.
- Nesting W1/W2 agents remain in current HC and remain eligible for normal Activities/Sessions.
- Head Count now distinguishes Active, Nesting W1 and Nesting W2.
- Batch header includes Certified / Nesting W1 / Nesting W2 / Active / Failed pipeline counts.

## Batch information
- MIS and JW are treated as the same identifier.
- Removed separate JW input from Batch Information.
- Old JW-only data is migrated into MIS when MIS is empty.
- Added Save All for Batch Information.
- Batch Excel export now includes Certification and Nesting sheets.
- Full backup Excel includes certification/nesting fields.

## Permissions
- Non-admin trainers can create Sessions and Batches only under their own trainer identity.
- Mustafa can choose any trainer.
- Only the responsible Batch trainer or Mustafa can edit batch details, participant information, attendance, daily quizzes, typing tests, certification or nesting.
- Exam Package / Question Bank Edit is owner-only, except Mustafa can edit all.
- Exam update permission is also enforced in the data mutation, not only hidden in UI.
- Activity Edit is owner-only, except Mustafa.
- Existing Session edit/attendance rule remains responsible-trainer-or-Mustafa.

## Save feedback
- Successful data mutations dispatch a global success notification.
- Save All and all normal Save actions show a `Saved successfully` toast.

## Compatibility
- Existing browser/cloud data storage key is unchanged.
- Existing batches are migrated in-place with default Certification/Nesting states.
- Existing Agents are migrated with Active training stage unless a new Nesting stage is assigned.
