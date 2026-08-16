"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const VALID_STATUSES = new Set([
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
]);

export async function updateOrderStatus(_previousState, formData) {
  const orderId = String(formData.get("order_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!/^[1-9]\d*$/.test(orderId) || !VALID_STATUSES.has(status)) {
    return { status: "error", message: "شماره سفارش یا وضعیت انتخاب‌شده معتبر نیست." };
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return { status: "error", message: "دسترسی مدیریتی شما معتبر نیست." };
    const { user, supabase } = admin;

    const response = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, status")
      .maybeSingle();

    if (response.error || !response.data) {
      console.error("[admin-orders] Status UPDATE failed", {
        userId: user.id,
        orderId,
        requestedStatus: status,
        status: response.status,
        statusText: response.statusText,
        code: response.error?.code,
        message: response.error?.message,
        details: response.error?.details,
        hint: response.error?.hint,
        rowReturned: Boolean(response.data),
      });
      return {
        status: "error",
        message: response.error?.code === "42501"
          ? "دسترسی لازم برای تغییر وضعیت سفارش وجود ندارد. لطفاً دوباره وارد پنل مدیریت شوید."
          : "تغییر وضعیت سفارش انجام نشد. لطفاً دوباره تلاش کنید.",
      };
    }

    revalidatePath("/admin/dashboard/orders");
    return {
      status: "success",
      message: "وضعیت سفارش با موفقیت به‌روزرسانی شد.",
      orderStatus: response.data.status,
    };
  } catch (error) {
    console.error("[admin-orders] Unexpected status update failure", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return { status: "error", message: "ارتباط با سرویس سفارش‌ها برقرار نشد." };
  }
}
