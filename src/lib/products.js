import { supabase } from "./supabase";

const PRODUCT_FIELDS = "id, category_id, name, description, price, discount, unit, image_url, featured, available, category:categories(id, name)";

export async function getProducts() {
  if (!supabase) {
    return {
      products: [],
      error: "تنظیمات اتصال Supabase در دسترس نیست.",
    };
  }

  try {
    const { data, error, status, statusText } = await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("[Supabase:getProducts] Product query failed " + JSON.stringify({
        table: "public.products",
        columns: PRODUCT_FIELDS,
        status,
        statusText,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }));
      return { products: [], error: "دریافت محصولات با خطا روبه‌رو شد." };
    }

    return { products: data ?? [], error: null };
  } catch (error) {
    console.error("[Supabase:getProducts] Unexpected connection failure " + JSON.stringify({
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }));
    return { products: [], error: "ارتباط با سرویس محصولات برقرار نشد." };
  }
}

export async function getCategories() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (error) {
      console.error("Unable to load Supabase categories:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Unable to connect to Supabase:", error);
    return [];
  }
}
