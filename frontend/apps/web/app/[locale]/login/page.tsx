import AuthPageShell from "@/components/auth/AuthPageShell";
import AuthTabsCard from "@/components/auth/AuthTabsCard";

export default function LoginPage({
  params,
}: {
  params: { locale: "fr" | "ar" };
}) {
  return (
    <AuthPageShell>
      <AuthTabsCard activeTab="login" locale={params.locale} />
    </AuthPageShell>
  );
}
