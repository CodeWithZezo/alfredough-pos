# Changelog

All notable changes to Alfredough POS are recorded in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
See [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md) for how versions are chosen and released.

## [Unreleased]

## [1.0.0] - 2026-10-04

First versioned release of Alfredough POS.

### Added
- **Auth**: admin login with NextAuth (JWT session) and protected routes.
- **Dashboard**: order statistics, revenue and recent orders.
- **Categories**: add, edit, delete and enable/disable.
- **Products**: products with Small/Medium/Large variants, per-variant stock and QR codes.
- **Customers**: CRUD with phone/name search.
- **Orders**: cart-based order creation with discounts, service charge and delivery fee; printable receipts.
- **Order management**: complete, cancel (with reason) and return (with refund), with audit tables.
- **Inventory**: kitchen stock add/use/set with a history log and low-stock alerts.
- **Reports**: order, cancellation, return and revenue reports.

### Release management
- Release and version management process (`docs/RELEASE_PROCESS.md`).
- App version and build commit shown in the sidebar and served at `GET /api/version`.
- `release:patch`, `release:minor`, `release:major` and `release:rc` npm scripts.
- `typecheck` npm script.
- Continuous Integration workflow (install → typecheck → lint → build) on every push and pull request.
- Release workflow that publishes a GitHub Release with these notes when a `v*` tag is pushed.
- Committed `package-lock.json` so every build installs identical dependency versions.

### Known issues
- `npm run lint` reports existing ESLint errors (mostly `react-hooks/set-state-in-effect`
  and `no-explicit-any`). They don't affect the build or type check.

[Unreleased]: https://github.com/CodeWithZezo/alfredough-pos/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/CodeWithZezo/alfredough-pos/releases/tag/v1.0.0
