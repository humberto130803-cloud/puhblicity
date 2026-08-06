import { ProsePage } from "@/components/prose-page";
import { getT } from "@/lib/i18n";
import { pageContent } from "@/lib/i18n/pages";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.meta.privacyTitle };
}

export default async function PrivacyPage() {
  const { locale } = await getT();
  return <ProsePage content={pageContent("privacy", locale)} />;
}
