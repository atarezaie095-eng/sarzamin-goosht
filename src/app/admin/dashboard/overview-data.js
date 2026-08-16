import "server-only";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const trackedStatuses = ["pending", "confirmed", "preparing", "shipped", "completed", "cancelled"];
const STORE_TIME_ZONE = "Asia/Tehran";

export async function getDashboardOrderOverview() {
  const emptyStats = createEmptyStats();

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return { stats: emptyStats, error: "دسترسی مدیریتی شما معتبر نیست." };
    const { supabase } = admin;

    const { startOfToday, startOfTomorrow } = getStoreDayBoundaries();
    const [response, salesResponse] = await Promise.all([
      supabase.from("orders").select("status"),
      supabase
        .from("orders")
        .select("total_price")
        .eq("status", "completed")
        .gte("created_at", startOfToday.toISOString())
        .lt("created_at", startOfTomorrow.toISOString()),
    ]);

    if (response.error || salesResponse.error) {
      const failedResponse = response.error ? response : salesResponse;
      console.error("[admin-overview] Orders statistics query failed", {
        status: failedResponse.status,
        statusText: failedResponse.statusText,
        code: failedResponse.error.code,
        message: failedResponse.error.message,
        details: failedResponse.error.details,
        hint: failedResponse.error.hint,
      });
      return { stats: emptyStats, error: "دریافت آمار سفارش‌ها با خطا روبه‌رو شد." };
    }

    const rows = response.data ?? [];
    const stats = createEmptyStats();
    stats.totalOrders = rows.length;

    for (const order of rows) {
      if (trackedStatuses.includes(order.status)) stats[order.status] += 1;
    }
    for (const order of salesResponse.data ?? []) {
      const totalPrice = Number(order.total_price);
      if (Number.isFinite(totalPrice) && totalPrice > 0) stats.todaySales += totalPrice;
    }

    return { stats, error: null };
  } catch (error) {
    console.error("[admin-overview] Unexpected statistics failure", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return { stats: emptyStats, error: "ارتباط با سرویس آمار برقرار نشد." };
  }
}

function createEmptyStats() {
  return {
    totalOrders: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    todaySales: 0,
  };
}

function getStoreDayBoundaries(now = new Date()) {
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    startOfToday: localMidnightToUtc(year, month, day),
    startOfTomorrow: localMidnightToUtc(
      nextDay.getUTCFullYear(),
      nextDay.getUTCMonth() + 1,
      nextDay.getUTCDate(),
    ),
  };
}

function localMidnightToUtc(year, month, day) {
  const utcMidnight = Date.UTC(year, month - 1, day);
  let result = new Date(utcMidnight - getTimeZoneOffset(utcMidnight));
  result = new Date(utcMidnight - getTimeZoneOffset(result.getTime()));
  return result;
}

function getTimeZoneOffset(timestamp) {
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    timeZoneName: "longOffset",
  }).formatToParts(new Date(timestamp)).find(({ type }) => type === "timeZoneName")?.value;
  const match = offsetName?.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) throw new Error(`Unable to determine ${STORE_TIME_ZONE} offset`);

  const direction = match[1] === "+" ? 1 : -1;
  return direction * (Number(match[2]) * 60 + Number(match[3] || 0)) * 60_000;
}
