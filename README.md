# Multiverse Consulting Group Platform

This repository contains the Multiverse Consulting Group public website and an internal consulting CRM/business-growth platform. The most complete, enforced workflow is opportunity intake and review:

1. A prospective client submits an opportunity with an idempotency key and explicit contact consent.
2. The API validates and stores the submission once, even if the client retries.
3. Authenticated staff can review the record and its append-only event history.
4. Owners, administrators, and managers can move it through controlled states; closing requires a reason.

The broader repository includes legacy CRM modules and experimental integrations. They have not all reached the same permission, persistence, or test standard. See [`_COMPLETENESS_REVIEW.md`](./_COMPLETENESS_REVIEW.md) and [`SECURITY.md`](./SECURITY.md) before a production launch.

## Requirements

- Node.js 20.19 or newer (Node.js 22 is used in CI and containers)
- PostgreSQL
- npm

## Local setup

Copy `.env.example` to `.env` and replace every placeholder. `JWT_SECRET` must be a unique random value of at least 32 characters. Restrict `CORS_ORIGINS` to the actual frontend origins.

Install dependencies explicitly; startup never installs or updates them:

```sh
npm --prefix backend ci --ignore-scripts
npm --prefix frontend ci --ignore-scripts
```

Create or upgrade the bounded opportunity-workflow schema:

```sh
npm --prefix backend run db:migrate
```

For a clean database that also needs the legacy consulting modules, run the schema-only legacy migration and then the tracked migrations:

```sh
npm --prefix backend run db:migrate:legacy
npm --prefix backend run db:migrate
```

Legacy demo inserts occur only when `SEED_CONSULTING_DEMO=true`. The separate `db:reset-demo` command is destructive, refuses production, requires an explicit confirmation variable, and reapplies schema migrations after the reset; it is not an initialization or deployment command.

To bootstrap the first owner, provide `BOOTSTRAP_OWNER_EMAIL`, `BOOTSTRAP_OWNER_NAME`, and a strong `BOOTSTRAP_OWNER_PASSWORD` from a password manager, then run:

```sh
npm --prefix backend run db:create-owner
```

The command refuses to run if an owner or administrator already exists. Remove the one-time variables immediately afterward.

Validate configuration and database readiness, then start both services:

```sh
npm --prefix backend run check:config
npm --prefix backend run check:db
./start.sh
```

The local launcher binds to loopback, refuses occupied ports, and stops only the child processes it starts. It does not migrate, seed, install packages, or terminate unrelated processes.

## Verification

```sh
npm --prefix backend run check
npm --prefix frontend run check
docker build -t muhittin-platform .
```

Backend tests include an isolated PostgreSQL database for migration repeatability and append-only history enforcement. The test database is created with a random name and removed after the test.

## Deployment contract

- Apply `npm --prefix backend run db:migrate` as an explicit release step before starting the application.
- Use a secret manager for `DATABASE_URL`, `JWT_SECRET`, SMTP, Stripe, and model-provider credentials.
- Run the container as an unprivileged workload behind TLS; set `TRUST_PROXY=true` only behind a trusted proxy.
- Treat `/api/health` as process liveness and `/api/ready` as database/schema readiness.
- Back up PostgreSQL and test restoration before accepting real submissions.

Detailed workflow and recovery behavior is in [`docs/OPPORTUNITY_WORKFLOW.md`](./docs/OPPORTUNITY_WORKFLOW.md).
