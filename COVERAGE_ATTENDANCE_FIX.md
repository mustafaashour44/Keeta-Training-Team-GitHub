# Coverage from attendance update

- An agent becomes **Covered immediately after attendance is saved as Attended**, even if the Session is still Planned/In Progress.
- Activity **Progress** now uses the same attendance-first coverage logic, so it updates as soon as agents attend.
- Coverage now includes a clickable **Session** column. Clicking the session opens the full Session details/attendance page.
- Coverage Excel export now includes Session, Session ID, and Session status.
- Pending agents remain Pending until at least one session under that activity records them as Attended.
