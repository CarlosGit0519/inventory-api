# Project specification — Inventory API

## 1. Purpose

Inventory API manages products, categories, and stock movements for a small
business. It is designed to demonstrate practical backend skills with a
relational database: data modelling, relationships, business rules,
authorisation, pagination, and auditability.

## 2. Core principle

Stock is never changed directly. Every stock increase or decrease creates an
immutable movement record. The current stock of a product is calculated from
those records, making the history auditable.

## 3. Roles

| Role | Permissions |
| --- | --- |
| `admin` | Manage users, categories, products, and stock movements. |
| `staff` | View products and categories; create stock movements. |

## 4. Data model

### User

- `id`
- `name`
- `email` (unique)
- `passwordHash`
- `role` (`admin` or `staff`)
- timestamps

### Category

- `id`
- `name` (unique)
- timestamps

### Product

- `id`
- `sku` (unique)
- `name`
- `description` (optional)
- `price`
- `isActive`
- category reference
- timestamps

### Stock movement

- `id`
- `type` (`IN` or `OUT`)
- `quantity` (always positive)
- `note` (optional)
- product reference
- user reference (who created the movement)
- `createdAt`

## 5. Business rules

- Product SKUs and category names are unique.
- A stock movement quantity must be greater than zero.
- An `OUT` movement cannot make the product stock negative.
- Only authenticated users can access inventory data.
- Only administrators can create, update, or deactivate categories and products.
- Every stock movement records the user who performed it.

## 6. Version 1 endpoints

| Area | Endpoints |
| --- | --- |
| Authentication | Register, login, current user. |
| Categories | Create, list, update, deactivate. |
| Products | Create, list with filters/pagination, get by ID, update, deactivate. |
| Stock | Create entry, create exit, list movements, get current stock per product. |

## 7. Quality requirements

- PostgreSQL runs through Docker Compose.
- Prisma migrations define the database schema.
- API input is validated before business logic.
- Errors use a consistent response format.
- Swagger documents all public endpoints.
- Integration tests cover critical stock rules.
- GitHub Actions run type checks, build, and tests on every push.

## 8. Not included in version 1

- Barcode scanning
- Supplier and purchase-order management
- Multi-warehouse stock
- Email notifications for low stock
- Front-end dashboard

## 9. Definition of done

Version 1 is complete when an authenticated user can manage catalogue data
according to their role, register stock movements without allowing negative
stock, inspect movement history, and run the documented project through Docker.
