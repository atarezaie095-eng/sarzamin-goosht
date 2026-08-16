import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminNavigation({ current }) {
  return (
    <nav aria-label="ناوبری پنل مدیریت" className="flex flex-wrap items-start gap-3">
      <Link
        href="/admin/dashboard"
        aria-current={current === "dashboard" ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-xl px-5 py-2.5 text-sm font-bold transition ${current === "dashboard" ? "bg-red-700 text-white" : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"}`}
      >
        داشبورد
      </Link>
      <Link
        href="/admin/dashboard/orders"
        aria-current={current === "orders" ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-xl px-5 py-2.5 text-sm font-bold transition ${current === "orders" ? "bg-red-700 text-white" : "bg-zinc-900 text-white hover:bg-red-700"}`}
      >
        سفارش‌ها
      </Link>
      <LogoutButton />
    </nav>
  );
}
