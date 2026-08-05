import { listBoardDares, getSettings } from "@/lib/dares";
import { maybeTick } from "@/lib/tick";

export const dynamic = "force-dynamic";

export async function GET() {
  maybeTick();
  const [dares, settings] = await Promise.all([listBoardDares(), getSettings()]);
  return Response.json({ dares, paused: settings.paused });
}
