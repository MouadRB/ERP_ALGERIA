import AuthPageShell from "@/components/auth/AuthPageShell";
import AuthTabsCard from "@/components/auth/AuthTabsCard";

export default function SignupPage({
  params
}: {
  params: { locale: "fr" | "ar" };
}) {
  return (
    <AuthPageShell>
      <AuthTabsCard activeTab="register" locale={params.locale} />
    </AuthPageShell>
  );
}
