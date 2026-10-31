# CVS System 

Currently being rewritten to hold the full stack of a sales representative. 

Will contain admin dashboard to add new representatives, users, passwords and accesses.

The full API will be built inside Nuxt, with the stack specified below

## Initial Stack

- Nuxt 4 
- PrimeVue 4 (UI component library)
- Chart.js 4 (to build charts charts)

## Local infrastructure with Docker Compose

From the project root, start Nuxt and its local services with:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Open the service interfaces at:

- Nuxt: `http://localhost:3000`
- MinIO Console: `http://localhost:9001` (API: `http://localhost:9002`)
- PostgreSQL: connect to `localhost:5432` with a database client, or run
  `docker compose -f infra/docker-compose.yml exec postgres psql -U cvs_system -d cvs_system`
