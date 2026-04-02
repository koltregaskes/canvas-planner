# Troubleshooting

## Port 3000 is already in use
- Stop the other process using port 3000.
- Or start the app on another port:
  ```powershell
  $env:PORT = '3100'
  npm start
  ```

## The app opens but tasks do not save
- Check the runtime path shown in the right-hand storage card.
- Make sure the server process still has permission to write there.
- Run `npm test` to verify the server and store layer still behave correctly.

## GitHub Pages preview looks empty
- Open the repo-path URL, not the domain root.
- The static preview relies on `public/data/tasks.json`.
- Clear browser local storage if old draft data is masking the bundled preview.

## I can see preview tasks but cannot edit them
- That is expected while the API is offline.
- Clear the selection and create a new browser draft, or reconnect the live server.

## A local draft is still in the browser after the API comes back
- Select that draft and save it once; the app promotes it into the live API store.

## Layout feels broken on mobile
- The app should auto-switch to stacked mode on narrow screens.
- If you still see odd placement, click `Reset board` to clear saved desktop coordinates.
