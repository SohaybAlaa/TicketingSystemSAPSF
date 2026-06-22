import React from 'react'
import { CalendarDays, Globe, Clock, CalendarCheck2, Check } from 'lucide-react'
import Tag from '@components/ui/Tag'

// All 7 days of the week
const ALL_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Preset options for each day — Full Day, Working Hours, Custom
const DAY_PRESETS = [
  { key: 'fullDay',      translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Full Day',      start: '00:00', end: '23:59', color: '#3b82f6' },
  { key: 'workingHours', translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Working Hours', start: '08:00', end: '17:00', color: '#fdc700' },
  { key: 'custom',       translationKey: 'administratorMenu.tabs.slaRules.scheduleTypes.Custom',        start: null,    end: null,    color: '#22c55e' },
]

// Detect which preset matches the current day's hours
function getPresetKey(dayData) {
  if (dayData?.preset) return dayData.preset
  const { start, end } = dayData || {}
  if (start === '00:00' && (end === '23:59' || end === '24:00')) return 'fullDay'
  if (start === '08:00' && end === '17:00') return 'workingHours'
  return 'custom'
}

// The full operating hours calendar section — rendered inside SLARuleDetailCard
// Props:
//   selectedHours     - current hours object (draft or saved)
//   hasUnsavedChanges - shows "Unsaved Changes" badge + enables save button
//   onToggleDay       - (day) => void
//   onTimeChange      - (day, field, value) => void
//   onPresetChange    - (day, presetKey) => void
//   onSave            - () => void
//   t, isRTL
export default function OperatingHoursCalendar({
  selectedHours,
  hasUnsavedChanges,
  onToggleDay,
  onTimeChange,
  onPresetChange,
  onSave,
  t,
  isRTL,
}) {
  const [hoveredPreset, setHoveredPreset] = React.useState(null)

  return (
    <div className="bg-white px-3 sm:px-5 pt-5 pb-5">

      {/* Working Day Calendar + Time Zone header row — stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {t('administratorMenu.tabs.slaRules.operatingHours.workingDayCalendar', 'Working Day Calendar')}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t('administratorMenu.tabs.slaRules.operatingHours.workingDayCalendarDesc', 'UAE regular working week with 5 working days (Sun - Thu)')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:mr-2">
          <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-700 uppercase tracking-wider">
              {t('administratorMenu.tabs.slaRules.operatingHours.timeZone', 'Time Zone')}
            </h4>
            <span className="text-base font-bold text-purple-600">
              {t('administratorMenu.tabs.slaRules.operatingHours.timeZoneValue', 'UTC +3')}
            </span>
          </div>
        </div>
      </div>

      {/* Working Days header + Save button — stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-full bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {t('administratorMenu.tabs.slaRules.operatingHours.workingDays', 'Working Days')}
          </h4>
          {hasUnsavedChanges && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full animate-pulse">
              {t('administratorMenu.tabs.slaRules.operatingHours.unsavedChanges', 'Unsaved Changes')}
            </span>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          className={`${hasUnsavedChanges ? 'action-button' : 'action-button !cursor-not-allowed'} ${isRTL ? 'flex-row-reverse' : ''} sm:!mr-1 self-start sm:self-auto`}
          title={t('administratorMenu.tabs.slaRules.operatingHours.saveChanges', 'Save Changes')}
          onMouseEnter={e => {
            if (!hasUnsavedChanges) return
            const i = e.currentTarget.querySelector('.icon-spin')
            if (i) { i.style.transition = 'transform 1s ease'; i.style.transform = 'rotate(360deg)' }
          }}
          onMouseLeave={e => {
            const i = e.currentTarget.querySelector('.icon-spin')
            if (i) { i.style.transition = 'none'; i.style.transform = 'rotate(0deg)' }
          }}
        >
          <CalendarCheck2 className="w-5 h-5 icon-spin" />
          {t('administratorMenu.tabs.slaRules.operatingHours.save', 'Save')}
        </button>
      </div>

      {/* Day rows */}
      <div className="space-y-2">
        {ALL_DAYS.map((day) => {
          const dayData = selectedHours[day]
          const enabled = dayData?.enabled ?? false
          const currentPreset = enabled ? getPresetKey(dayData) : null
          const isCustom = currentPreset === 'custom'

          return (
            <div
              key={day}
              className={`rounded-lg border-2 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 transition-all duration-200 ${
                enabled
                  ? 'border-green-200 bg-white shadow-sm hover:shadow-md hover:border-green-400'
                  : 'border-gray-200 bg-gray-50 opacity-70 hover:opacity-90 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              {/* Row 1 (mobile): checkbox + day name + Tag */}
              <div className="flex items-center gap-3 sm:contents">

                {/* Enable/disable toggle checkbox */}
                <button
                  onClick={() => onToggleDay(day)}
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    enabled ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-500 hover:border-gray-600'
                  }`}
                >
                  {enabled && <Check className="w-3 h-3" strokeWidth={3} />}
                </button>

                {/* Day name */}
                <span className={`text-sm font-semibold w-24 flex-shrink-0 ${enabled ? 'text-slate-700' : 'text-gray-600'}`}>
                  {t(`administratorMenu.tabs.slaRules.operatingHours.days.${day}`, day)}
                </span>

              </div>

              {enabled ? (
                <>
                  {/* Active preset pill buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DAY_PRESETS.map(p => {
                      const active = currentPreset === p.key
                      const hovered = hoveredPreset === `${day}-${p.key}`
                      const pillStyle = active
                        ? {
                            backgroundColor: p.color,
                            borderColor: p.color,
                            ...(hovered && { boxShadow: `0 4px 12px ${p.color}40`, transform: 'scale(1.05)' }),
                          }
                        : hovered
                          ? {
                              backgroundColor: `${p.color}12`,
                              borderColor: `${p.color}60`,
                              color: p.color,
                              boxShadow: `0 2px 8px ${p.color}20`,
                              transform: 'scale(1.05)',
                            }
                          : {}
                      return (
                        <button
                          key={p.key}
                          onClick={() => onPresetChange(day, p.key)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                            active ? 'text-white shadow-sm' : 'bg-white text-gray-500 border-gray-200'
                          }`}
                          style={pillStyle}
                          onMouseEnter={() => setHoveredPreset(`${day}-${p.key}`)}
                          onMouseLeave={() => setHoveredPreset(null)}
                        >
                          {t(p.translationKey)}
                        </button>
                      )
                    })}
                  </div>

                  {/* Time inputs — editable only when Custom preset is selected */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 font-medium w-8">
                        {t('administratorMenu.tabs.slaRules.operatingHours.start', 'Start')}
                      </label>
                      <input
                        type="time"
                        value={dayData?.start ?? '08:00'}
                        disabled={!isCustom}
                        onChange={(e) => onTimeChange(day, 'start', e.target.value)}
                        className={`border rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium transition-all ${
                          isCustom
                            ? 'border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400'
                            : 'border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    <span className="text-gray-400 hidden sm:block">—</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 font-medium w-8">
                        {t('administratorMenu.tabs.slaRules.operatingHours.end', 'End')}
                      </label>
                      <input
                        type="time"
                        value={dayData?.end ?? '17:00'}
                        disabled={!isCustom}
                        onChange={(e) => onTimeChange(day, 'end', e.target.value)}
                        className={`border rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium transition-all ${
                          isCustom
                            ? 'border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400'
                            : 'border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <Tag
                    type="scheduleType"
                    value={currentPreset === 'fullDay' ? 'Full Day' : currentPreset === 'workingHours' ? 'Working Hours' : 'Custom'}
                    t={t} isRTL={isRTL} showIcon className="flex-shrink-0 hidden sm:flex"
                  />
                </>
              ) : (
                <>
                  {/* Disabled preset pills when day is off */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DAY_PRESETS.map(p => (
                      <button
                        key={p.key}
                        disabled
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      >
                        {t(p.translationKey)}
                      </button>
                    ))}
                  </div>

                  {/* Disabled time inputs */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 font-medium w-8">
                        {t('administratorMenu.tabs.slaRules.operatingHours.start', 'Start')}
                      </label>
                      <input
                        type="time"
                        value={dayData?.start ?? '08:00'}
                        disabled
                        className="border rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <span className="text-gray-300 hidden sm:block">—</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 font-medium w-8">
                        {t('administratorMenu.tabs.slaRules.operatingHours.end', 'End')}
                      </label>
                      <input
                        type="time"
                        value={dayData?.end ?? '17:00'}
                        disabled
                        className="border rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <Tag type="scheduleType" value="Day Off" t={t} isRTL={isRTL} showIcon className="flex-shrink-0 hidden sm:flex" />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
