"use server";

import { createClient } from "@supabase/supabase-js";

const MAX_ITEMS = 100;
const MAX_QUANTITY = 10000;
const MAX_POSTGRES_BIGINT = "9223372036854775807";
const INVALID_CART_MESSAGE = "اطلاعات سبد خرید معتبر نیست. لطفاً سبد خرید خود را بررسی کنید.";

export async function submitOrder(formData) {
  const getField = createSafeFormReader(formData);
  if (!getField) return failure(INVALID_CART_MESSAGE);

  const customerName = cleanText(getField("customer_name"), 120);
  const phone = normalizePhone(getField("phone"));
  const address = cleanText(getField("address"), 1000);
  const notes = cleanText(getField("notes"), 1000);

  if (!customerName) return failure("نام و نام خانوادگی را وارد کنید.");
  if (!phone) return failure("شماره موبایل واردشده معتبر نیست.");
  if (!address) return failure("آدرس کامل را وارد کنید.");

  const cartResult = parseCartItems(getField("cart"));
  if (cartResult.error) return failure(cartResult.error);
  if (!cartResult.items.length) return failure("سبد خرید خالی است.");

  let supabase;
  try {
    supabase = createPublicSupabaseClient();
  } catch (error) {
    console.error("[checkout] Supabase configuration error:", error);
    return failure("ارتباط با سامانه ثبت سفارش برقرار نشد.");
  }

  const rpcPayload = {
    p_customer_name: customerName,
    p_phone: phone,
    p_address: address,
    p_note: notes || null,
    p_order_items: cartResult.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.info("[checkout] create_order RPC request context", {
      userExists: Boolean(session?.user),
      authRole: session?.user?.role || "anon",
      client: "@supabase/supabase-js createClient (stateless server action client)",
      rpc: "public.create_order",
      payloadColumns: Object.keys(rpcPayload),
      itemCount: rpcPayload.p_order_items.length,
    });

    const orderResponse = await supabase.rpc("create_order", rpcPayload);

    if (orderResponse.error || orderResponse.data === null) {
      logSupabaseError("create_order RPC", orderResponse.error);
      return failure(getOrderErrorMessage(orderResponse.error));
    }

    return { success: true, orderId: String(orderResponse.data) };
  } catch (error) {
    console.error("[checkout] create_order request failed", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : "Unknown request error",
    });
    return failure("ارتباط با سامانه ثبت سفارش برقرار نشد. لطفاً دوباره تلاش کنید.");
  }
}

function createSafeFormReader(formData) {
  if (!formData || typeof formData.get !== "function") return null;
  return (name) => {
    try {
      return formData.get(name);
    } catch {
      return null;
    }
  };
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase connection settings are not available");

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function parseCartItems(value) {
  if (typeof value !== "string" || !value.trim()) {
    return { items: [], error: INVALID_CART_MESSAGE };
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return { items: [], error: INVALID_CART_MESSAGE };
    if (!parsed.length) return { items: [], error: null };
    if (parsed.length > MAX_ITEMS) return { items: [], error: INVALID_CART_MESSAGE };

    const items = [];
    const productIds = new Set();
    for (const item of parsed) {
      const normalizedItem = normalizeCartItem(item);
      if (!normalizedItem || productIds.has(normalizedItem.productId)) {
        return { items: [], error: INVALID_CART_MESSAGE };
      }
      productIds.add(normalizedItem.productId);
      items.push(normalizedItem);
    }

    return { items, error: null };
  } catch {
    return { items: [], error: INVALID_CART_MESSAGE };
  }
}

function normalizeCartItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const productId = normalizeProductId(item.id);
  const quantity = Number(item.quantity);
  if (
    productId === null ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    return null;
  }

  return { productId, quantity };
}

function normalizeProductId(value) {
  if (typeof value === "number" && !Number.isSafeInteger(value)) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;

  const id = String(value).trim();
  if (!/^[1-9]\d{0,18}$/.test(id)) return null;
  return id.length < MAX_POSTGRES_BIGINT.length || id <= MAX_POSTGRES_BIGINT
    ? id
    : null;
}

function normalizePhone(value) {
  const digits = toEnglishDigits(String(value || "")).replace(/[\s()-]/g, "");
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

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function failure(message) {
  return { success: false, message };
}

function getOrderErrorMessage(error) {
  if (error?.code === "P0003") {
    return "یکی از محصولات انتخاب‌شده به اتمام رسیده است. لطفاً سبد خرید خود را بررسی کنید.";
  }
  if (error?.code === "42501") {
    return "دسترسی ثبت سفارش عمومی فعال نیست. لطفاً با فروشگاه تماس بگیرید.";
  }
  return "ثبت سفارش با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.";
}

function logSupabaseError(operation, error, context = {}) {
  console.error(`[checkout] Supabase ${operation} failed`, {
    ...context,
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
  });
}
