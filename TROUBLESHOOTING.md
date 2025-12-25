# Troubleshooting

Common issues to watch for as we build the project.

## Local server (today)
- **Port already in use:** Change `PORT` in the environment before running `npm start`, or stop the other app on port 3000.
- **Blank page:** Ensure you opened http://localhost:3000 and that `npm start` is still running in your terminal.
- **Data not saving:** Check file permissions for `data/tasks.json`; the server writes new tasks there.
- **`npm start` fails:** Run `npm install` again to ensure dependencies are present; use Node 18+.

## GitHub Pages preview
- **Site not visible:** In GitHub, open **Settings → Pages** and choose the `main` branch and `/ (root)` folder. Save and wait a minute.
- **Page is blank on Pages:** Make sure you include the repo path (example: `https://<username>.github.io/canvas-planner/`). Direct domain root will 404 the assets.
- **“Static preview” status:** This means the page is running without an API. It will still load demo tasks and your browser drafts.
- **Cannot save to server:** You need the Node API running somewhere reachable (local tunnel or hosted). Until then, tasks save locally in the browser.

## Accessibility check failures
- If `npm run a11y` reports missing labels or `aria-live`, open `public/index.html` and add a label or aria-label to the input/button mentioned. Re-run the command until it passes.

## API access problems
- **Notion auth failures:** Check `NOTION_TOKEN` and database permissions. Notion limits requests (~3/sec) so space calls out or enable batching.
- **Todoist rate limit (HTTP 429):** Slow down to ~50 requests/minute or use incremental sync endpoints.

## Environment
- Ensure the `.env` file exists and is not committed.
- Use Node.js LTS; mismatched versions can cause install errors.

## Sync issues (future)
- If tasks look stale, re-run the sync job (we will expose a command). Consider clearing the local cache if schemas changed.
- Verify Notion property names; schema drift can block updates.

## Canvas UI (future)
- If drag/drop feels slow, reduce simultaneous animations or close other heavy apps.
- If layout does not persist, check that the backend API is reachable and the storage layer is running.

## Getting help
- Open an issue with steps to reproduce and screenshots if possible.
