"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function logoutAdmin() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[Supabase:adminSignOut] Sign-out failed", {
        name: error.name,
        code: error.code,
        status: error.status,
        message: error.message,
      });
      return { error: "خروج از حساب انجام نشد. لطفاً دوباره تلاش کنید." };
    }
  } catch (error) {
    console.error("[Supabase:adminSignOut] Unexpected failure", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return { error: "ارتباط با سرویس خروج برقرار نشد. لطفاً دوباره تلاش کنید." };
  }

  redirect("/admin/login");
}
