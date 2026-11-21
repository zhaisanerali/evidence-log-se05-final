# Project memory

## Product intent & audience

- Vite + React project; appears to include scheduling/booking functionality with availability logic.
- Audience and broader product scope not yet established beyond availability/booking feature.

## Brand personality & voice

- Not yet established. Awaiting design requests.

## Visual design & UX direction

- No visual/UX context inferred yet. Stack supports JSX + Tailwind CSS, React hooks, Lucide React icons (per global instructions).

## Decisions, constraints & rationale

- Availability logic lives in `src/lib/availability.ts`.
- Overlap check logic: deliberately modified to treat endpoint-only-touching bookings (end == start) as conflicts via `<=`/`>=` comparisons.
- This was an intentional bug injection; correct non-overlap semantics would use strict `<`/`>`.
- Tests exist for availability logic (location not yet confirmed, likely co-located or `src/lib/__tests__`).

## Open questions & assumptions

- Test file location and structure unconfirmed.
- Whether `availability.ts` exports multiple functions or just overlap checking unknown.
- Broader app structure, routing, and feature set beyond booking availability undetermined.
- No UI/design direction established yet.