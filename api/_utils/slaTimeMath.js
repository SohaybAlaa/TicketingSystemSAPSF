// Pure date-math for SLA timers (no DB access here — see db.js for orchestration).
// All "wall clock" comparisons use a fixed UTC+2 offset, matching this app's seed
// data convention (Klenka Egypt/UAE), so day-of-week/hour checks are stable
// regardless of the server's local timezone.

const WORK_TZ_OFFSET_MS = 2 * 60 * 60 * 1000; // UTC+2
const SLA_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // index matches Date#getUTCDay()

const toWall = (date) => new Date(date.getTime() + WORK_TZ_OFFSET_MS);
const fromWall = (wallDate) => new Date(wallDate.getTime() - WORK_TZ_OFFSET_MS);

function parseHHMM(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

const wallMinutesOfDay = (wallDate) => wallDate.getUTCHours() * 60 + wallDate.getUTCMinutes();

function setWallMinutes(wallDate, minutes) {
  const d = new Date(wallDate);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMinutes(minutes);
  return d;
}

function startOfNextWallDay(wallDate) {
  const d = new Date(wallDate);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/** End-of-day cursor (23:59) for the wall day immediately before `wallDate`'s day. */
function endOfPrevWallDay(wallDate) {
  const d = new Date(wallDate);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(23, 59, 0, 0);
  return d;
}

/** Convert an sla_rules (response_time_value, response_time_unit) pair to minutes. */
export function toMinutes(value, unit) {
  const n = Number(value);
  if (unit === 'Minutes') return n;
  if (unit === 'Hours') return n * 60;
  if (unit === 'Days') return n * 60 * 24;
  return n;
}

/**
 * Project a deadline `minutes` of SLA time forward from `from` (or backward, if `minutes`
 * is negative — used to rebase a deadline to a tighter rule that's already been partly used up).
 * 'Calendar Time' counts continuously. 'Working Time' / 'Custom Time' only
 * count minutes inside the enabled oh_<day> windows, skipping the rest.
 * @param {object} p - { from: Date, minutes: number, timeType: string, operatingHours: object }
 */
export function computeDueAt({ from, minutes, timeType, operatingHours }) {
  if (timeType === 'Calendar Time' || !operatingHours) {
    return new Date(from.getTime() + minutes * 60000);
  }
  if (minutes < 0) return computeDueAtBackward({ from, minutes: -minutes, operatingHours });

  let remaining = minutes;
  let wallCursor = toWall(from);
  for (let guard = 0; guard < 3650 && remaining > 0; guard++) {
    const day = operatingHours[SLA_DAY_KEYS[wallCursor.getUTCDay()]];
    if (day?.enabled && day.start && day.end) {
      const dayStartMin = parseHHMM(day.start);
      const dayEndMin = parseHHMM(day.end);
      let cursorMin = wallMinutesOfDay(wallCursor);
      if (cursorMin < dayStartMin) {
        wallCursor = setWallMinutes(wallCursor, dayStartMin);
        cursorMin = dayStartMin;
      }
      if (cursorMin < dayEndMin) {
        const availableToday = dayEndMin - cursorMin;
        if (availableToday >= remaining) {
          wallCursor = setWallMinutes(wallCursor, cursorMin + remaining);
          remaining = 0;
          break;
        }
        remaining -= availableToday;
      }
    }
    wallCursor = startOfNextWallDay(wallCursor);
  }
  return fromWall(wallCursor);
}

/** Mirror of the forward walk in computeDueAt: steps `minutes` (positive) of SLA-countable
 * time backward from `from`, skipping non-operating hours. */
function computeDueAtBackward({ from, minutes, operatingHours }) {
  let remaining = minutes;
  let wallCursor = toWall(from);
  for (let guard = 0; guard < 3650 && remaining > 0; guard++) {
    const day = operatingHours[SLA_DAY_KEYS[wallCursor.getUTCDay()]];
    if (day?.enabled && day.start && day.end) {
      const dayStartMin = parseHHMM(day.start);
      const dayEndMin = parseHHMM(day.end);
      let cursorMin = wallMinutesOfDay(wallCursor);
      if (cursorMin > dayEndMin) {
        wallCursor = setWallMinutes(wallCursor, dayEndMin);
        cursorMin = dayEndMin;
      }
      if (cursorMin > dayStartMin) {
        const availableToday = cursorMin - dayStartMin;
        if (availableToday >= remaining) {
          wallCursor = setWallMinutes(wallCursor, cursorMin - remaining);
          remaining = 0;
          break;
        }
        remaining -= availableToday;
      }
    }
    wallCursor = endOfPrevWallDay(wallCursor);
  }
  return fromWall(wallCursor);
}

/**
 * Minutes of SLA-countable time that elapsed between `from` and `to`.
 * Mirror of computeDueAt, used to shift a due date forward by exactly the
 * amount of budget-consuming time a pause window overlapped.
 * @param {object} p - { from: Date, to: Date, timeType: string, operatingHours: object }
 */
export function elapsedWorkingMinutes({ from, to, timeType, operatingHours }) {
  if (to <= from) return 0;
  if (timeType === 'Calendar Time' || !operatingHours) {
    return (to.getTime() - from.getTime()) / 60000;
  }
  let elapsed = 0;
  let wallCursor = toWall(from);
  const wallEnd = toWall(to);
  for (let guard = 0; guard < 3650 && wallCursor.getTime() < wallEnd.getTime(); guard++) {
    const dayBoundary = startOfNextWallDay(wallCursor);
    const segmentEnd = wallEnd.getTime() < dayBoundary.getTime() ? wallEnd : dayBoundary;
    const day = operatingHours[SLA_DAY_KEYS[wallCursor.getUTCDay()]];
    if (day?.enabled && day.start && day.end) {
      const dayStartMin = parseHHMM(day.start);
      const dayEndMin = parseHHMM(day.end);
      const cursorMin = wallMinutesOfDay(wallCursor);
      const segmentEndMin = segmentEnd.getTime() === dayBoundary.getTime() ? 1440 : wallMinutesOfDay(segmentEnd);
      const overlapStart = Math.max(cursorMin, dayStartMin);
      const overlapEnd = Math.min(segmentEndMin, dayEndMin);
      if (overlapEnd > overlapStart) elapsed += overlapEnd - overlapStart;
    }
    wallCursor = segmentEnd;
  }
  return elapsed;
}

/** Build the { sun: {enabled,start,end}, ... } shape computeDueAt/elapsedWorkingMinutes expect from an sla_rules row. */
export function operatingHoursFromRuleRow(row) {
  const oh = {};
  for (const d of SLA_DAY_KEYS) {
    oh[d] = { enabled: row[`oh_${d}_enabled`], start: row[`oh_${d}_start`], end: row[`oh_${d}_end`] };
  }
  return oh;
}
