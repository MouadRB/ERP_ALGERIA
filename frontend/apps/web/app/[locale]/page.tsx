import { redirect } from "next/navigation";

export default function LocaleRootPage({
  params
}: {
  params: { locale: "fr" | "ar" };
}) {
  redirect(`/${params.locale}/login`);
}
