# AGENTS.md

## Purpose
Smart Campus Room Availability Checker: a Vite + React + TypeScript SPA that
checks whether a room is free for a requested time window. UI only; no backend,
no database.

## Architecture
- `src/main.tsx` - entry point
- `src/App.tsx` - UI and state
- `src/lib/availability.ts` - `checkAvailability`, `intervalsOverlap` (rules AC1-AC6)
- `src/lib/explainAvailability.ts` - mock explanation with timeout/fallback, `deriveReasonCode`
- `src/lib/time.ts` - time helpers and constants
- `src/data/rooms.ts` - fictional hardcoded rooms
- `src/lib/*.test.ts` - Vitest tests

## Setup
- `npm install`
- `npm run dev`

## Safe commands (allowed without asking)
- `npx vitest run src/lib/availability.test.ts src/lib/explainAvailability.test.ts`
- `npm run typecheck`, `npm run lint`, `npm run build`
- `npm audit` (read-only)
- `npm ls <package>`, `ls`, `cat`

## Forbidden actions
- No secrets, tokens or `.env` files in the repo or in prompts.
- No production deployment or publishing.
- No destructive commands: `rm -rf`, `git push --force`, `git reset --hard`.
- No `npm audit fix --force`.
- No adding, removing or upgrading dependencies without human review.
- Do not delete or weaken existing tests.
- No auth, database or Supabase usage in app code. Fictional data only.

## Acceptance criteria
- AC1: 0 <= start < end <= 1440, and start strictly later than current time.
- AC2: Booking length <= 120 minutes.
- AC3: Blocked rooms cannot be booked.
- AC4: No overlap with existing bookings; touching endpoints are allowed
  (`intervalsOverlap` uses strict `<` / `>`).
- AC5: Checking never mutates existing bookings.
- AC6: Unavailable decisions report a non-empty reason equal to errors[0]
  (assumption inferred from test T19).

## Coding conventions
- TypeScript, functional React components, Tailwind CSS, icons from lucide-react.
- Business rules live in `src/lib`, not in components.
- Import with the `@/` alias.

## Test expectations
- There is intentionally no `test` script; run Vitest with the command above.
- Report actual output. Never claim tests pass without running them.
- New logic needs a test; tests must be added with human approval.

## Review gates
- A human reviews every diff before it is accepted.
- Before calling work done: tests, typecheck, lint and build must be run and
  their real results reported.
- No merge to main without human approval.
- Label unverified claims as assumptions.

## Verified state (2026-11-21)
- `intervalsOverlap` uses strict comparisons and satisfies AC4. Baseline: 22/22
  tests pass. Earlier notes about an injected `<=`/`>=` bug are obsolete.
- `@supabase/supabase-js` is declared but unused and absent from the production
  bundle. Removal requires human approval.
- `npm audit`: 25 vulnerabilities (mostly dev tooling). No CI configured.
- Known limitation: the "live" current time is computed once and not refreshed.