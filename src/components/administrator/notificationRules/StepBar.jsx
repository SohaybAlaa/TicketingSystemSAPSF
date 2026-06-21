import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Pencil } from 'lucide-react'
import { FORM_STEPS } from '@data/notificationRules'

export default function StepBar({ activeStep, scrollProgress, completedSteps, onStepClick }) {
  const { t } = useTranslation()
  // Fall back to activeStep when scrollProgress isn't provided
  const progress = typeof scrollProgress === 'number' ? scrollProgress : activeStep

  // Track direction (forward/backward) for the line-fill anchor
  const prevProgressRef = useRef(progress)
  const dirRef = useRef('forward')
  if (progress > prevProgressRef.current + 0.001) dirRef.current = 'forward'
  else if (progress < prevProgressRef.current - 0.001) dirRef.current = 'backward'
  prevProgressRef.current = progress
  const dir = dirRef.current

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-500" />
          <span className="!text-[15px] !font-extrabold !text-slate-700 !uppercase tracking-[0.15em]">{t('administratorMenu.tabs.notificationRules.form.progress')}</span>
        </div>
        <div className="!text-[15px] !font-semibold !text-gray-500">
          {t('administratorMenu.tabs.notificationRules.form.step')} <span className="!text-amber-600 !font-extrabold tabular-nums">{activeStep}</span>
          <span className="!text-gray-400"> / {FORM_STEPS.length}</span>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {FORM_STEPS.map((step, i) => {
            const isDone = completedSteps.includes(step.num)
            const isActive = activeStep === step.num
            const isIdle = !isDone && !isActive
            // Connector line going OUT of this step is "flowing" while this step is active
            const isLineFlowing = isActive

            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => onStepClick(step.num)}
                  className={`flex items-center gap-1.5 sm:gap-3 group cursor-pointer focus:outline-none flex-shrink-0 transition-all duration-200 ${isIdle ? 'opacity-40 hover:opacity-70' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-yellow-400 pointer-events-none"
                        style={{ animation: 'stepbar-pulse-ring 1.6s ease-out infinite' }}
                      />
                    )}
                    <div
                      className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-sm ${
                        isIdle ? 'bg-white border-2 border-gray-200' : ''
                      }`}
                      style={isIdle ? undefined : {
                        backgroundColor: isActive ? '#facc15' /* yellow-400 */ : '#22c55e' /* green-500 */,
                        boxShadow: isActive
                          ? '0 8px 18px -4px rgba(250, 204, 21, 0.55)'
                          : '0 4px 10px -2px rgba(34, 197, 94, 0.45)',
                        transition: 'background-color 120ms ease, box-shadow 120ms ease',
                      }}
                    >
                      {/* Crossfaded icon stack — prevents flicker when circle state changes */}
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: isActive ? 1 : 0, transition: 'opacity 180ms ease' }}
                      >
                        <Pencil
                          size={16}
                          className="text-yellow-900"
                          strokeWidth={2.75}
                          style={{
                            animation: 'stepbar-pencil-wiggle 1.4s ease-in-out infinite',
                            transformOrigin: 'center',
                          }}
                        />
                      </span>
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: !isActive && isDone ? 1 : 0, transition: 'opacity 180ms ease' }}
                      >
                        <Check size={18} className="text-white" strokeWidth={3} />
                      </span>
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: isIdle ? 1 : 0, transition: 'opacity 180ms ease' }}
                      >
                        <span className="!text-[15px] !font-extrabold !text-gray-400">{step.num}</span>
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col text-left min-w-0">
                    <span className={`leading-tight tracking-tight transition-colors duration-200 ${
                      isActive
                        ? '!text-[15px] !font-extrabold !text-slate-900'
                        : isDone
                          ? '!text-[15px] !font-bold !text-green-700'
                          : '!text-[15px] !font-bold !text-gray-300'
                    }`}>
                      {t(`administratorMenu.tabs.notificationRules.form.step${step.num}Label`)}
                    </span>
                    <span className={`!text-[11.5px] !font-semibold mt-0.5 leading-tight transition-colors duration-200 ${
                      isActive
                        ? '!text-amber-600'
                        : isDone
                          ? '!text-green-500'
                          : '!text-gray-300'
                    }`}>
                      {t(`administratorMenu.tabs.notificationRules.form.step${step.num}Hint`)}
                    </span>
                  </div>
                </button>

                {i < FORM_STEPS.length - 1 && (() => {
                  // Line at index i connects step.num (source) and step.num+1 (target).
                  // Yellow fill follows scroll progress: empty when progress <= step.num,
                  // proportional while crossing this line, full once we've reached the next step,
                  // then settles to 0 (green takes over) once we've moved further on.
                  let yellowPct = 0
                  if (progress > step.num + 1.5) yellowPct = 0           // settled — green takes over
                  else if (progress >= step.num + 1) yellowPct = 100      // line just behind active
                  else if (progress > step.num) yellowPct = (progress - step.num) * 100  // crossing
                  return (
                    <div className="flex-1 mx-2 h-[3px] relative overflow-hidden rounded-full bg-gray-200">
                      {/* Green settled fill — grows left → right when previous step is done */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: isDone ? '100%' : '0%',
                          backgroundColor: '#4ade80',
                          transition: 'width 200ms ease-out',
                        }}
                      />
                      {/* Yellow overlay — width follows scroll progress; anchored to trailing edge by direction */}
                      <div
                        className="absolute inset-y-0 rounded-full"
                        style={{
                          [dir === 'backward' ? 'right' : 'left']: 0,
                          width: `${yellowPct}%`,
                          backgroundColor: '#facc15',
                          transition: 'width 80ms linear',
                        }}
                      />
                      {/* Yellow sheen flowing along the line out of the active step (forward intent) */}
                      {isLineFlowing && !isDone && (
                        <div
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 right-0 rounded-full"
                          style={{
                            background:
                              'linear-gradient(90deg, transparent 0%, rgba(250, 204, 21, 0.95) 50%, transparent 100%)',
                            animation: 'stepbar-line-flow 1.4s ease-in-out infinite',
                          }}
                        />
                      )}
                    </div>
                  )
                })()}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
