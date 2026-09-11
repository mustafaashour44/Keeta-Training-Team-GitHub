# Batch Tabs Final Update

Each Batch now contains its own internal workspace tabs:

- Information
  - Names are populated automatically from the Batch new-hire list.
  - Manual fields: HR ID, MIS, JW, Email, Password, Phone Number, Notes.
- Attendance
  - Names are populated automatically.
  - Select Day 1..N according to the Batch duration.
  - Mark Not Marked / Attended / Absent and optional daily note.
- Quiz
  - Names are populated automatically.
  - Manual Score, Result, Notes.
- Typing Test
  - Names are populated automatically.
  - Manual WPM, Accuracy, Result, Notes.
- Result
  - Names are populated automatically.
  - Certification status, Final Score, Final Notes.
  - Graduate is available only after the trainee is saved as Passed and has both MIS and HR ID.
  - Graduation creates an Active Agent and therefore adds the person to Head Count.

Batch Excel export now creates the same five sheets: Information, Attendance, Quiz, Typing Test, Result.

Existing Firebase/local data is backward-compatible: missing new Batch trainee fields default safely when loaded.
Recent Activity records which trainer updates Batch Information, Quiz, Typing Test, Results, Attendance, and Graduation.
