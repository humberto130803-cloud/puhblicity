import { ProsePage } from "@/components/prose-page";
import { getT } from "@/lib/i18n";
import { pageContent } from "@/lib/i18n/pages";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.meta.moneyTitle };
}

export default async function MoneyPage() {
  const { locale } = await getT();
  return <ProsePage content={pageContent("money", locale)} />;
}
