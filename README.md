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

Planning.

See the [project specification](docs/project-specification.md) for the version
1 scope.

## Development database

PostgreSQL runs locally through Docker Compose:

```bash
docker compose up -d
```

After installing dependencies, verify the Prisma connection with:

```bash
npm run db:check
```
