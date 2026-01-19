import { Bot, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import ErrorPage from "@components/common/ErrorPage";

export default function Error404() {
  const { t } = useTranslation();
  
  // Custom 404 badge component
  const badge = (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm">
      <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.35)]" />
      <span>{t("error404.badge", "Error • 404")}</span>
    </div>
  );
  
  // Custom 404 title with special styling
  const customTitle = (
    <div className="mb-4">
      <div className="relative text-center">
        <div className="select-none text-[6rem] sm:text-[8rem] font-extrabold tracking-tight text-white/10 leading-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-5 py-2 rounded-2xl border border-white/10 bg-gray-950/40 backdrop-blur">
            <p className="!text-xl !sm:text-2xl !font-bold !text-white">
              {t("error404.title", "PAGE NOT FOUND")}
            </p>
          </div>
        </div>
      </div>
      <h2 className="!text-white text-center tracking-tight mt-6">
        {t("error404.heading", "Oops! We couldn't find that page.")}
      </h2>
    </div>
  );
  
  return (
    <ErrorPage
      icon={<Bot className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" />}
      title={customTitle}
      description={t(
        "error404.message",
        "The page you're looking for might have been removed, renamed, or is temporarily unavailable. Try going back, refreshing, or head home."
      )}
      badge={badge}
      actions={[
        {
          text: t("error404.goBack", "Go Back"),
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: () => window.history.back(),
          primary: true,
          reverseIconInRTL: true
        },
        {
          text: t("error404.tryAgain", "Try Again"),
          icon: <RefreshCw className="w-4 h-4" />,
          onClick: () => window.location.reload(),
          primary: false
        },
        {
          text: t("error404.goHome", "Go Home"),
          icon: <Home className="w-4 h-4" />,
          onClick: () => (window.location.href = "/"),
          primary: false
        }
      ]}
      maxWidth="2xl"
    />
  );
}
