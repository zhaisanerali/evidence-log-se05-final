import { MAX_BOOKING_MINUTES, MINUTES_PER_DAY, toHHMM } from "./time";

export interface Booking {
  start: number;
  end: number;
  owner: string;
  purpose: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  bookings: Booking[];
}

export type Decision =
  | { status: "available" }
  | { status: "unavailable"; reason: string };

export interface IntervalCheck {
  ok: boolean;
  errors: string[];
  decision: Decision;
}

export function intervalsOverlap(a: Booking, start: number, end: number): boolean {
  return start < a.end && end > a.start;
}

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentMinutes: number
): IntervalCheck {
  const errors: string[] = [];

  if (!room) {
    errors.push("Select a room to check availability.");
    return { ok: false, errors, decision: { status: "unavailable", reason: "No room selected." } };
  }

  if (!(0 <= start && start < end && end <= MINUTES_PER_DAY)) {
    errors.push("Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.");
  }


  if (!(start > currentMinutes)) {
    errors.push(`Start time must be later than the current time (${toHHMM(currentMinutes)}).`);
  }

  if (end - start > MAX_BOOKING_MINUTES) {
    errors.push(`Bookings may not exceed ${MAX_BOOKING_MINUTES} minutes.`);
  }

  if (room.blocked) {
    errors.push(`${room.name} is currently blocked and cannot be booked.`);
  }

  const conflict = room.bookings.find((b) => intervalsOverlap(b, start, end));
  if (conflict) {
    errors.push(
      `Overlaps an existing booking (${toHHMM(conflict.start)}–${toHHMM(conflict.end)}, ${conflict.purpose}). Touching endpoints are allowed.`
    );
  }

  const ok = errors.length === 0;
  const decision: Decision = ok
    ? { status: "available" }
    : { status: "unavailable", reason: errors[0] };

  return { ok, errors, decision };
}
