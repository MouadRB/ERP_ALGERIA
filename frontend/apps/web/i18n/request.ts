import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const SUPPORTED_LOCALES = ["fr", "ar"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}/common.json`)).default
  };
});
