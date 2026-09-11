# Permissions & Ownership Update

This update is cumulative on top of the Dynamic Greeting + Upskill + Daily Quiz/Typing + Agent History build.

## Delete permissions
- Mustafa (Main Admin) can delete any Activity, Session, Batch, or Exam Link.
- Other trainers can delete only records they created themselves.
- Ownership is stored on newly-created records.
- Existing records are backfilled from Recent Activity / Added By when possible. Records with unknown ownership remain deletable by Mustafa only.
- Permission checks are enforced in the data layer as well as hidden/disabled in the UI.

## Agent management
- Only Mustafa can add, import, edit, bulk update, archive, or delete Agents.
- Other trainers can still view/search Agent profiles and export training history.
- Graduate to Agents / Head Count is also restricted to Mustafa because it creates official Agent records.

## Navigation
- Help Center was removed from the sidebar.
