# Canvas Planner

Canvas Planner is an AI-ready task canvas that pulls tasks from Notion and Todoist, then shows them as moveable boxes on a modern, easy-to-use canvas. You can filter, rearrange, and edit tasks directly from the interface while keeping everything in sync.

## What this project does
- Links to your Notion database (starting with one workspace, expandable later).
- Pulls in Todoist tasks and merges them with Notion tasks.
- Shows tasks as nested boxes you can drag around on a canvas.
- Lets you filter by project, status, and hierarchy levels.
- Keeps a settings page so you can choose what fields appear in each box.
- Aims for quick edit/create actions directly in the canvas.
- Built with an AI-first mindset (automation, summarization, smart defaults).

## How to get started
1. Read **SETUP.md** for environment preparation.
2. See **ARCHITECTURE.md** for the technical plan.
3. Follow **USAGE.md** once features land (we will keep it updated).
4. Track progress in **PLAN.md**.

## Current status
This is the first documentation pass to outline the vision, plan, and constraints. Implementation will follow in small, testable steps.

## What I need from you
- The Notion database you want synced first and permission to create a Notion integration with read access.
- Whether to reuse an existing Todoist project or create a new "Canvas Planner" project, and if labels/filters should mirror.
- The fields you care most about seeing on each task box (e.g., due date, status, priority, tags).
- If you prefer immediate sync on edit or a "Sync" button to push changes.
- Any visual references you like for a futuristic 2026-style interface.

## Key docs
- **ARCHITECTURE.md**: Technical overview and design decisions.
- **CHANGELOG.md**: Versioned history of changes.
- **SETUP.md**: Environment and setup instructions.
- **TROUBLESHOOTING.md**: Quick fixes for common issues.
- **USAGE.md**: How to use the app features.
- **PLAN.md**: Task list with emoji status markers.

## Security and privacy
- We will keep API tokens in environment variables, never in code.
- Minimal scopes for Notion and Todoist integrations.
- Plan for audit logs and secure error handling in the backend.

## Design goals
- Beautiful, futuristic UI that feels like 2026.
- Smooth drag-and-drop canvas interactions.
- Automation-first (AI suggestions for priorities, summaries, and scheduling).
- Clear defaults so non-technical users can succeed quickly.
