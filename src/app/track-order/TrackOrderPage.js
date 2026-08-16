"use client";

import { useActionState } from "react";
import { trackOrder } from "./actions";

const initialState = { status: "idle", message: "", fields: {}, order: null };
const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  timeZone: "Asia/Tehran",
  dateStyle: "medium",
  timeStyle: "short",
});
const timeline = [
  ["pending", "در انتظار تأیید"],
  ["confirmed", "تأیید شده"],
  ["preparing", "در حال آماده‌سازی"],
  ["shipped", "ارسال شده"],
  ["completed", "تکمیل شده"],
];

export default function TrackOrderPage() {
  const [state, formAction, pending] = useActionState(trackOrder, initialState);

  return (
    <main id="main-content" dir="rtl" className="min-h-screen bg-[#f6f1eb] px-5 pb-20 pt-28 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="section-eyebrow">وضعیت سفارش شما</p>
          <h1 className="section-title text-center">پیگیری سفارش</h1>
          <p className="mt-3 text-sm leading-7 text-black/55">شماره سفارش و همان شماره موبایلی را وارد کنید که هنگام ثبت سفارش استفاده کرده‌اید.</p>
        </div>

        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
          <form action={formAction} className="grid gap-5 sm:grid-cols-2" aria-busy={pending}>
            <FormField label="شماره سفارش" htmlFor="tracking-order-id" error={state.fields?.order_id}>
              <input id="tracking-order-id" name="order_id" type="text" inputMode="numeric" autoComplete="off" required maxLength={19} dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-[#faf8f5] px-4 text-left text-sm outline-none transition focus:border-[#dc3b34] focus:bg-white focus:ring-4 focus:ring-red-500/8" />
            </FormField>
            <FormField label="شماره موبایل" htmlFor="tracking-phone" error={state.fields?.phone}>
              <input id="tracking-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="09123456789" dir="ltr" className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-[#faf8f5] px-4 text-left text-sm outline-none transition placeholder:text-black/30 focus:border-[#dc3b34] focus:bg-white focus:ring-4 focus:ring-red-500/8" />
            </FormField>
            <button type="submit" disabled={pending} className="flex min-h-12 items-center justify-center rounded-xl bg-[#dc3b34] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c8322c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 sm:col-span-2">
              {pending ? "در حال پیگیری..." : "پیگیری سفارش"}
            </button>
          </form>

          {state.message ? (
            <p role={state.status === "not-found" || state.status === "error" ? "alert" : "status"} className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-medium leading-7 text-amber-900">
              {state.message}
            </p>
          ) : null}
        </section>

        {state.status === "success" && state.order ? <TrackingResult order={state.order} /> : null}
      </div>
    </main>
  );
}

function TrackingResult({ order }) {
  const isCancelled = order.status === "cancelled";
  const currentIndex = timeline.findIndex(([status]) => status === order.status);

  return (
    <section className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="tracking-result-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold text-[#a92520]">نتیجه پیگیری</p><h2 id="tracking-result-title" className="mt-1 text-xl font-black">سفارش #{formatNumber(order.orderId)}</h2></div>
        <StatusBadge status={order.status} />
      </div>

      <dl className="mt-6 grid gap-4 rounded-2xl bg-[#faf8f5] p-5 sm:grid-cols-3">
        <ResultField label="شماره سفارش" value={`#${formatNumber(order.orderId)}`} />
        <ResultField label="تاریخ ثبت سفارش" value={formatDate(order.createdAt)} />
        <ResultField label="مبلغ نهایی" value={formatPrice(order.totalPrice)} />
      </dl>

      {isCancelled ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-black text-red-800">سفارش لغو شده</div>
      ) : (
        <ol className="mt-7 grid gap-3 sm:grid-cols-5" aria-label="مراحل سفارش">
          {timeline.map(([status, label], index) => {
            const reached = index <= currentIndex;
            const current = index === currentIndex;
            return <li key={status} aria-current={current ? "step" : undefined} className={`rounded-xl border p-3 text-center text-xs font-bold leading-6 ${reached ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-zinc-200 bg-zinc-50 text-zinc-400"}`}><span aria-hidden="true" className={`mx-auto mb-2 block size-2.5 rounded-full ${reached ? "bg-emerald-500" : "bg-zinc-300"}`} />{label}</li>;
          })}
        </ol>
      )}
    </section>
  );
}

function FormField({ label, htmlFor, error, children }) {
  return <label htmlFor={htmlFor} className="text-sm font-bold text-[#1d1916]">{label}{children}{error ? <span className="mt-2 block text-xs font-medium text-red-700">{error}</span> : null}</label>;
}

function ResultField({ label, value }) {
  return <div><dt className="text-xs font-bold text-black/45">{label}</dt><dd className="mt-1 text-sm font-extrabold leading-7 text-[#1d1916]">{value}</dd></div>;
}

function StatusBadge({ status }) {
  const label = status === "cancelled" ? "لغو شده" : timeline.find(([value]) => value === status)?.[1] || "نامشخص";
  return <span className={`rounded-full px-4 py-2 text-xs font-bold ${status === "cancelled" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{label}</span>;
}

function formatNumber(value) {
  try { return numberFormatter.format(BigInt(value)); } catch { return String(value); }
}

function formatPrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${numberFormatter.format(amount)} تومان` : "ثبت نشده";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "تاریخ نامعتبر" : dateFormatter.format(date);
}
