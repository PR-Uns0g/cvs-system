# Database and Prisma

## Database layout

PostgreSQL runs in the `postgres` Compose service. It creates the database
named by `POSTGRES_DB` for the Nuxt app. The SQL initialization script creates
a separate `kratos` database. Both databases use the same PostgreSQL server,
but their tables are managed separately.

The app does not define a cross-database foreign key to Kratos. Instead,
`app_users.id` stores the UUID from the verified Kratos identity. App tables
can use normal foreign keys to each other.

The current Prisma contract is
[`nuxt-app/prisma/contract.prisma`](../nuxt-app/prisma/contract.prisma). The
baseline schema creates `app_users` and `contractors`.

## Initialize a fresh app database

Starting Compose starts PostgreSQL, but does **not** apply the app's Prisma
schema. After starting services, run this from the repository root:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
  npm run db:migrate:dev
```

This applies the committed migration history to the database selected by
`POSTGRES_DB`. Run it again after recreating that database or replacing its
volume.

## Connect to PostgreSQL

Open an interactive `psql` session:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml exec postgres \
  sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

In `psql`, list tables and inspect app profiles:

```sql
\dt
SELECT id, role, status, created_at
FROM app_users
ORDER BY created_at DESC;
```

`app_users.id` contains Kratos identity IDs. Treat query output as sensitive
and do not share it publicly.

## Prisma schema-change workflow

The Prisma contract is the schema source of truth:

- Edit `nuxt-app/prisma/contract.prisma`.
- Generated `contract.json` and `contract.d.ts` are next to the contract; do
  not edit them by hand.
- Migration history and snapshots are in
  [`nuxt-app/migrations/`](../nuxt-app/migrations/).
- Prisma configuration is in [`nuxt-app/prisma.config.ts`](../nuxt-app/prisma.config.ts).

For each change:

1. Edit `contract.prisma`.
2. Emit generated contract artifacts:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
     npm run contract:emit
   ```

3. Plan a named migration:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
     npm run migration:plan -- --name add_contractor_tax_id
   ```

4. Review the generated files in `nuxt-app/migrations/app/`, especially any
   operation that removes or renames data.
5. Apply the migration to the development database:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
     npm run db:migrate:dev
   ```

6. Commit the contract, generated artifacts, migration package, and snapshots
   together.

For a destructive change such as dropping a field, explicitly acknowledge the
data loss:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
  npx prisma migration plan --name drop_contractor_tax_id --delete Contractor.taxId
```

Dropping a field discards its stored values. Back up or migrate values first
if they must be retained. New required fields on tables with existing rows may
need a safe default, an optional-first transition, or a data backfill.

For staging/production, use the committed migration history. Do not use the
development command that advances the local `db` reference. Supply the target
database URL through the deployment environment and apply with:

```sh
npx prisma db migrate --db "$DATABASE_URL"
```

Never commit production URLs or credentials. Prisma ORM 8 is currently
configured at a release-candidate version; check release status before
planning an upgrade.
