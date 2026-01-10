import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle, Repeat } from "lucide-react";

export default function TicketNotFound({ handleBack }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-red-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-30" />
      </div>

      <div className="relative w-full max-w-lg px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="p-8 sm:p-10">
            {/* Icon */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-yellow-500/20 border border-white/10 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-300" />
            </div>

            {/* Text */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white tracking-wide">
                {t("ticketDetails.notFound.title")}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                {t("ticketDetails.notFound.description")}
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20 transform hover:scale-[1.02] active:scale-[0.99] transition"
                >
                  {t("ticketDetails.notFound.backToList")}
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition"
                >
                  {t("ticketDetails.notFound.tryAgain")}
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Small hint / meta */}
              <div className="mt-6 text-xs text-white/50">
                {t("ticketDetails.notFound.tip")}
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent rounded-b-3xl" />
        </div>
      </div>
    </div>
  );
}
