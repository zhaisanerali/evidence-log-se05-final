import type { Room } from "@/lib/availability";

export const SAMPLE_ROOMS: Room[] = [
  {
    id: "lib-201",
    name: "Library Study Room 201",
    building: "Main Library",
    capacity: 8,
    blocked: false,
    bookings: [
      { start: 540, end: 600, owner: "A. Khan", purpose: "Group study" },
      { start: 900, end: 960, owner: "M. Ortiz", purpose: "Thesis review" },
    ],
  },
  {
    id: "sci-110",
    name: "Science Lab 110",
    building: "Hawkins Hall",
    capacity: 24,
    blocked: false,
    bookings: [
      { start: 600, end: 720, owner: "Dr. Patel", purpose: "Chem lab" },
      { start: 1020, end: 1080, owner: "Study Group B", purpose: "Review session" },
    ],
  },
  {
    id: "aud-a",
    name: "Auditorium A",
    building: "Fine Arts Center",
    capacity: 120,
    blocked: true,
    bookings: [
      { start: 480, end: 600, owner: "Facilities", purpose: "Maintenance setup" },
    ],
  },
  {
    id: "collab-3",
    name: "Collab Space 3",
    building: "Innovation Hub",
    capacity: 12,
    blocked: false,
    bookings: [
      { start: 780, end: 840, owner: "Robotics Club", purpose: "Build session" },
      { start: 1140, end: 1200, owner: "J. Lee", purpose: "Practice pitch" },
    ],
  },
];
