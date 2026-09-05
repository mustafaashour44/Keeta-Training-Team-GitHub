# Keeta Training Team — GitHub Pages Edition

This edition keeps the existing Keeta Training Team visual design and runs entirely as a static GitHub Pages application.

## Architecture

- **Hosting:** GitHub Pages
- **Build/deploy:** GitHub Actions
- **Frontend:** React + Vite
- **Data storage:** Browser local storage (`localStorage`)
- **Backend / external database:** None

Because GitHub Pages cannot run a Node.js backend or PostgreSQL server, this edition stores its records inside the browser that opens the site. No API key, database password, `.env`, Neon, Replit, Render, Railway, or other hosting service is required.

### Important data behavior

Data is saved per browser/device. If the same GitHub Pages URL is opened on another PC/browser, it starts with an empty database. Clearing browser site data also clears the records. This is the trade-off required for a fully GitHub-only deployment without exposing secrets.

## Deploy

1. Replace the current repository contents with the files in this project (keep the `.git` folder if using GitHub Desktop).
2. Commit and push to `main`.
3. On GitHub open **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Open the **Actions** tab. The workflow `Deploy Keeta Training Team to GitHub Pages` builds and deploys automatically.
6. After the workflow succeeds, the Pages URL will be shown in the deployment summary.

For the repository `mustafaashour44/Keeta-Training-Team-GitHub`, the expected URL is:

`https://mustafaashour44.github.io/Keeta-Training-Team-GitHub/`

## Editing later

Edit the source files, commit, and push. GitHub Actions automatically rebuilds the site. No PowerShell server or local database is needed for normal deployment.

## Files intentionally removed from this edition

The Replit API server, Drizzle/PostgreSQL packages, Neon configuration, and Replit-only build plugins are not needed for GitHub Pages. The frontend UI remains the same; its data layer was replaced with a browser-local implementation that provides the same screens and actions.
