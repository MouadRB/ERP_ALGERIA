import { NextIntlClientProvider } from "next-intl";

type I18nProviderProps = {
  locale: string;
  messages: Record<string, string>;
  children: React.ReactNode;
};

export default function I18nProvider({
  locale,
  messages,
  children
}: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
