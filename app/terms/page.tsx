import { ProsePage } from "@/components/prose-page";
import { getT } from "@/lib/i18n";
import { pageContent } from "@/lib/i18n/pages";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.meta.termsTitle };
}

export default async function TermsPage() {
  const { locale } = await getT();
  return <ProsePage content={pageContent("terms", locale)} />;
}
