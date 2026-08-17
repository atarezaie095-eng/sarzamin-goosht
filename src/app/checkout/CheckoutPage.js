"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { submitOrder } from "./actions";
import { formatKilogramQuantity, isKilogramUnit } from "@/lib/product-quantity";

const numberFormatter = new Intl.NumberFormat("fa-IR");

export default function CheckoutPage() {
  const { items, totals, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    if (!items.length) {
      setError("سبد خرید خالی است.");
      return;
    }

    submissionInProgress.current = true;
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("cart", JSON.stringify(items));
      const result = await submitOrder(formData);

      if (!result?.success) {
        setError(result?.message || "ثبت سفارش با خطا روبه‌رو شد.");
        return;
      }

      clearCart();
      setOrderId(result.orderId);
    } catch (submissionError) {
      console.error("Checkout submission failed:", submissionError);
      setError("ارتباط با سامانه ثبت سفارش برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  if (orderId) return <OrderSuccess orderId={orderId} />;

  return (
    <main id="main-content" className="min-h-screen bg-[#f6f1eb] pb-20 pt-28" dir="rtl">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div>
          <p className="section-eyebrow">تکمیل سفارش</p>
          <h1 className="section-title text-right">اطلاعات دریافت سفارش</h1>
          <p className="mt-3 text-sm leading-7 text-black/55">اطلاعات تماس و نشانی تحویل را وارد کنید.</p>
        </div>

        {!items.length ? (
          <section className="mt-8 rounded-3xl border border-black/5 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-black">سبد خرید شما خالی است</h2>
            <p className="mt-2 text-sm leading-7 text-black/55">برای ثبت سفارش، ابتدا محصولی به سبد خرید اضافه کنید.</p>
            <Link href="/#products" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#dc3b34] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c8322c]">مشاهده محصولات</Link>
          </section>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="نام و نام خانوادگی" name="customer_name" autoComplete="name" required />
                <Field label="شماره موبایل" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09123456789" required />
                <Field label="آدرس کامل" name="address" autoComplete="street-address" required multiline className="sm:col-span-2" />
                <Field label="توضیحات سفارش (اختیاری)" name="notes" multiline className="sm:col-span-2" />
              </div>

              {error ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-7 text-red-800">{error}</div> : null}

              <button type="submit" disabled={submitting} className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#dc3b34] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c8322c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
                {submitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
              </button>
            </form>

            <OrderSummary items={items} totals={totals} />
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, name, multiline = false, className = "", ...props }) {
  const sharedClassName = "mt-2 w-full rounded-xl border border-black/10 bg-[#faf8f5] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#dc3b34] focus:bg-white focus:ring-4 focus:ring-red-500/8";
  return (
    <label className={`block text-sm font-bold text-[#1d1916] ${className}`}>
      {label}
      {multiline ? (
        <textarea name={name} rows={4} className={`${sharedClassName} resize-y`} {...props} />
      ) : (
        <input name={name} className={sharedClassName} {...props} />
      )}
    </label>
  );
}

function OrderSummary({ items, totals }) {
  return (
    <aside className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:sticky lg:top-28" aria-labelledby="checkout-summary-title">
      <h2 id="checkout-summary-title" className="text-lg font-black">خلاصه سفارش</h2>
      <ul className="mt-4 divide-y divide-black/8">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
            <span className="min-w-0 text-black/65"><strong className="block truncate text-[#1d1916]">{item.name}</strong>{formatCheckoutQuantity(item)} × {formatPrice(getEffectiveUnitPrice(item))}</span>
            <span className="shrink-0 font-bold">{formatPrice(Math.round(getEffectiveUnitPrice(item) * item.quantity))}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-3 border-t border-black/8 pt-4 text-sm">
        <SummaryRow label="جمع قیمت محصولات" value={totals.subtotal} />
        <SummaryRow label="تخفیف شما" value={totals.totalDiscount} accent />
        <SummaryRow label="مبلغ نهایی" value={totals.finalTotal} strong />
      </dl>
      <Link href="/cart" className="mt-5 flex min-h-11 items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-bold transition hover:border-[#dc3b34] hover:text-[#b92b25]">بازگشت به سبد خرید</Link>
    </aside>
  );
}

function SummaryRow({ label, value, accent = false, strong = false }) {
  return <div className={`flex justify-between gap-4 ${strong ? "border-t border-black/8 pt-3 text-base font-black" : "text-black/60"}`}><dt>{label}</dt><dd className={accent ? "font-bold text-[#a92520]" : "font-bold text-[#1d1916]"}>{formatPrice(value)}</dd></div>;
}

function OrderSuccess({ orderId }) {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-[#f6f1eb] px-5 pb-20 pt-28" dir="rtl">
      <section className="w-full max-w-xl rounded-3xl border border-black/5 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-700">✓</span>
        <h1 className="mt-5 text-2xl font-black text-[#1d1916]">سفارش شما با موفقیت ثبت شد</h1>
        <p className="mt-3 text-sm leading-7 text-black/60">شماره سفارش شما:</p>
        <strong className="mt-2 block text-2xl text-[#a92520]" dir="ltr">{formatOrderId(orderId)}</strong>
        <Link href="/" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#dc3b34] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c8322c]">بازگشت به فروشگاه</Link>
      </section>
    </main>
  );
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function formatPrice(value) {
  return `${formatNumber(Math.round(value))} تومان`;
}

function getEffectiveUnitPrice(item) {
  return Math.round(item.price * (1 - item.discount / 100));
}

function formatCheckoutQuantity(item) {
  return isKilogramUnit(item.unit)
    ? `${formatKilogramQuantity(item.quantity)} کیلوگرم`
    : `${formatNumber(item.quantity)} عدد`;
}

function formatOrderId(value) {
  const id = String(value);
  return /^\d+$/.test(id) ? numberFormatter.format(BigInt(id)) : id;
}
