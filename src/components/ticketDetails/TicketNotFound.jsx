import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle, Repeat } from "lucide-react";
import ErrorPage from "@components/common/ErrorPage";

export default function TicketNotFound({ handleBack }) {
  const { t } = useTranslation();
  
  return (
    <ErrorPage
      icon={<AlertTriangle className="w-8 h-8 text-yellow-300" />}
      title={t("ticketDetails.notFound.title")}
      description={t("ticketDetails.notFound.description")}
      tip={t("ticketDetails.notFound.tip")}
      actions={[
        {
          text: t("ticketDetails.notFound.backToList"),
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: handleBack,
          primary: true
        },
        {
          text: t("ticketDetails.notFound.tryAgain"),
          icon: <Repeat className="w-4 h-4" />,
          onClick: () => window.location.reload(),
          primary: false
        }
      ]}
      maxWidth="lg"
    />
  );
}
