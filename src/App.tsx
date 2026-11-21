import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  DoorClosed,
  Users,
  MapPin,
  CalendarClock,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { SAMPLE_ROOMS } from "@/data/rooms";
import {
  checkAvailability,
  type IntervalCheck,
  type Room,
} from "@/lib/availability";
import {
  deriveReasonCode,
  generateAvailabilityExplanation,
  type ExplanationOutput,
} from "@/lib/explainAvailability";
import {
  MAX_BOOKING_MINUTES,
  MINUTES_PER_DAY,
  formatDuration,
  nowToMinutes,
  toHHMM,
  toMinutes,
} from "@/lib/time";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toHHMMInput = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

function App() {
  const [rooms] = useState<Room[]>(SAMPLE_ROOMS);
  const [roomId, setRoomId] = useState<string>(rooms[0]?.id ?? "");
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("11:00");
  const [useLiveNow, setUseLiveNow] = useState<boolean>(true);
  const [manualNow, setManualNow] = useState<string>("09:00");
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Controls for testing validation, long input, timeout & simulated failure
  const [customNote, setCustomNote] = useState<string>("");
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [simulateTimeout, setSimulateTimeout] = useState<boolean>(false);
  const [explanationResult, setExplanationResult] =
    useState<ExplanationOutput | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  const room = useMemo(
    () => rooms.find((r) => r.id === roomId) ?? null,
    [rooms, roomId]
  );

  const currentMinutes = useMemo(() => {
    if (useLiveNow) return nowToMinutes();
    return toMinutes(manualNow) ?? 0;
  }, [useLiveNow, manualNow]);

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  const result: IntervalCheck | null = useMemo(() => {
    if (!submitted) return null;
    if (startMin === null || endMin === null) return null;
    return checkAvailability(room, startMin, endMin, currentMinutes);
  }, [submitted, startMin, endMin, room, currentMinutes]);

  const duration =
    startMin !== null && endMin !== null ? endMin - startMin : 0;

  const handleCheck = () => {
    setSubmitted(true);
    setExplanationResult(null);
  };

  const reset = () => {
    setSubmitted(false);
    setExplanationResult(null);
  };

  const handleExplainAvailability = async () => {
    const activeCheck =
      result ??
      checkAvailability(room, startMin ?? -1, endMin ?? -1, currentMinutes);
    setSubmitted(true);
    setIsExplaining(true);

    const reasonCode = deriveReasonCode(
      activeCheck.decision,
      startTime,
      endTime,
      currentMinutes
    );

    const out = await generateAvailabilityExplanation({
      roomLabel: room?.name ?? "",
      startTime,
      endTime,
      isAvailable: activeCheck.ok,
      reasonCode,
      customNote,
      simulateError: simulateFailure,
      simulateTimeout,
    });

    setExplanationResult(out);
    setIsExplaining(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
            <CalendarClock size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight sm:text-xl">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Check whether a room is free for your requested time window.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form + schedule */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">
                Request a room
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Room</span>
                  <select
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value);
                      reset();
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.blocked ? " — blocked" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Current time ({toHHMM(currentMinutes)})
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={useLiveNow}
                        onChange={(e) => {
                          setUseLiveNow(e.target.checked);
                          reset();
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                      />
                      Live
                    </label>
                    <input
                      type="time"
                      value={toHHMMInput(currentMinutes)}
                      disabled={useLiveNow}
                      onChange={(e) => {
                        setManualNow(e.target.value);
                        setUseLiveNow(false);
                        reset();
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Start</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      reset();
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">End</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      reset();
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600">
                    Optional note / test input (max 160 chars)
                  </span>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Optional note or long test string..."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Simulate API failure
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={simulateTimeout}
                      onChange={(e) => setSimulateTimeout(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Simulate timeout
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <CheckCircle2 size={16} /> Check availability
                </button>
                <button
                  type="button"
                  onClick={handleExplainAvailability}
                  disabled={isExplaining}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  {isExplaining ? "Explaining..." : "Explain availability"}
                </button>
                <span className="text-xs text-slate-500">
                  Duration: {formatDuration(duration)} · max {MAX_BOOKING_MINUTES} min · day {MINUTES_PER_DAY} min
                </span>
              </div>
            </div>

            {/* Result */}
            {submitted && (startMin === null || endMin === null) ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 shrink-0 text-rose-600" size={22} />
                  <div>
                    <p className="text-base font-semibold text-rose-800">
                      Unavailable
                    </p>
                    <p className="text-sm text-rose-700">
                      Enter both start and end time
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              result && (
                <ResultBanner result={result} roomName={room?.name ?? ""} />
              )
            )}

            {/* Explanation box */}
            {explanationResult && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-indigo-800">
                  <span>Explanation ({explanationResult.source})</span>
                </div>
                <p className="text-sm text-indigo-950">
                  {explanationResult.explanation}
                </p>
              </div>
            )}

            {/* Room info + schedule */}
            {room && (
              <RoomSchedule room={room} currentMinutes={currentMinutes} />
            )}
          </section>

          {/* Rules / acceptance criteria */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertTriangle size={16} className="text-amber-500" />
                Booking rules
              </h3>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
                <li>• 0 ≤ start &lt; end ≤ 1440 minutes (24h clock).</li>
                <li>• Start must be after the current time.</li>
                <li>• Booking length ≤ {MAX_BOOKING_MINUTES} minutes.</li>
                <li>• Blocked rooms cannot be booked.</li>
                <li>• No overlap with existing bookings; touching endpoints are allowed.</li>
                <li>• Checking never modifies existing bookings.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ResultBanner({
  result,
  roomName,
}: {
  result: IntervalCheck;
  roomName: string;
}) {
  const available = result.ok;
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {available ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={22} />
        ) : (
          <XCircle className="mt-0.5 shrink-0 text-rose-600" size={22} />
        )}
        <div className="min-w-0">
          <p
            className={`text-base font-semibold ${
              available ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </p>
          <p
            className={`text-sm ${
              available ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {available
              ? `${roomName} is free for the requested interval.`
              : "The request could not be accepted. See the issues below:"}
          </p>
          {!available && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-700">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomSchedule({
  room,
  currentMinutes,
}: {
  room: Room;
  currentMinutes: number;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {room.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {room.building}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {room.capacity} seats
            </span>
            <span className="inline-flex items-center gap-1">
              {room.blocked ? (
                <>
                  <Lock size={12} /> Blocked
                </>
              ) : (
                <>
                  <DoorClosed size={12} /> Open
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <Clock size={12} /> Now: {toHHMM(currentMinutes)}
      </div>

      {/* Hour scale */}
      <div className="relative h-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {/* gridlines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            <span className="absolute -top-px left-1 text-[9px] text-slate-400">
              {pad2(h)}
            </span>
          </div>
        ))}
        {/* existing bookings */}
        {room.bookings.map((b, i) => (
          <div
            key={i}
            className="absolute top-4 bottom-2 rounded bg-sky-500/80 px-1 text-[9px] leading-tight text-white shadow-sm"
            style={{
              left: `${(b.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((b.end - b.start) / MINUTES_PER_DAY) * 100}%`,
            }}
            title={`${toHHMM(b.start)}–${toHHMM(b.end)} · ${b.purpose}`}
          >
            {toHHMM(b.start)}–{toHHMM(b.end)}
          </div>
        ))}
        {/* now marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-rose-500"
          style={{ left: `${(currentMinutes / MINUTES_PER_DAY) * 100}%` }}
        >
          <span className="absolute -top-px -translate-x-1/2 text-[9px] text-rose-500">
            now
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-500/80" /> Existing booking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Current time
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400">
            <tr>
              <th className="py-1 pr-3 font-medium">Window</th>
              <th className="py-1 pr-3 font-medium">Owner</th>
              <th className="py-1 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {room.bookings.map((b, i) => (
              <tr key={i} className="text-slate-700">
                <td className="py-1.5 pr-3 whitespace-nowrap">
                  {toHHMM(b.start)}–{toHHMM(b.end)}
                </td>
                <td className="py-1.5 pr-3 whitespace-nowrap">{b.owner}</td>
                <td className="py-1.5">{b.purpose}</td>
              </tr>
            ))}
            {room.bookings.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-slate-400">
                  No existing bookings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;