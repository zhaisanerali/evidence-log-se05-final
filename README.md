# Smart Campus Room Availability Checker

A lightweight web app for checking whether a campus room is free for a
requested time window. Pick a room, enter a start and end time, and the app
verifies the request against the booking rules and shows a clear
available / unavailable verdict, plus the room's daily schedule.

## Booking rules
- Times are minutes on a 24-hour clock: 0 ≤ start < end ≤ 1440.
- Start must be later than the current time (live clock, or manual override).
- Maximum booking length: 120 minutes.
- Blocked rooms cannot be booked.
- Requests may not overlap existing bookings; back-to-back requests that only
  touch at endpoints are allowed.
- Checking is read-only: it never changes existing bookings.

## Tech
Vite + React + TypeScript + Tailwind CSS. All data is fictional and hardcoded
in `src/data/rooms.ts`. There is no login, no database, and nothing is sent
to a server.

## Development
- `npm run dev` — start the dev server
- `npm run build` — production build
- `npx vitest run src/lib/availability.test.ts` — run the availability tests

## Notes for contributors and AI agents
See `AGENTS.md` for project constraints (fictional data only, no
auth/database, AC1–AC6) and the required test-before-acceptance workflow.
