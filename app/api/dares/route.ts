import { listBoardDares, getSettings } from "@/lib/dares";
import { maybeTick } from "@/lib/tick";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET() {
  maybeTick();
  const locale = await getLocale();
  const [dares, settings] = await Promise.all([listBoardDares(locale), getSettings()]);
  return Response.json({ dares, paused: settings.paused });
}
