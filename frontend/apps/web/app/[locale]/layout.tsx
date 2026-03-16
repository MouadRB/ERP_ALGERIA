import { notFound } from "next/navigation";
import ThemeRegistry from "@/providers/ThemeRegistry";
import QueryProvider from "@/providers/QueryProvider";
import I18nProvider from "@/providers/I18nProvider";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: "fr" | "ar" };
}) {
  const { locale } = params;
  let messages: Record<string, string>;

  try {
    messages = (await import(`../../messages/${locale}/common.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <ThemeRegistry>
          <QueryProvider>
            <I18nProvider locale={locale} messages={messages}>
              {children}
            </I18nProvider>
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
