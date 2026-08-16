import { refreshSupabaseSession } from "./lib/supabase-proxy";

export async function proxy(request) {
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
