import { describe, it, expect } from "vitest";
import { checkAvailability, type Room } from "./availability";
import {
  deriveReasonCode,
  generateAvailabilityExplanation,
} from "./explainAvailability";

const room: Room = {
  id: "t-1",
  name: "Test Room",
  building: "Test Building",
  capacity: 4,
  blocked: false,
  bookings: [{ start: 600, end: 660, owner: "Tester", purpose: "Meeting" }],
};
const blockedRoom: Room = { ...room, id: "t-2", blocked: true };
const NOW = 540;

const codeFor = (r: Room | null, start: number, end: number) =>
  deriveReasonCode(
    checkAvailability(r, start, end, NOW).decision,
    "10:00",
    "11:00",
    NOW
  );

describe("deriveReasonCode (real messages from checkAvailability)", () => {
  it("R3-1: available -> AVAILABLE", () => {
    expect(codeFor(room, 700, 760)).toBe("AVAILABLE");
  });
  it("R3-2: blocked room -> ROOM_BLOCKED", () => {
    expect(codeFor(blockedRoom, 700, 760)).toBe("ROOM_BLOCKED");
  });
  it("R3-3: overlapping booking -> TIME_OVERLAP", () => {
    expect(codeFor(room, 630, 690)).toBe("TIME_OVERLAP");
  });
  it("R3-4: start not after now -> PAST_TIME", () => {
    expect(codeFor(room, 540, 600)).toBe("PAST_TIME");
  });
  it("R3-5: zero-length interval -> INVALID_TIME", () => {
    expect(codeFor(room, 700, 700)).toBe("INVALID_TIME");
  });
  it("R3-6: longer than 120 minutes -> INVALID_TIME", () => {
    expect(codeFor(room, 700, 900)).toBe("INVALID_TIME");
  });
  it("R3-7: no room selected -> UNAVAILABLE", () => {
    expect(codeFor(null, 700, 760)).toBe("UNAVAILABLE");
  });
  it("R3-8: empty time input -> INVALID_INPUT", () => {
    expect(
      deriveReasonCode({ status: "available" }, "", "11:00", NOW)
    ).toBe("INVALID_INPUT");
  });
});

describe("generateAvailabilityExplanation", () => {
  const base = {
    roomLabel: "Test Room",
    startTime: "10:00",
    endTime: "11:00",
    isAvailable: true,
    reasonCode: "AVAILABLE",
  };
  it("R3-9: note longer than 160 chars is rejected with fallback", async () => {
    const out = await generateAvailabilityExplanation({
      ...base,
      customNote: "x".repeat(161),
    });
    expect(out.source).toBe("fallback");
    expect(out.explanation).toContain("Input rejected");
  });
  it("R3-10: simulated API failure falls back", async () => {
    const out = await generateAvailabilityExplanation({
      ...base,
      simulateError: true,
    });
    expect(out.source).toBe("fallback");
  });
});