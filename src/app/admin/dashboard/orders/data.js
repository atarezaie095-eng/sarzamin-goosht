import "server-only";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const ORDER_FIELDS = "id, customer_name, phone, address, note, total_price, status, created_at";
const ORDER_ITEM_FIELDS = "id, order_id, product_id, quantity, price";
const VALID_ORDER_STATUSES = new Set(["pending", "confirmed", "preparing", "shipped", "completed", "cancelled"]);

export function normalizeOrderFilters({ status, search } = {}) {
  const normalizedStatus = VALID_ORDER_STATUSES.has(status) ? status : "";
  const normalizedSearch = String(search ?? "").trim().slice(0, 80);
  const safeSearch = /^[\p{L}\p{N}\s+\-()\u200c]*$/u.test(normalizedSearch)
    ? normalizedSearch
    : "";
  return { status: normalizedStatus, search: safeSearch };
}

export async function getAdminOrders(filters = {}) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return resultError("دسترسی مدیریتی شما معتبر نیست.");
    const { supabase } = admin;

    const { status, search } = normalizeOrderFilters(filters);
    let ordersQuery = supabase
      .from("orders")
      .select(ORDER_FIELDS)
      .order("created_at", { ascending: false });

    if (status) ordersQuery = ordersQuery.eq("status", status);
    if (search) {
      const pattern = `"%${search}%"`;
      const conditions = [
        `customer_name.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
      ];
      if (/^[1-9]\d{0,18}$/.test(search)) conditions.unshift(`id.eq.${search}`);
      ordersQuery = ordersQuery.or(conditions.join(","));
    }

    const ordersResponse = await ordersQuery;

    if (ordersResponse.error) {
      logQueryError("orders SELECT", ordersResponse);
      return resultError(getAccessMessage(ordersResponse.error, "دریافت سفارش‌ها"));
    }

    const orders = ordersResponse.data ?? [];
    if (!orders.length) return { orders: [], error: null };

    const orderIds = orders.map((order) => order.id);
    const itemsResponse = await supabase
      .from("order_items")
      .select(ORDER_ITEM_FIELDS)
      .in("order_id", orderIds)
      .order("id", { ascending: true });

    if (itemsResponse.error) {
      logQueryError("order_items SELECT", itemsResponse);
      return resultError(getAccessMessage(itemsResponse.error, "دریافت اقلام سفارش"));
    }

    const items = itemsResponse.data ?? [];
    const productIds = [...new Set(items.map((item) => String(item.product_id)))];
    let products = [];

    if (productIds.length) {
      const productsResponse = await supabase
        .from("products")
        .select("id, name, image_url")
        .in("id", productIds);

      if (productsResponse.error) {
        logQueryError("products lookup", productsResponse);
      } else {
        products = productsResponse.data ?? [];
      }
    }

    const productsById = new Map(products.map((product) => [String(product.id), product]));
    const itemsByOrderId = new Map();
    for (const item of items) {
      const orderId = String(item.order_id);
      const orderItems = itemsByOrderId.get(orderId) ?? [];
      orderItems.push({ ...item, product: productsById.get(String(item.product_id)) ?? null });
      itemsByOrderId.set(orderId, orderItems);
    }

    return {
      orders: orders.map((order) => ({
        ...order,
        items: itemsByOrderId.get(String(order.id)) ?? [],
      })),
      error: null,
    };
  } catch (error) {
    console.error("[admin-orders] Unexpected query failure", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return resultError("ارتباط با سرویس سفارش‌ها برقرار نشد. لطفاً دوباره تلاش کنید.");
  }
}

function resultError(error) {
  return { orders: [], error };
}

function getAccessMessage(error, operation) {
  return error?.code === "42501"
    ? `دسترسی لازم برای ${operation} وجود ندارد. لطفاً دوباره وارد پنل مدیریت شوید.`
    : `${operation} با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.`;
}

function logQueryError(operation, response) {
  console.error(`[admin-orders] ${operation} failed`, {
    status: response.status,
    statusText: response.statusText,
    code: response.error?.code,
    message: response.error?.message,
    details: response.error?.details,
    hint: response.error?.hint,
  });
}
