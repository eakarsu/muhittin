# Opportunity workflow

## States and permissions

Public callers may only submit. `staff`, `manager`, `admin`, and `owner` roles may read submissions and their event history. Only `manager`, `admin`, and `owner` roles may change status.

Allowed transitions are:

```text
new -> reviewing | qualified | closed
reviewing -> qualified | closed
qualified -> proposal | closed
proposal -> negotiation | closed
negotiation -> converted | closed
converted -> terminal
closed -> terminal
```

Every close transition requires a note. Each accepted status change and each initial submission adds an `opportunity_events` record in the same database transaction. A database trigger rejects updates and deletes from that table.

## Public submission contract

`POST /api/opportunities` requires JSON plus an `Idempotency-Key` header containing 16 through 128 letters, digits, colons, underscores, or hyphens. Reusing the same key returns the original reference and does not create a second record or event.

Required fields are `company_name`, `contact_name`, `email`, `opportunity_type`, and `description`. The server normalizes email, bounds every text field, rejects control characters, validates phone format, and accepts only the opportunity types presented by the public form.

The response intentionally contains only the record reference, current status, submission time, and whether the response was replayed. Post-submission contact creation, staff notification, and confirmation email run after the durable transaction; a provider failure does not erase or duplicate the intake record.

## Failure and recovery behavior

- Client timeout or lost response: retry with the same idempotency key.
- Validation failure: correct the input and retry; no record is written.
- Database failure: the transaction rolls back and returns a request ID with the generic server error.
- Notification or SMTP failure: the opportunity remains accepted; operators should inspect application logs and retry communications manually.
- Invalid status transition: the API returns conflict and writes no status or event change.
- Revoked or inactive user: the API rejects the bearer token after checking current database state.

## Release and rollback

Run `npm --prefix backend run db:migrate` before deploying application code. Migrations are ordered, checksummed, transaction-wrapped, and protected by a PostgreSQL advisory lock. A changed already-applied migration is rejected.

The migration adds data and constraints and creates append-only history; there is intentionally no automatic destructive down migration. Roll application code back independently if necessary. Restore a tested database backup only for a database-level recovery, preserving audit records according to the organization’s retention policy.
