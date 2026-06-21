// Step 1 of the notification form — basic info.
// Collects the notification name, ID (auto-generated), and active/inactive status toggle.
import React from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CardHeader from './CardHeader'
import FieldLabel from '@components/ui/FieldLabel'
import Pill from '@components/ui/Pill'
import Toggle from '@components/ui/Toggle'

// f = form state/handlers from useNotificationForm
// stepRef = DOM ref so the parent can track scroll position for the StepBar
// setActiveStep = highlights this step in the StepBar when the section is focused
export default function Section1Info({ f, stepRef, setActiveStep }) {
  const { t } = useTranslation()

  return (
    <div
      ref={stepRef}
      className="bg-white border-2 border-gray-200 rounded-2xl mb-5 shadow-md hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/50 transition-[border-color,box-shadow] duration-200 overflow-hidden scroll-mt-4"
      onFocus={() => setActiveStep(1)}
    >
      <CardHeader
        num="1"
        label={t('administratorMenu.tabs.notificationRules.form.step1')}
        subtitle={t('administratorMenu.tabs.notificationRules.form.step1')}
        badge={
          <Pill color={f.status ? 'green' : 'red'} variant="solid" dot>
            {f.status ? t('administratorMenu.tabs.notificationRules.form.active') : t('administratorMenu.tabs.notificationRules.form.inactive')}
          </Pill>
        }
      />
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Name field — required, red border on error */}
          <div className="col-span-1 flex flex-col gap-1.5">
            <FieldLabel htmlFor={`f-name-${f.id}`}>
              {t('administratorMenu.tabs.notificationRules.form.name')} <span className="!text-red-500 !font-bold">*</span>
            </FieldLabel>
            <input
              id={`f-name-${f.id}`}
              type="text"
              dir="auto"
              value={f.name}
              onChange={e => f.setName(e.target.value)}
              onBlur={() => f.markTouched('name')} // validate on blur
              placeholder={t('administratorMenu.tabs.notificationRules.form.namePlaceholder')}
              className={`border-2 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 font-medium outline-none transition-all ${
                f.showErr('name')
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 hover:border-gray-300'
              }`}
            />
            {f.showErr('name') && (
              <span className="inline-flex items-center gap-1 !text-[11.5px] !font-semibold !text-red-600 mt-0.5">
                <AlertCircle size={12} strokeWidth={2.5} /> {f.errors.name}
              </span>
            )}
          </div>
          {/* Auto-generated ID — read-only, shown with a lock icon animation */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>
              <span className="inline-flex items-center gap-2">
                {t('administratorMenu.tabs.notificationRules.form.name')}
                <Lock size={14} strokeWidth={2.5} className="text-amber-600 flex-shrink-0 anim-ntf-lock" />
              </span>
            </FieldLabel>
            <div className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
              <span className="!text-amber-500 !font-extrabold !text-[14px] select-none">#</span>
              <span className="!font-mono !font-bold !text-[14px] !text-slate-700 tracking-wider">{f.id}</span>
            </div>
          </div>
          {/* Status toggle — active/inactive, also shown as a badge in the card header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <FieldLabel>{t('administratorMenu.tabs.notificationRules.form.status')}</FieldLabel>
              <span aria-hidden="true" className="!text-gray-300 !text-[18px] !font-bold leading-none">·</span>
              <span className="!text-gray-500 !text-[12px] !font-bold !uppercase tracking-wider">
                {f.status ? t('administratorMenu.tabs.notificationRules.form.active') : t('administratorMenu.tabs.notificationRules.form.inactive')}
              </span>
            </div>
            <div className="mt-1">
              <Toggle checked={f.status} onChange={f.setStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
