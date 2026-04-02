# Usage

## Board modes
- `Stacked board`: responsive card layout that stays clean on laptop and mobile widths.
- `Freeform canvas`: draggable desktop mode for spatial planning.

The app automatically falls back to the stacked layout on narrow screens.

## Filters
- Search by task title or tag.
- Filter by source, level, and status.
- Hide or show due date, priority, source, and tags on the cards.

## Editing workflow
- Click `New task` to open a clean editor.
- Click any card to inspect or edit it.
- Use `Parent task` to connect subtasks or child work.
- Delete removes the task and detaches any children instead of leaving broken parent links.

## Storage behavior
- With the API live: tasks save into your private runtime file.
- Without the API: bundled preview tasks stay read-only, and new drafts save to browser local storage.
- If you later reconnect the API, saving a browser draft promotes it into the live runtime store.

## Useful commands
```bash
npm start
npm run check
npm test
```
