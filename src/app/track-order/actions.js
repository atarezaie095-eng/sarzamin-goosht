"use server";

import { createClient } from "@supabase/supabase-js";

const MAX_BIGINT = 9223372036854775807n;

export async function trackOrder(_previousState, formData) {
  const orderId = normalizeOrderId(formData.get("order_id"));
  const phone = normalizePhone(formData.get("phone"));
  const fields = {};

  if (!orderId) fields.order_id = "شماره سفارش معتبر نیست.";
  if (!phone) fields.phone = "شماره موبایل واردشده معتبر نیست.";
  if (Object.keys(fields).length) {
    return { status: "error", message: "لطفاً اطلاعات واردشده را بررسی کنید.", fields };
  }

  try {
    const supabase = createPublicSupabaseClient();
    const response = await supabase
      .rpc("get_order_status", { p_order_id: orderId, p_phone: phone })
      .maybeSingle();

    if (response.error) {
      console.error("[order-tracking] RPC failed", {
        code: response.error.code,
        message: response.error.message,
        details: response.error.details,
        hint: response.error.hint,
        status: response.status,
        statusText: response.statusText,
      });
      return { status: "error", message: "پیگیری سفارش با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.", fields: {} };
    }

    if (!response.data) {
      return { status: "not-found", message: "سفارشی با این مشخصات پیدا نشد.", fields: {} };
    }

    return {
      status: "success",
      message: "",
      fields: {},
      order: {
        orderId: String(response.data.order_id),
        status: response.data.status,
        totalPrice: response.data.total_price,
        createdAt: response.data.created_at,
      },
    };
  } catch (error) {
    console.error("[order-tracking] Unexpected failure", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", message: "ارتباط با سامانه پیگیری برقرار نشد.", fields: {} };
  }
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase connection settings are not available");

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function normalizeOrderId(value) {
  const digits = toEnglishDigits(String(value ?? "").trim());
  if (!/^[1-9]\d{0,18}$/.test(digits)) return null;
  try {
    return BigInt(digits) <= MAX_BIGINT ? digits : null;
  } catch {
    return null;
  }
}

function normalizePhone(value) {
  const digits = toEnglishDigits(String(value ?? "")).replace(/[\s()-]/g, "");
  const normalized = digits.startsWith("+98")
    ? `0${digits.slice(3)}`
    : digits.startsWith("0098")
      ? `0${digits.slice(4)}`
      : digits.startsWith("98")
        ? `0${digits.slice(2)}`
        : digits;
  return /^09\d{9}$/.test(normalized) ? normalized : null;
}

function toEnglishDigits(value) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
