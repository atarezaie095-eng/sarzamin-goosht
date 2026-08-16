import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export async function getAuthenticatedAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: isAdmin, error: authorizationError } = await supabase.rpc(
    "is_admin",
  );

  if (authorizationError || isAdmin !== true) {
    console.warn("[admin-auth] Administrator authorization denied", {
      userId: user.id,
      reason: authorizationError ? "authorization-check-failed" : "not-admin",
      errorCode: authorizationError?.code,
    });
    return null;
  }

  return { user, supabase };
}

export async function requireAuthenticatedAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
