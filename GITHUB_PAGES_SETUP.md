# One-time GitHub Pages setup

After pushing this edition to your repository:

1. Open the repository on GitHub.
2. Click **Settings**.
3. Open **Pages** from the left sidebar.
4. Set **Source** to **GitHub Actions**.
5. Open **Actions** and wait for `Deploy Keeta Training Team to GitHub Pages` to finish successfully.
6. Open the generated Pages link.

Every future push to `main` deploys automatically.

## Database note

This GitHub-only edition does not use Neon or any external database. Data is saved in the browser's local storage. This allows the entire hosted application to remain on GitHub Pages without embedding database passwords or tokens in public browser code.
