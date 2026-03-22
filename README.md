# Football Team Balancer

React + Vite frontend with Tailwind CSS and Framer Motion, backed by an Express API using MongoDB Atlas.

## Folder structure

```text
football_sel/
  client/
    src/
      components/
        DraftBoard.jsx
        PlayerForm.jsx
      lib/
        constants.js
        draft.js
      App.jsx
      index.css
      main.jsx
    index.html
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
    package.json
```

## Run locally

1. In `client`, run `npm install` then `npm run dev`.
2. In `server`, copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and `MONGODB_DB_NAME`.
4. In `server`, run `npm install` then `npm run dev`.

The frontend expects the API at `http://localhost:4000`.

## Main logic component

The main draft logic lives in `client/src/components/DraftBoard.jsx` and `client/src/lib/draft.js`.
