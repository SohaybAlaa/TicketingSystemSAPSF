// Step 4 of the notification form — email content.
// Contains the email subject and body fields with a live preview mode.
// Supports placeholder tokens (e.g. {{ticket_id}}) that get highlighted in the preview.
import React from 'react'
import { Lock, RefreshCw, Mail, Eye, Pencil, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CardHeader from './CardHeader'
import PlaceholderBar from './PlaceholderBar'
import renderWithPlaceholders from './renderWithPlaceholders'
import FieldLabel from '@components/ui/FieldLabel'

// f = form state/handlers from useNotificationForm
// stepRef = DOM ref so the parent can track scroll position for the StepBar
// setActiveStep = highlights this step in the StepBar when the section is focused
export default function Section4Email({ f, stepRef, setActiveStep }) {
  const { t } = useTranslation()

  return (
    <div
      ref={stepRef}
      className="bg-white border-2 border-gray-200 rounded-2xl mb-5 shadow-md hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/50 transition-[border-color,box-shadow] duration-200 overflow-hidden scroll-mt-4"
      onFocus={() => setActiveStep(4)}
    >
      <CardHeader
        num="4"
        label={t('administratorMenu.tabs.notificationRules.form.step4')}
        subtitle={t('administratorMenu.tabs.notificationRules.template.subtitle')}
        action={null}
      />
      <div className="p-6">
        {/* Sender row — fixed from address, not editable by the user */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 via-white to-white hover:border-yellow-400 transition-colors duration-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-300/60 flex-shrink-0 ring-2 ring-white">
            <Mail size={18} className="text-yellow-900" strokeWidth={2.25} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="!text-[10px] !font-extrabold !uppercase !tracking-[0.14em] !text-gray-400 leading-none mb-1">{t('administratorMenu.tabs.notificationRules.template.from')}</span>
            <span className="!font-mono !font-bold !text-[13px] !text-slate-800 truncate">hr_team@Klenka.com</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200 !text-[10px] !font-extrabold !uppercase !tracking-wider !text-gray-500 flex-shrink-0">
            <Lock size={10} strokeWidth={2.5} /> {t('administratorMenu.tabs.notificationRules.template.locked')}
          </span>
        </div>

        {/* Placeholder bar — click a token to insert it at the cursor position in subject or body */}
        <PlaceholderBar onInsert={f.insertPlaceholder} disabled={!f.isEditingEmail} />

        {/* Toggle between Preview and Edit modes */}
        <style>{`
          @keyframes eyeLook {
            0%, 100% { transform: translateX(0) scaleY(1); }
            18% { transform: translateX(-1.5px) scaleY(1); }
            36% { transform: translateX(0) scaleY(1); }
            54% { transform: translateX(1.5px) scaleY(1); }
            72% { transform: translateX(0) scaleY(1); }
            90% { transform: translateX(0) scaleY(0.1); }
            94% { transform: translateX(0) scaleY(1); }
          }
          .anim-eye { animation: eyeLook 3s ease-in-out infinite; transform-origin: center; display: inline-block; }
        `}</style>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel className="!text-[15px] !tracking-[0.14em]">
            <span className="inline-flex items-center gap-2">
              {f.isEditingEmail ? t('administratorMenu.tabs.notificationRules.form.clickToEdit') : t('administratorMenu.tabs.notificationRules.template.title')}
              <Eye size={20} strokeWidth={2.25} className="text-slate-700 flex-shrink-0 anim-eye" />
            </span>
          </FieldLabel>
          <div className="flex items-center gap-3">
            {/* Apply template button — resets subject + body to the default template */}
            {f.isEditingEmail && (
              <button
                type="button"
                onClick={f.applyTemplate}
                title={t('administratorMenu.tabs.notificationRules.template.applyTemplateTooltip')}
                className="group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg !text-[11px] !font-bold !uppercase tracking-wider !text-gray-500 hover:!text-amber-700 hover:bg-amber-50 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40"
              >
                <RefreshCw
                  size={12}
                  strokeWidth={2.5}
                  className="transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]"
                /> {t('administratorMenu.tabs.notificationRules.template.applyTemplate')}
              </button>
            )}
            <div
              role="tablist"
              aria-label={t('administratorMenu.tabs.notificationRules.template.contentMode')}
              className="inline-flex items-center gap-1 p-1 rounded-xl border-2 border-gray-200 bg-gray-50 shadow-inner"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!f.isEditingEmail}
                onClick={() => f.setIsEditingEmail(false)}
                className={`flex items-center gap-1.5 h-7 px-3 rounded-lg !text-[12px] !font-bold !uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
                  !f.isEditingEmail
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-400 !text-yellow-900 shadow-sm shadow-yellow-300/60 border border-amber-400'
                    : '!text-gray-500 hover:!text-slate-700'
                }`}
              >
                <Eye size={13} strokeWidth={2.5} /> {t('administratorMenu.tabs.notificationRules.actions.preview')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={f.isEditingEmail}
                onClick={() => f.setIsEditingEmail(true)}
                className={`flex items-center gap-1.5 h-7 px-3 rounded-lg !text-[12px] !font-bold !uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
                  f.isEditingEmail
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-400 !text-yellow-900 shadow-sm shadow-yellow-300/60 border border-amber-400'
                    : '!text-gray-500 hover:!text-slate-700'
                }`}
              >
                <Pencil size={13} strokeWidth={2.75} /> {t('administratorMenu.tabs.notificationRules.actions.edit')}
              </button>
            </div>
          </div>
        </div>

        {/* Email card — switches between rendered preview and editable inputs */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-yellow-50/40 via-white to-white p-5 shadow-sm hover:border-yellow-400 transition-colors duration-200">
          {/* Subject */}
          <div className="mb-1.5">
            <span className="!text-[9.5px] !font-extrabold !uppercase !tracking-[0.14em] !text-gray-400">
              {t('administratorMenu.tabs.notificationRules.template.subject')} {f.isEditingEmail && <span className="!text-red-500 !font-extrabold">*</span>}
            </span>
          </div>
          {/* Subject: input in edit mode, rendered text with highlighted tokens in preview mode */}
          {f.isEditingEmail ? (
            <>
              <input
                ref={f.subjectRef}
                type="text"
                dir="auto"
                value={f.subject}
                onChange={e => f.setSubject(e.target.value)}
                onFocus={() => { f.activeFieldRef.current = 'subject' }}
                onBlur={() => f.markTouched('subject')}
                placeholder={t('administratorMenu.tabs.notificationRules.template.subjectPlaceholder')}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-[15px] bg-white text-slate-900 font-bold outline-none transition-all ${
                  f.showErr('subject')
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 mb-1'
                    : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 hover:border-gray-300 mb-4'
                }`}
              />
              {f.showErr('subject') && (
                <span className="inline-flex items-center gap-1 !text-[11.5px] !font-semibold !text-red-600 mb-4">
                  <AlertCircle size={12} strokeWidth={2.5} /> {f.errors.subject}
                </span>
              )}
            </>
          ) : (
            <div dir="auto" className="!text-[15px] !font-bold !text-slate-900 mb-4 leading-snug">
              {f.subject
                ? renderWithPlaceholders(f.subject)
                : <span className="!text-gray-400 !font-normal italic">{t('administratorMenu.tabs.notificationRules.template.noSubject')}</span>}
            </div>
          )}

          {/* Body: textarea in edit mode, rendered text with highlighted tokens in preview mode */}
          <div className="mb-1.5">
            <span className="!text-[9.5px] !font-extrabold !uppercase !tracking-[0.14em] !text-gray-400">
              {t('administratorMenu.tabs.notificationRules.template.body')} {f.isEditingEmail && <span className="!text-red-500 !font-extrabold">*</span>}
            </span>
          </div>
          {f.isEditingEmail ? (
            <>
              <textarea
                ref={f.bodyRef}
                dir="auto"
                value={f.body}
                onChange={e => f.setBody(e.target.value)}
                onFocus={() => { f.activeFieldRef.current = 'body' }}
                onBlur={() => f.markTouched('body')}
                rows={9}
                placeholder={t('administratorMenu.tabs.notificationRules.template.bodyPlaceholder')}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-[13px] bg-white text-slate-800 font-medium outline-none transition-colors resize-none overflow-hidden font-sans leading-relaxed ${
                  f.showErr('body')
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
                    : 'border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 hover:border-gray-300'
                }`}
              />
              {f.showErr('body') && (
                <span className="inline-flex items-center gap-1 !text-[11.5px] !font-semibold !text-red-600 mt-1">
                  <AlertCircle size={12} strokeWidth={2.5} /> {f.errors.body}
                </span>
              )}
            </>
          ) : (
            <div dir="auto" className="!text-[13px] !text-slate-700 leading-relaxed whitespace-pre-wrap">
              {f.body
                ? renderWithPlaceholders(f.body)
                : <span className="!text-gray-400 italic">{t('administratorMenu.tabs.notificationRules.template.noBody')}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
