/**
 * Opening hours, and whether the café is open right now.
 *
 * `getOpenState` is pure and takes `now` as an argument — it never reads the
 * clock itself. That makes it testable, and it means the server and the browser
 * cannot disagree about the answer.
 *
 * The café is in Manila and the visitor may not be, so every comparison happens
 * in Asia/Manila rather than in local time.
 */

export type DayHours = { day: number; opens: string; closes: string } | null;

export type OpenState = {
  open: boolean;
  /** "18:00" — present when open */
  closesAt?: string;
  /** "07:00" — present when closed */
  opensAt?: string;
  /** "today" | "tomorrow" | "Monday" — how to phrase the next opening */
  opensOn?: string;
  /** Within the last hour of service */
  closingSoon?: boolean;
};

const ZONE = "Asia/Manila";

/**
 * Weekday indices, 0 = Sunday.
 *
 * Keyed on the *short* weekday name. The narrow form ("S", "M", "T"…) cannot be
 * used here: Sunday and Saturday both give "S", Tuesday and Thursday both give
 * "T", so a lookup table keyed on it silently collides and resolves two days a
 * week to the wrong row.
 */
const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Mon–Thu 7–18, Fri 7–22, Sat 8–22, Sun 8–16. */
export const openingHours: DayHours[] = [
  { day: 0, opens: "08:00", closes: "16:00" },
  { day: 1, opens: "07:00", closes: "18:00" },
  { day: 2, opens: "07:00", closes: "18:00" },
  { day: 3, opens: "07:00", closes: "18:00" },
  { day: 4, opens: "07:00", closes: "18:00" },
  { day: 5, opens: "07:00", closes: "22:00" },
  { day: 6, opens: "08:00", closes: "22:00" },
];

/** The grouped rows a human wants to read, derived from the machine version. */
export const hoursRows = [
  { label: "Monday – Thursday", time: "7:00 – 18:00", days: [1, 2, 3, 4] },
  { label: "Friday", time: "7:00 – 22:00", days: [5] },
  { label: "Saturday", time: "8:00 – 22:00", days: [6] },
  { label: "Sunday", time: "8:00 – 16:00", days: [0] },
];

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Today's weekday and minutes-since-midnight, in Manila. */
function inManila(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: DAY_INDEX[read("weekday")] ?? 0,
    minutes: Number(read("hour")) * 60 + Number(read("minute")),
  };
}

export function getOpenState(hours: DayHours[], now: Date): OpenState {
  const { day, minutes } = inManila(now);

  const today = hours.find((entry) => entry?.day === day) ?? null;
  if (today) {
    const opens = toMinutes(today.opens);
    const closes = toMinutes(today.closes);

    if (minutes >= opens && minutes < closes) {
      return {
        open: true,
        closesAt: today.closes,
        closingSoon: closes - minutes <= 60,
      };
    }
    if (minutes < opens) {
      return { open: false, opensAt: today.opens, opensOn: "today" };
    }
  }

  // Closed for the day — find the next day that has hours at all
  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const index = (day + ahead) % 7;
    const next = hours.find((entry) => entry?.day === index);
    if (next) {
      return {
        open: false,
        opensAt: next.opens,
        opensOn: ahead === 1 ? "tomorrow" : DAY_NAMES[index],
      };
    }
  }

  return { open: false };
}

/** Which grouped row covers today, so the hours table can mark it. */
export function todayRowIndex(now: Date) {
  const { day } = inManila(now);
  return hoursRows.findIndex((row) => row.days.includes(day));
}
