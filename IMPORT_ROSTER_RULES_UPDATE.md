# Agent import and UI cleanup update

- Agent Excel/CSV import uses HR ID, MIS, Name, LOB Skill and optional Employment status only.
- Rows containing `Resigned` in `Resigned/Transferred` are ignored automatically.
- If Employment status is absent or blank, imported agents default to Active.
- Duplicate HR ID or MIS is blocked for single add, multiple add, file import, edit and Graduate to Agents.
- Notification bell removed from the header.
- Excel export removed from Exam Link.
