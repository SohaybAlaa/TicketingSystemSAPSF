import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="text-4xl text-center font-black mt-20 mb-5">
        {t("welcome")}
      </h1>
      <h4 className="text-3xl text-center font-black">{t("chatbot")}</h4>
    </>
  );
}
