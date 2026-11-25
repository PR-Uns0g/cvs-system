# Local setup

## Requirements

- Docker Engine
- Docker Compose

## Configure environment

Compose reads `infra/.env`. Create the file if missing and keep it out of
version control. Never commit passwords, tokens, or signing secrets.

The current Compose file uses these variables:

| Variable | Purpose |
| --- | --- |
| `POSTGRES_USER` | PostgreSQL account |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Main app database name |
| `POSTGRES_PORT` | Host port for PostgreSQL |
| `NUXT_PORT` | Host port for Nuxt |
| `KRATOS_PUBLIC_PORT` | Host port for Kratos browser API |
| `KRATOS_ADMIN_PORT` | Host port for the Kratos admin API |
| `KRATOS_DSN` | Kratos database connection string |
| `MINIO_ROOT_USER` | MinIO root account |
| `MINIO_ROOT_PASSWORD` | MinIO root password |
| `MINIO_APP_USER` | Dedicated app user with invoice-prefix access |
| `MINIO_APP_PASSWORD` | Secret for the dedicated MinIO app user (at least 8 characters) |
| `MINIO_CONSOLE_PORT` | Host port for MinIO Console |
| `MINIO_API_PORT` | Host port for the MinIO API |
| `MINIO_BUCKET` | Bucket name supplied to the app |

Default host ports are Nuxt `3000`, Kratos `4433`/`4434`, PostgreSQL `5432`,
and MinIO Console/API `9001`/`9002`. Override them in `infra/.env` as needed.

Compose supplies the Nuxt service's `DATABASE_URL`, using `postgres` as the
PostgreSQL host on the Docker network. Run Prisma CLI commands in the Compose
service; that hostname is generally not resolvable from the host.

## Start services

From the repository root:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml up --build -d
```

The Nuxt container mounts the source tree and a persistent `node_modules`
volume. Its `nuxt-app/docker-entrypoint.sh` checks the package manifest/lock
file hash and runs `npm ci` if dependencies are missing or stale.

Local service endpoints:

| Service | URL |
| --- | --- |
| Nuxt app | <http://localhost:3000> |
| Kratos browser API | <http://localhost:4433> |
| MinIO Console | <http://localhost:9001> |
| MinIO API | <http://localhost:9002> |
| PostgreSQL | `localhost:5432` |

Ports may differ if overridden.

Useful commands:

```sh
# Follow application logs
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f nuxt-app

# Check service status
docker compose --env-file infra/.env -f infra/docker-compose.yml ps

# Stop services without deleting named volumes
docker compose --env-file infra/.env -f infra/docker-compose.yml down
```

**Removing volumes or pruning Docker data can permanently delete local PostgreSQL and MinIO data.**
`docker compose down` by itself keeps named volumes.

## Production deployment

Set the DNS records for `cvssystem.io` and `auth.cvssystem.io` to the server's
public IP address, then copy `infra/.env.prod.example` to `infra/.env.prod`.
Replace every `REPLACE_...` value with a unique secret; use the same
PostgreSQL password in `POSTGRES_PASSWORD` and `KRATOS_DSN`, and use distinct
Kratos cookie and cipher secrets. The app and Kratos browser API are routed
through Caddy with automatically managed HTTPS certificates. MinIO and
PostgreSQL are not exposed publicly.

From the repository root, start the production stack with:

```sh
docker compose --env-file infra/.env.prod -f infra/docker-compose.prod.yml up --build -d
```

Allow inbound TCP ports 80 and 443 (and UDP 443 for HTTP/3) through the server
firewall. Keep `infra/.env.prod` private and backed up securely.

## Authentication

- Register at <http://localhost:3000/auth/register>.
- Sign in at <http://localhost:3000/auth/login>.
- Use **Sair** in the sidebar to log out.
- Unauthenticated application routes redirect to login.

Kratos manages credentials and the browser session. The Nuxt server verifies the session and provisions a representative profile in `app_users` using the Kratos identity UUID. 
The UUID stays server-side; the session API returns the user's full name and email.

**Persistence caveat:** Compose passes `KRATOS_DSN` to the Kratos service and migration command, while `infra/kratos/kratos.yml` declares `dsn: memory`.
Kratos must use the intended PostgreSQL DSN and  database, not in-memory storage.

The app schema has a role column, but administrator management and complete role-based authorization are still application work. 

## Current implementation status

Authentication and initial app tables are wired. Contractor and financial
record screens are still partly visual scaffolding and are not all connected
to persistent APIs. 

The Nuxt service uses a separate MinIO app identity, not the MinIO root account.
Set `MINIO_APP_USER` and `MINIO_APP_PASSWORD` in the ignored `infra/.env` file
to strong, unique values (the secret must be at least 8 characters). Compose
creates the private bucket and grants this identity only `PutObject` and
`DeleteObject` access under the `invoices/` prefix. Do not reuse the root
credentials for the app.

Invoice XML is sent as an authenticated `application/xml` request (maximum 5
MB), parsed server-side, and stored with a random object key. The API response
contains only the new record ID and type; XML, contractor documents, and object
keys are not logged or returned. The XML necessarily remains visible in the
uploading browser's network tools; use HTTPS in deployments to protect it in
transit. Invoice file download is not yet implemented.
