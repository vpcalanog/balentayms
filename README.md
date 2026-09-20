# Freedom Wall

An arcade-themed notes wall. Visitors browse approved notes on the left of the
screen and draw + submit their own on the right; admins approve submissions at
`/administrasyones`.

## Local note storage

Submissions are stored as PNG files on the local filesystem by a small Node
server (`server/`, built on Node's `http` module — no extra dependencies).

Run both processes during development:

```bash
npm run server   # notes API on http://localhost:4210
npm start        # React dev server on http://localhost:3000 (proxies /api)
```

| Setting | Env var | Default |
| --- | --- | --- |
| Storage folder | `NOTES_DIR` | `./local-notes` |
| Entry index file | `NOTES_INDEX_FILE` | `<NOTES_DIR>/entries.json` |
| API port | `NOTES_PORT` | `4210` |
| Max upload size | `NOTES_MAX_UPLOAD_BYTES` | `10485760` |
| Client API base | `REACT_APP_NOTES_API` | `/api/notes` |

Each submission is written as `note-<ISO timestamp>-<uuid>.png` with the `wx`
flag, so filenames are unique and an existing file is never overwritten.
Metadata (`id`, `name`, `status`, `updated_by`, `created_at`) lives in
`entries.json` alongside the images. The storage folder is git-ignored.

New submissions arrive approved (`status: true`) and show on the wall on the
next refresh; admins can hide one from `/administrasyones`.

### API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/notes?status=active` | List entries (all, or approved only) |
| `GET` | `/api/notes/files/:name` | Fetch a stored PNG |
| `POST` | `/api/notes` | Submit a note (raw `image/png` body) |
| `PATCH` | `/api/notes/:id` | Update `status` / `updated_by` (moderation) |

Supabase is still used for admin sign-in only; it no longer handles note
storage.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
