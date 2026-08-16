import Link from "next/link";
import { requireAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAdminOrders, normalizeOrderFilters } from "./data";
import OrdersList from "./OrdersList";
import AdminNavigation from "../AdminNavigation";

export const metadata = { title: "مدیریت سفارش‌ها | سرزمین گوشت", robots: { index: false, follow: false } };

const filterOptions = [
  ["", "همه"],
  ["pending", "در انتظار تأیید"],
  ["confirmed", "تأیید شده"],
  ["preparing", "در حال آماده‌سازی"],
  ["shipped", "ارسال شده"],
  ["completed", "تکمیل شده"],
  ["cancelled", "لغو شده"],
];

export default async function AdminOrdersPage({ searchParams }) {
  await requireAuthenticatedAdmin();
  const params = await searchParams;
  const filters = normalizeOrderFilters({
    status: String(params?.status ?? ""),
    search: String(params?.search ?? ""),
  });
  const { orders, error } = await getAdminOrders(filters);
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6">
      <section className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg shadow-black/5 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">پنل مدیریت</span><h1 className="mt-4 text-3xl font-black sm:text-4xl">سفارش‌ها</h1><p className="mt-2 text-sm leading-7 text-zinc-600">بررسی اطلاعات سفارش و به‌روزرسانی وضعیت ارسال</p></div>
          <AdminNavigation current="orders" />
        </div>
        <form method="get" className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[1fr_14rem_auto_auto] sm:items-end">
          <label className="text-sm font-bold text-zinc-700">
            جستجوی سفارش
            <input name="search" type="search" defaultValue={filters.search} maxLength={80} placeholder="شماره سفارش، نام یا موبایل" className="mt-2 min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-red-700" />
          </label>
          <label className="text-sm font-bold text-zinc-700">
            وضعیت
            <select name="status" defaultValue={filters.status} className="mt-2 min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-red-700">
              {filterOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="submit" className="min-h-11 rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white transition hover:bg-red-700">اعمال فیلتر</button>
          <Link href="/admin/dashboard/orders" className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold transition hover:bg-zinc-100">پاک کردن</Link>
        </form>
        {error ? <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium leading-7 text-red-800">{error}</div> : <OrdersList orders={orders} filtersActive={Boolean(filters.status || filters.search)} />}
      </section>
    </main>
  );
}
