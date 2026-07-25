# betsStatistic — LoL Esports match-data collector & viewer

A small full-stack project that collects **League of Legends esports** data
(tournaments, matches, champion picks, game stats) and presents it in a simple web UI.
The backend pulls data from the unofficial LoLEsports API and other public esports
sources into Postgres; the frontend browses events, games and champions.

> Note: this is an **earlier prototype / experiment** — an initial iteration of a
> personal esports-analytics idea, kept here as a portfolio reference. It is not a
> polished product.

## Stack

- **Backend:** Node.js + Express, Sequelize ORM, Postgres
- **Frontend:** Vue 3 + Vite (dev server on `:5173`)
- **Infra:** Docker Compose (api + frontend + postgres)

## Layout

```
backend/    Express API, Sequelize models, data-collection services
frontend/   Vue 3 + Vite single-page app
betting.sql / myapp.sql   Sample Postgres schema + seed data (public esports data)
docker-compose.yml        Local dev stack
```

## Running locally

Requires Docker + Docker Compose.

```bash
# 1. Start the stack (api, frontend, postgres)
docker compose up -d

# 2. Create the database schema (Sequelize sync)
docker exec historical-data-api-1 node createDb.js
```

Then open the web UI:

- http://localhost:5173/events — tournaments / events
- http://localhost:5173/games — collected games
- http://localhost:5173/champions — champion list

The API is available on http://localhost:3001/api (health check at `/`).

### Configuration

Copy the example env files and adjust if needed (the defaults match `docker-compose.yml`
and work out of the box for local development):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable       | Default     | Purpose                     |
| -------------- | ----------- | --------------------------- |
| `DB_HOST`      | `localhost` | Postgres host               |
| `DB_PORT`      | `5432`      | Postgres port               |
| `DB_USER`      | `postgres`  | Postgres user               |
| `DB_PASSWORD`  | `postgres`  | Postgres password (local)   |
| `DB_NAME`      | `myapp`     | Database name               |
| `PORT`         | `3000`      | API port inside container   |
| `VITE_API_URL` | see example | Frontend → API base URL     |

The backend calls the LoLEsports API with the well-known **public** API key that the
LoLEsports website itself ships with — no personal credentials are required.

## Related projects

- [LoL Analytics UI](https://github.com/VasiliyDev/lol-analytics-ui)
- [lpl-vod-snapshots](https://github.com/VasiliyDev/lpl-vod-snapshots)

## License

[MIT](./LICENSE)
