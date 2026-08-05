import { getSession, isAdminPubkey } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  return Response.json({
    session,
    isAdmin: !!session && isAdminPubkey(session.pubkey),
  });
}
