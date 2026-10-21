# Customer frontend deployment preparation

## Full-feature candidate — 2026-10-21

Local candidate only; no hosted configuration or data was changed. Intended existing projects are the admin
`https://gasbook-beige.vercel.app` and this customer app `https://gasbook-customer.vercel.app`, sharing
`https://gasbook-demo-api.onrender.com/api`. These target URLs are supplied deployment context; local tests do not
verify their current SHA, account or settings. Keep Vercel/Bun/root `.`/output `dist` and the existing API variable.

Deploy the candidate backend **before** this frontend: `/auth/me/` must provide `capabilities.accessories` and
`capabilities.image_uploads`. Accessory-off, empty catalog, loading and failure are distinct UI states. Accessory
pagination validates counts, IDs, advancing pages and exact same-origin endpoint; incomplete lists are never published.
Cylinder historical/active filtering and intentional home limits remain. Customer images use stable backend media URLs
with explicit fallback/retry; provider signatures and credentials are never sent to this frontend. Staff photos remain
private to the appropriate management users. Storage activation is separately gated by the backend runbook.

Checkout remains a single atomic, persisted-key operation for cylinder and mixed orders. Network failures do not clear
an uncertain cart or create a new retry key. Client timeouts allow 65 seconds for Render cold starts. Do not add automatic
POST retries. Accessory-only customer ordering and online payment processing are not implemented business workflows.

Review `gasbook/docs/production-deployment.md` for the ImageKit Free/account/secret gate, encryption-key backup, feature
activation sequence and coordinated rollback. Older backend artifacts require accessories off/uploads disabled and lack
capabilities; do not independently roll back one side. No migration, seed, bootstrap or hosted smoke-data writes are
implied by a frontend deployment. User approval remains required for commits, pushes and all provider changes.

## Historical initial deployment preparation: personal ₹0 demo

The current release is for non-commercial demonstration with synthetic customers/bookings only. Keep this frontend and
the admin in separate Vercel projects. No real orders, payments, customer data, payment credentials, billing activation,
plan upgrade, commit/push or deployment is authorized by this document.

On 2026-10-20, the isolated Vercel CLI verified the personal `rasikkaa` identity and active Hobby team
`rasikkaas-projects`. None of its five projects is connected to either GasBook repository. No GasBook project/domain or
deployed API URL exists in the inspected Vercel scope. Project creation/linking and initial deployment need specific
approval; do not infer URLs from proposed project names.

Keep the existing Vite API validation, Bun lockfile, routing and token/retry behavior below. Configure the actual Render
HTTPS API URL only after it is assigned and verified. Use provider domains, no paid add-ons, and no real support/payment
details. A clearly identified demo with synthetic tester accounts is required before public sharing.

The backend's `docs/production-deployment.md` now records the ₹0 account gates, proposed Render Free/Neon Free architecture,
upload-disabled demo policy, approvals and future commercial cutover. `render.demo.yaml` is a review template requiring
separate deployment approval. Filesystem uploads remain unsuitable for Render Free.

Current simple demo image policy: **no ImageKit or other media service**. Render uses
`DEMO_DISABLE_UPLOADS=True`; cylinder images are the artwork already bundled in this frontend, and staff/admin images
use existing placeholders. Uploaded-media fields return null, which clears stale image mappings after catalog fetch.
Uploads return an explicit demo error; save admin forms without selecting a photo. No new frontend environment variable
or application-code change is needed. The added mocked catalog test verifies the existing fallback behavior.
This does not demonstrate upload/photo replacement or uploaded-media persistence. Neon Object Storage stays excluded.

Future commercial use needs an eligible plan: Vercel Pro is the recommended path preserving this hosting architecture.
Cloudflare Pages is only a separately reviewed future alternative; no hosting switch has been made.
[Hobby eligibility](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage).

## Existing application deployment contract

Production candidate: `main` in `Rasi-P/gasbook-customer`. The pre-Phase-B layout fix is committed as `aefc229` and is preserved.
Use a separate Vercel project with repository root `.`, Node 24.x, `bun install --frozen-lockfile`, `bun run build`, and output `dist`.
Bun 1.3.14 was tested. Navigation currently uses application state/hash; the admin frontend's history-route rewrite belongs in its own project.

Set `VITE_API_BASE_URL` at build time to the verified Render HTTPS API URL ending in `/api`.
Production builds reject missing/relative/local/HTTP URLs and URLs containing credentials, query strings or fragments.
`VITE_SUPPORT_CONTACT_NAME` and `VITE_SUPPORT_WHATSAPP_NUMBER` remain optional public support settings.
Never place database credentials, signing secrets or private API tokens in VITE variables.

The backend must allow this project's actual origin in CORS and trusted CSRF origins. Preview origins require separate review; do not use a wildcard.
Password-change responses now replace stored access/refresh tokens before the existing success flow continues.
The backend revokes old tokens after password changes, including refresh attempts; users with pre-rollout tokens must log in again.

Local development still uses the existing localhost API fallback. For isolated build/test checks, set an explicit test-only HTTPS URL
and mock all API requests. Such a build is not a deployment artifact. No provider URL or production workflow has been verified by local tests.

Before committing/pushing/deploying, review the backend repository's `docs/production-deployment.md` and Phase B validation report,
resolve provider access, confirm both production branch settings, and obtain deployment approval.
Rollback uses a previous compatible Vercel artifact and its recorded API setting; database rollback is a separate, explicitly approved operation.

## Coordinated remediation release

Deploy the compatible Django backend first: cylinder-only and mixed carts both need signed `/bookings/preview/`, atomic
`/bookings/checkout/`, and authenticated `/bookings/checkout-status/` recovery. No ordinary per-line booking fallback remains.
All lines form one booking. Backend persistence, a unique retry key and transaction locks enforce idempotency, including concurrent
requests and replay after quote expiry. An older backend supporting only mixed checkout cannot serve this frontend safely.

The customer intent survives reload/layout changes in per-customer session storage. It contains only a UUID, payload hash, status and
confirmed booking ID. Keep it until the confirmed result and emptied cart have been saved. Unknown outcomes freeze cart edits and offer
safe same-key retry or read-only recovery; failed requests do not clear the cart. Storage denial blocks a new checkout. Closing a tab or
clearing storage can lose recovery context: review Orders before submitting a new intent. Separate devices/tabs can create separate intents.
An explicit recovery lookup with no visible result permits editing while keeping the same UUID. A late successful original request then
causes changed-payload retries to conflict rather than creating a second order. An empty lookup is not evidence of cancellation.
The previous mixed-checkout retry format is adopted only for an exact matching payload; ownership is still checked by the backend.

Cylinder loading reads every validated page and rejects incomplete/malformed/cross-origin pagination, with a 1,000-request bound.
Image registration follows full success. Inactive records are retained for historical consumers and filtered in the existing catalog hook;
desktop home's first-four limit is intentional. Existing loading/error/retry states remain independent for each responsive catalog.

Dependency security fix: the Bun manifest pins transitive source-map-js to 1.2.2 through a targeted override. PDF renderer/parser and
React versions are unchanged. Use `bun install --frozen-lockfile` and `bun audit --json` in a clean credential-free copy.
Current detailed unit/build/browser/audit evidence is recorded in the backend's `docs/phase-b-validation.md`. Real-API browser checks
use synthetic records and pre-issued test tokens on disposable PostgreSQL; mocked receipt/layout tests do not establish provider coverage.
