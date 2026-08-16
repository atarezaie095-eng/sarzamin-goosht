import "server-only";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const ADMIN_PRODUCT_FIELDS = `
  id,
  category_id,
  name,
  description,
  price,
  discount,
  unit,
  image_url,
  featured,
  available,
  category:categories(name)
`;

export async function getAdminProducts() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return {
        products: [],
        categories: [],
        error: "دسترسی مدیریتی شما معتبر نیست.",
      };
    }
    const { supabase } = admin;

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(ADMIN_PRODUCT_FIELDS)
        .order("featured", { ascending: false })
        .order("name", { ascending: true }),
      supabase.from("categories").select("id, name").order("name", { ascending: true }),
    ]);

    const { data, error, status, statusText } = productsResult;

    if (error) {
      console.error(
        "[Supabase:getAdminProducts] Query failed " +
          JSON.stringify({
            status,
            statusText,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          }),
      );

      return {
        products: [],
        categories: [],
        error: "دریافت محصولات با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
      };
    }

    if (categoriesResult.error) {
      console.error(
        "[Supabase:getAdminProducts] Category query failed " +
          JSON.stringify({
            status: categoriesResult.status,
            code: categoriesResult.error.code,
            message: categoriesResult.error.message,
            details: categoriesResult.error.details,
            hint: categoriesResult.error.hint,
          }),
      );

      return {
        products: [],
        categories: [],
        error: "دریافت دسته‌بندی‌ها با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.",
      };
    }

    return {
      products: data ?? [],
      categories: categoriesResult.data ?? [],
      error: null,
    };
  } catch (error) {
    console.error(
      "[Supabase:getAdminProducts] Connection failed " +
        JSON.stringify({
          name: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : String(error),
        }),
    );

    return {
      products: [],
      categories: [],
      error: "ارتباط با سرویس محصولات برقرار نشد. لطفاً دوباره تلاش کنید.",
    };
  }
}
