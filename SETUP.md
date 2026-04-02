# Setup

## Requirements
- Node.js 18 or newer
- Git

No package install step is needed because the project currently uses only built-in Node modules.

## Start the app
```bash
npm start
```

Open `http://localhost:3000`.

## Runtime data location
By default, the server stores editable data here on Windows:

```text
%LOCALAPPDATA%\MyData\canvas-planner\tasks.json
```

The repo keeps bundled demo data separately so the open-source base can stay public.

## Optional overrides
Set one of these environment variables before starting the server if you want a different runtime location:

- `CANVAS_PLANNER_DATA_FILE`
- `CANVAS_PLANNER_DATA_DIR`
- `MYDATA_DIR`
- `PORT`
- `HOST`

Example:

```powershell
$env:MYDATA_DIR = 'D:\MyData'
$env:PORT = '3100'
npm start
```

## Verification
Run:

```bash
npm run check
npm test
```

## GitHub Pages preview
- Enable Pages on the `main` branch with `/ (root)`.
- Open the repo-path URL such as `https://<username>.github.io/canvas-planner/`.
- The preview loads bundled tasks plus browser-only drafts.
- Live API writes require the Node server to be running somewhere reachable.
