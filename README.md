# Football Team Balancer

React + Vite frontend with Tailwind CSS and Framer Motion, backed by an Express API with protected admin uploads.

## Folder structure

```text
football_sel/
  client/
    src/
      components/
        AdminPage.jsx
        DraftBoard.jsx
      lib/
        api.js
        constants.js
        draft.js
      App.jsx
      index.css
      main.jsx
    index.html
    .env.example
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
  server/
    src/
      lib/
        mongo.js
      index.js
    .env.example
    ADMIN_USAGE.md
    package.json
  render.yaml
```

## Run locally

1. In `server`, copy `.env.example` to `.env`.
2. Set `ADMIN_API_KEY` in `server/.env`.
3. In `client`, copy `.env.example` to `.env` if you want a custom API URL.
4. In `server`, run `npm install` then `npm run dev`.
5. In `client`, run `npm install` then `npm run dev`.

Local defaults:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Admin page: `http://localhost:5173/admin`

## Render deployment

Use the included `render.yaml` to create:
- one Node web service for the API
- one static site for the frontend
- one persistent disk mounted at `/var/data` for uploaded images

Required backend env vars on Render:
- `ADMIN_API_KEY`
- `FRONTEND_URL`
- `MONGODB_URI` if you switch back to Atlas
- `MONGODB_DB_NAME`
- `UPLOADS_DIR=/var/data/uploads`

Required frontend env var on Render:
- `VITE_API_URL`

## Main logic component

The main draft logic lives in `client/src/components/DraftBoard.jsx` and `client/src/lib/draft.js`.
