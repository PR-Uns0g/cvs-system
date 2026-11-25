# Development command reference

Run these commands from the repository root after configuring `infra/.env`
as described in the [local setup guide](./setup.md). The commands below use a
small Bash/Zsh helper so you do not have to repeat the Compose file arguments:

```sh
dc() {
  docker compose --env-file infra/.env -f infra/docker-compose.yml "$@"
}
```

## Start and inspect the stack

Build the images and start the development services in the background:

```sh
dc up --build -d
dc ps
```

To build without starting or restarting containers:

```sh
dc build
```

Follow application logs when diagnosing startup or request errors:

```sh
dc logs -f nuxt-app
```

Local URLs:

| Service | URL |
| --- | --- |
| CVS System | <http://localhost:3000> |
| Registration | <http://localhost:3000/auth/register> |
| Login | <http://localhost:3000/auth/login> |
| MinIO Console | <http://localhost:9001> |
| MinIO API | <http://localhost:9002> |
| Kratos browser API | <http://localhost:4433> |

These are the default host ports; values in `infra/.env` can override them.
Use the MinIO root credentials from `infra/.env` to sign in to the Console.
The app uses its separate `MINIO_APP_USER` credentials; do not use the app
account as the Console administrator.

## Query the application or Kratos database

Open an interactive `psql` session for the application database:

```sh
dc exec postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Or connect to Kratos' separate database:

```sh
dc exec postgres sh -lc 'psql -U "$POSTGRES_USER" -d kratos'
```

Useful `psql` commands and queries:

```sql
\dt
```

Check whether a registration exists in Kratos, replacing the email with the
address used during registration:

```sql
SELECT id, created_at
FROM identities
WHERE traits->>'email' = 'you@example.com';
```

The app profile is stored in the application database, not the Kratos
database. Copy the Kratos identity `id`, connect to the application database,
replace `KRATOS_ID_FROM_KRATOS_QUERY` below with that UUID, and check whether
its profile has been provisioned:

```sql
SELECT id, role, status, created_at
FROM app_users
WHERE id = 'KRATOS_ID_FROM_KRATOS_QUERY';
```

Registration creates the Kratos identity. The `app_users` row is created when
the signed-in user next loads an application page, which requests
`/api/auth/session`. If the Kratos query returns a row but the app query does
not, sign in and open the app before checking again.

## Plan and apply Prisma migrations

The Prisma contract is `nuxt-app/prisma/contract.prisma`. After editing it,
emit the generated contract artifacts:

```sh
dc run --rm nuxt-app npm run contract:emit
```

Plan a named migration, then review the generated files in
`nuxt-app/migrations/app/` before applying anything:

```sh
dc run --rm nuxt-app npm run migration:plan -- --name add_contractor_tax_id # name here is optional
```

`migration:plan` only compares the contract with migration files on disk.
“No changes detected” means no new migration package is needed; it does not
mean the database has been migrated. Likewise, `db migrate --show` below is a
read-only preview. Neither command applies migrations.

For data-preserving renames, destructive changes, conversions, or required
fields that need backfills, follow the planner's prompts/options and implement
any required data transformation in the generated migration. Do not approve a
data deletion unless it is intended. To preview the recorded migration route
without applying it:

```sh
dc run --rm nuxt-app npx prisma db migrate --show
```

Apply committed migrations to the local development database:

```sh
dc run --rm nuxt-app npm run db:migrate:dev
```

The development command advances the local `db` reference. For deployment,
apply the committed migration history with the deployment's database URL and
the deployment procedure; do not use the local development command against
production.

## Stop services and handle fresh volumes

Stop and remove the Compose containers while keeping database, MinIO, and
`node_modules` volumes:

```sh
dc down
```

When starting after `dc down`, run `dc up --build -d` again. The named volumes
are retained, so existing data and applied migrations remain.

To deliberately remove all Compose volumes as well:

```sh
dc down -v
```

**This permanently deletes local PostgreSQL data (including Kratos
identities), MinIO files, and the dependency volume.** After removing volumes,
recreate the services and initialize the app database with its migrations:

```sh
dc up --build -d
dc run --rm nuxt-app npm run db:migrate:dev
```

PostgreSQL recreates the app and Kratos databases, Kratos runs its own SQL
migrations during startup, MinIO recreates its bucket and app policy, and the
Nuxt entrypoint reinstalls dependencies if the `node_modules` volume is empty.
The app's Prisma migrations still need the explicit command above.

> These commands are for local development. Do not use `dc down -v` unless
> you intentionally want to erase the local databases and uploaded files.
