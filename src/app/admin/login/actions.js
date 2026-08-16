"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getPersianAuthError(error) {
  const message = error?.message?.toLowerCase() ?? "";
  const code = error?.code?.toLowerCase() ?? "";

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "ایمیل یا رمز عبور نادرست است.";
  }

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "ایمیل حساب کاربری هنوز تأیید نشده است.";
  }

  if (
    error?.status === 429 ||
    code.includes("rate_limit") ||
    message.includes("too many requests")
  ) {
    return "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره امتحان کنید.";
  }

  if (error?.status >= 500) {
    return "سرویس ورود موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.";
  }

  return "ورود به پنل انجام نشد. لطفاً دوباره تلاش کنید.";
}

export async function loginAdmin(_previousState, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "لطفاً ایمیل و رمز عبور را وارد کنید." };
  }

  let error;

  try {
    const supabase = await createSupabaseServerClient();
    ({ error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch (connectionError) {
    console.error("Admin authentication configuration error:", connectionError);
    return { error: "اتصال به سرویس ورود برقرار نشد. لطفاً دوباره تلاش کنید." };
  }

  if (error) {
    // Log a serialized value because the Next.js development logger otherwise
    // reduces Supabase AuthError instances to an unhelpful empty object.
    console.error("[Supabase:adminSignIn] Sign-in failed " + JSON.stringify({
      name: error.name,
      code: error.code,
      status: error.status,
      message: error.message,
    }));
    return { error: getPersianAuthError(error) };
  }

  redirect("/admin/dashboard");
}
