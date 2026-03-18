import { notFound } from 'next/navigation';
import ThemeRegistry from '@/providers/ThemeRegistry';
import QueryProvider from '@/providers/QueryProvider';
import I18nProvider from '@/providers/I18nProvider';
import SessionProvider from '@/providers/SessionProvider';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: 'fr' | 'ar' };
}) {
  const { locale } = params;
  let messages: Record<string, string>;

  try {
    const common = (await import(`../../messages/${locale}/common.json`)).default;
    const oms = (await import(`../../messages/${locale}/oms.json`)).default;
    const pim = (await import(`../../messages/${locale}/pim.json`)).default;
    const catalogue = (await import(`../../messages/${locale}/catalogue.json`)).default;
    const inventory = (await import(`../../messages/${locale}/inventory.json`)).default;
    const crm = (await import(`../../messages/${locale}/crm.json`)).default;
    const procurement = (await import(`../../messages/${locale}/procurement.json`)).default;
    const rapports = (await import(`../../messages/${locale}/rapports.json`)).default;

    messages = { common, oms, pim, catalogue, inventory, crm, procurement, rapports };
  } catch {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Cairo:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRegistry>
          <QueryProvider>
            <SessionProvider>
              <I18nProvider locale={locale} messages={messages}>
                {children}
              </I18nProvider>
            </SessionProvider>
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}