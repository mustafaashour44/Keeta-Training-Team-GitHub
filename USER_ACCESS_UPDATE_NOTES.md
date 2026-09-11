# User access + audit update

- User chooser/login gate added.
- Mustafa is the main admin; bootstrap password is 2004 on first admin login.
- Other trainers create their own password on first login.
- Admin-only Settings with password reset, freeze/unfreeze, and delete user.
- Settings navigation is hidden from non-admin users and route is guarded.
- Recent Activity now displays the signed-in user who performed each data mutation.
- Dashboard Sessions by Trainer is sorted highest to lowest by completed sessions.
- Activity agent picker now has LOB filter, search, Select all shown, and Clear shown.
- Existing Firebase shared-data sync is preserved.

Security note: this project uses client-side app-level authentication on top of the existing shared Firestore payload. Passwords are stored as salted SHA-256 hashes, not plaintext. For strong production-grade authorization against a malicious user, Firebase Authentication + restrictive Firestore Security Rules / trusted backend are still required.
