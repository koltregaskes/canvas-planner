# Setup

This project is in early planning. Follow these steps to get ready:

1. **Install tools (planned stack):** Node.js (LTS), pnpm or npm, and Git.
2. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd canvas-planner
   ```
3. **Create a `.env` file (do not commit):**
   - `NOTION_TOKEN=` (internal integration token with access to the target database)
   - `NOTION_DATABASE_ID=` (the database that stores your tasks)
   - `TODOIST_TOKEN=` (personal API token)
   - `APP_BASE_URL=` (used for webhooks later)
4. **Package install:** Once the codebase is scaffolded, run `pnpm install` (or `npm install`).
5. **Dev server:** We will add `pnpm dev` (or similar) after scaffolding the frontend/backend.

## Notes
- Use minimal scopes for Notion and Todoist tokens.
- Keep `.env` out of version control.
- As features land, this file will list exact commands and scripts.
