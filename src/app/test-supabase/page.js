"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      if (!supabase) {
        setError("تنظیمات اتصال Supabase در متغیرهای محیطی پیدا نشد.");
        setStatus("error");
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("categories")
          .select("name")
          .order("name");

        if (queryError) throw queryError;
        if (!active) return;

        setCategories(data ?? []);
        setStatus("success");
      } catch (queryError) {
        if (!active) return;
        setError(queryError.message || "اتصال به Supabase ناموفق بود.");
        setStatus("error");
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-16 sm:px-8">
      <h1 className="text-2xl font-black text-[#181512]">آزمایش اتصال Supabase</h1>
      <p className="mt-2 text-sm text-black/60">
        داده‌های جدول categories در این صفحه نمایش داده می‌شوند.
      </p>

      {status === "loading" && (
        <p role="status" className="mt-8 rounded-xl border border-black/10 bg-white p-5 text-sm text-black/65">
          در حال دریافت دسته‌بندی‌ها…
        </p>
      )}

      {status === "error" && (
        <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <strong className="block">خطا در اتصال</strong>
          <span className="mt-1 block" dir="auto">{error}</span>
        </div>
      )}

      {status === "success" && (
        <section aria-labelledby="categories-heading" className="mt-8">
          <h2 id="categories-heading" className="text-lg font-extrabold text-[#181512]">دسته‌بندی‌ها</h2>
          {categories.length > 0 ? (
            <ul className="mt-4 list-inside list-disc space-y-2 rounded-xl border border-black/10 bg-white p-5">
              {categories.map((category, index) => (
                <li key={`${category.name}-${index}`} className="text-sm text-black/70">{category.name}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-black/10 bg-white p-5 text-sm text-black/60">
              اتصال برقرار شد، اما دسته‌بندی‌ای پیدا نشد.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
