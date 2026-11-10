# CVS System

CVS System is a Nuxt application in development for centralizing sales representatives' financial operations, including contractors, invoices, financial records, and reports.

## Stack

- Nuxt 4, Vue 3, TypeScript, and PrimeVue 4
- PostgreSQL 18 and Prisma ORM 8 (release candidate)
- Ory Kratos for authentication
- MinIO for S3-compatible object storage
- Chart.js 4

The app and Kratos use separate databases on the same PostgreSQL server.
`app_users.id` is the UUID from the verified Kratos identity; the app keeps it
server-side.

## Quick start

Requirements: Docker Engine and Docker Compose.

1. Configure the ignored `infra/.env` file. See the [setup guide](./docs/setup.md).
2. Start the services from the repository root:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml up --build -d
   ```

3. Initialize/apply the app database migration:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml run --rm nuxt-app \
     npm run db:migrate:dev
   ```

4. Open <http://localhost:3000>.

## Documentation

- [Local setup, configuration, and authentication](./docs/setup.md)
- [Database initialization, access, and Prisma migrations](./docs/database.md)

> The UI includes screens still under development; contractor and financial record forms are not all connected to persistent APIs yet. 

> See the guides for service and database details.
