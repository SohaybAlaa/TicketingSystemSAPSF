import { useTranslation } from "react-i18next";
import AdminLayout from "@layouts/AdminLayout";

export default function Home() {
  const { t } = useTranslation();
  const adminName = "Admin";

  return (
    <>
    <AdminLayout
      title={t("welcome")}
      subtitle={t("chatbot", { name: adminName })}
    >
    </AdminLayout>
    </>
  );
}
