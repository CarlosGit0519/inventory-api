# Inventory API

A REST API for inventory management, built as a backend portfolio project.

The project focuses on relational data modelling, stock traceability, role-based
access control, and transactional business rules.

## Planned stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT
- Docker Compose
- Swagger / OpenAPI
- Vitest

## Project status

Core version 1 is implemented.

See the [project specification](docs/project-specification.md) for the version
1 scope.

## Features

- JWT authentication with `ADMIN` and `STAFF` roles
- Category and product management with validation and soft deactivation
- Paginated product search and filters
- Immutable stock movement history with author traceability
- Transactional protection against negative stock
- PostgreSQL with Prisma ORM and Docker Compose
- Automated integration tests for critical stock rules
- Interactive Swagger / OpenAPI documentation

## API documentation

Run the development server and open:

```text
http://localhost:3001/docs
```

The raw OpenAPI document is available at:

```text
http://localhost:3001/docs.json
```

## Deployment

The repository includes a `render.yaml` Blueprint that provisions the API and
a PostgreSQL database on Render. Create a new Blueprint Instance in Render and
select this repository to deploy it. The free database is suitable for a
portfolio demo, but expires after 30 days.

## Development database

PostgreSQL runs locally through Docker Compose:

```bash
docker compose up -d
```

To run the complete API, database, and database migrations in containers:

```bash
docker compose up --build
```

The API is then available at `http://localhost:3001` and Swagger at
`http://localhost:3001/docs`.

After installing dependencies, verify the Prisma connection with:

```bash
npm run db:check
```

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```
