import { describe, expect, it } from "vitest";
import { checkAvailability, type Room } from "./availability";

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "r1",
    name: "Room 201",
    building: "Main",
    capacity: 8,
    blocked: false,
    bookings: [{ start: 600, end: 660, owner: "A", purpose: "Test" }],
    ...overrides,
  };
}

const NOW = 540;

describe("checkAvailability", () => {
  it("T01: 660-720 -> available (touching after, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 660, 720, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T02: 540-570 -> unavailable (starts now, AC1)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 540, 570, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T03: 720-720 -> unavailable (zero duration, AC1)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 720, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T04: 750-720 -> unavailable (reversed, AC1)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 750, 720, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T05: 1380-1441 -> unavailable (past day end, AC1)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1380, 1441, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T06: 720-840 -> available (exactly 120 min, AC2)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 840, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T07: 720-841 -> unavailable (121 min, AC2)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 841, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T08: 570-600 -> available (touching before, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 600, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T09: 630-690 -> unavailable (partial overlap, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 630, 690, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T10: 570-690 -> unavailable (contains booking, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 690, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T11: 615-645 -> unavailable (inside booking, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 615, 645, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T12: 600-660 -> unavailable (identical, AC4)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 600, 660, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T13: 660-720 with blocked = true -> unavailable (AC3)", () => {
    const room = makeRoom({ blocked: true });
    const result = checkAvailability(room, 660, 720, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });

  it("T14: 630-690 with bookings = [] -> available (AC4)", () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 630, 690, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T15a: AC5 — T01 bookings unchanged, ok true, status available", () => {
    const room = makeRoom();
    const before = JSON.stringify(room.bookings);
    const result = checkAvailability(room, 660, 720, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
    expect(JSON.stringify(room.bookings)).toBe(before);
  });

  it("T15b: AC5 — T09 bookings unchanged, ok false, status unavailable", () => {
    const room = makeRoom();
    const before = JSON.stringify(room.bookings);
    const result = checkAvailability(room, 630, 690, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
    expect(JSON.stringify(room.bookings)).toBe(before);
  });

  it("T16: 541-542 -> available (minimum duration, strictly later than now)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 541, 542, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T17: 1320-1440 -> available (ends exactly at day end)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1320, 1440, NOW);
    expect(result.ok).toBe(true);
    expect(result.decision.status).toBe("available");
  });

  it("T18: null room -> unavailable, single error", () => {
    const result = checkAvailability(null, 660, 720, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
    expect(result.errors).toHaveLength(1);
  });

  it("T19: unavailable decision reason is non-empty and equals errors[0] (T09 case)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 630, 690, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
    if (result.decision.status === "unavailable") {
      expect(result.decision.reason.length).toBeGreaterThan(0);
      expect(result.decision.reason).toBe(result.errors[0]);
    }
  });

  it("T20: blocked room with non-touching 700-760 -> unavailable, error mentions blocked", () => {
    const room = makeRoom({ blocked: true });
    const result = checkAvailability(room, 700, 760, NOW);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
    expect(result.errors.some((e) => /blocked/i.test(e))).toBe(true);
  });

  it("T21: 541-542 with now=541 -> unavailable (start equal to now)", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 541, 542, 541);
    expect(result.ok).toBe(false);
    expect(result.decision.status).toBe("unavailable");
  });
});
