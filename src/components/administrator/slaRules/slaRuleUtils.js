// All 7 days of the week used across the SLA rules operating hours
export const ALL_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Preset day schedules for the operating hours calendar
export const DAY_PRESETS = [
  { key: 'fullDay',      translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Full Day',      start: '00:00', end: '23:59', color: '#3b82f6' },
  { key: 'workingHours', translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Working Hours', start: '08:00', end: '17:00', color: '#fdc700' },
  { key: 'custom',       translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Custom',        start: null,    end: null,    color: '#22c55e' },
]

// Priority sort order for the comparator used in the AG Grid priority column
export const PRIORITY_ORDER = {
  'Critical': 1,
  'High':     2,
  'Medium':   3,
  'Low':      4,
}

// Detect which preset matches the current day data
export function getPresetKey(dayData) {
  if (dayData?.preset) return dayData.preset
  const { start, end } = dayData || {}
  if (start === '00:00' && (end === '23:59' || end === '24:00')) return 'fullDay'
  if (start === '08:00' && end === '17:00') return 'workingHours'
  return 'custom'
}

// Parse a response time string to minutes for sorting (e.g. "2 Hours" → 120)
export function parseResponseTime(timeString) {
  if (!timeString) return 0
  const match = timeString.match(/(\d+)\s*(hour|minute|day)s?/i)
  if (!match) return 0
  const value = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  if (unit === 'minute') return value
  if (unit === 'hour') return value * 60
  if (unit === 'day') return value * 60 * 24
  return 0
}

// Translate a response time string using i18n (e.g. "2 Hours" → "2 ساعات" in Arabic)
export function translateResponseTime(timeString, t) {
  if (!timeString) return ''
  const match = timeString.match(/^(\d+)\s*(Hour|Minute|Day)s?$/i)
  if (!match) return timeString
  const value = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  const unitKey = value === 1 ? unit : `${unit}s`
  return `${value} ${t(`common.timeUnits.${unitKey}`)}`
}

// Determine the timeType label from an operatingHours object
export function determineTimeType(operatingHours) {
  const enabledDays = ALL_DAYS.filter(day => operatingHours[day]?.enabled)
  const allFullDay = enabledDays.every(day => {
    const { start, end } = operatingHours[day]
    return start === '00:00' && (end === '23:59' || end === '24:00')
  })
  const allWorkingHours =
    enabledDays.length === 5 &&
    ['sun', 'mon', 'tue', 'wed', 'thu'].every(day => {
      const d = operatingHours[day]
      return d?.enabled && d.start === '08:00' && d.end === '17:00'
    }) &&
    !operatingHours.fri?.enabled &&
    !operatingHours.sat?.enabled

  if (allFullDay && enabledDays.length === 7) return 'Calendar Time'
  if (allWorkingHours) return 'Working Time'
  return 'Custom Time'
}

// Default operating hours for a newly created SLA rule (Sun–Thu, 08:00–17:00)
export const DEFAULT_OPERATING_HOURS = {
  sun: { enabled: true,  start: '08:00', end: '16:00' },
  mon: { enabled: true,  start: '08:00', end: '16:00' },
  tue: { enabled: true,  start: '08:00', end: '16:00' },
  wed: { enabled: true,  start: '08:00', end: '16:00' },
  thu: { enabled: true,  start: '08:00', end: '16:00' },
  fri: { enabled: false, start: '08:00', end: '16:00' },
  sat: { enabled: false, start: '08:00', end: '16:00' },
}
