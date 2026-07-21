# Security policy

## Supported state

This project is **functional but incomplete** and is not yet approved for unrestricted production use. The opportunity intake/review path has bounded input, idempotency, role-gated transitions, short-lived versioned sessions, and append-only audit events. Many legacy modules still need consistent object ownership, role authorization, validation, and integration tests.

## Secrets and configuration

- Never commit `.env` files, private keys, tokens, provider credentials, or database dumps.
- Store runtime values in a deployment secret manager and restrict local secret files to the owning user.
- Use a unique random `JWT_SECRET` with at least 32 characters; the application rejects missing, short, and known placeholder values.
- Rotate the JWT secret and increment `users.auth_version` when sessions must be revoked. Rotating the signing secret invalidates every active session.
- Restrict `CORS_ORIGINS`; do not use wildcard origins for authenticated deployments.
- Public registration is disabled by default. If explicitly enabled, new accounts receive only the `viewer` role.

Git history was checked for tracked `.env`, PEM, P12, and PFX paths during the 2026-07-20 implementation review. Redacted Gitleaks scans of the current project files and all six reachable commits reported no leaks. These checks are not a substitute for organization-wide scanning or rotation of any value that may have been exposed elsewhere.

## Operational controls

- Run tracked migrations separately from application startup and back up the database first.
- Do not use `db:reset-demo` against shared data. It requires an explicit destructive confirmation and refuses `NODE_ENV=production`.
- SMTP is opt-in. Missing SMTP configuration skips mail rather than creating an external test account.
- Restrict owner-bootstrap variables to the one command and remove them immediately afterward.
- Monitor failed authentication, rate-limit responses, opportunity transitions, outbound-provider failures, and database readiness.

## Known blockers

- Legacy CRM routes generally authenticate users but do not consistently enforce role or record ownership boundaries.
- Several experimental AI, CRM-sync, e-signature, meeting, and workflow modules remain mocks or thin provider wrappers.
- Browser bearer tokens are held in `sessionStorage`; a successful same-origin script injection could still read them. A hardened production deployment should prefer secure, HttpOnly, SameSite cookies plus CSRF protection.
- The public opportunity route uses in-memory per-process rate limiting. A multi-instance deployment needs a shared limiter and edge abuse controls.
- There is no automated backup/restore drill, disaster-recovery exercise, or full browser end-to-end suite.

## Reporting a vulnerability

Report vulnerabilities privately to the repository owner. Include affected routes, prerequisites, reproduction steps, impact, and a proposed mitigation when available. Do not include live credentials or personal data in an issue.
