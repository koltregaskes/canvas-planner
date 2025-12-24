# Troubleshooting

Common issues to watch for as we build the project.

## Local server (today)
- **Port already in use:** Change `PORT` in the environment before running `npm start`, or stop the other app on port 3000.
- **Blank page:** Ensure you opened http://localhost:3000 and that `npm start` is still running in your terminal.
- **Data not saving:** Check file permissions for `data/tasks.json`; the server writes new tasks there.

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
