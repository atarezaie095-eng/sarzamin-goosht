"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/lib/cart";

const numberFormatter = new Intl.NumberFormat("fa-IR");

export default function CartPage() {
  const {
    items,
    itemCount,
    totals,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearCart,
  } = useCart();

  return (
    <main id="main-content" className="min-h-screen bg-[#f6f1eb] pb-20 pt-28" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">خرید شما</p>
            <h1 className="section-title text-right">سبد خرید</h1>
            <p className="mt-3 text-sm leading-7 text-black/55">
              {itemCount ? `${formatNumber(itemCount)} کالا در سبد شماست.` : "سبد خرید شما هنوز خالی است."}
            </p>
          </div>
          {items.length ? (
            <button
              type="button"
              onClick={clearCart}
              className="min-h-11 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-[#a92520] transition hover:border-[#dc3b34] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2"
            >
              خالی کردن سبد
            </button>
          ) : null}
        </div>

        {!items.length ? (
          <section className="mt-8 rounded-3xl border border-black/5 bg-white px-6 py-16 text-center shadow-sm" aria-label="سبد خرید خالی">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#f6f1eb] text-[#dc3b34]">
              <Icon name="basket" className="size-8" />
            </span>
            <h2 className="mt-5 text-xl font-black text-[#1d1916]">سبد خرید خالی است</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-black/55">محصولات تازه سرزمین گوشت را ببینید و موارد دلخواهتان را به سبد اضافه کنید.</p>
            <Link href="/#products" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#dc3b34] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c8322c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2">
              مشاهده محصولات
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="space-y-4" aria-label="محصولات سبد خرید">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeProduct}
                />
              ))}
            </section>

            <aside className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:sticky lg:top-28" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title" className="text-lg font-black text-[#1d1916]">خلاصه سبد خرید</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <SummaryRow label="جمع قیمت محصولات" value={totals.subtotal} />
                <SummaryRow label="تخفیف شما" value={totals.totalDiscount} accent />
                <div className="border-t border-black/8 pt-4">
                  <SummaryRow label="مبلغ نهایی" value={totals.finalTotal} strong />
                </div>
              </dl>
              <Link href="/checkout" className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#dc3b34] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c8322c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2">
                ادامه ثبت سفارش
              </Link>
              <Link href="/#products" className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-sm font-bold text-[#1d1916] transition hover:border-[#dc3b34] hover:text-[#b92b25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2">
                ادامه خرید
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const discountedUnitPrice = item.price * (1 - item.discount / 100);
  const fallbackImage = "/images/meat.jpg";
  const [imageSource, setImageSource] = useState(item.image_url || fallbackImage);

  return (
    <article className="grid gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#eee7df] sm:aspect-square">
        <Image src={imageSource} onError={() => setImageSource(fallbackImage)} alt={item.name} fill sizes="(max-width: 639px) 100vw, 112px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <h2 className="font-extrabold leading-7 text-[#1d1916]">{item.name}</h2>
        <p className="mt-1 text-xs text-black/50">{item.unit ? `واحد فروش: ${item.unit}` : "محصول تازه"}</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <strong className="text-sm text-[#a92520]">{formatPrice(discountedUnitPrice)}</strong>
          {item.discount > 0 ? <del className="text-[11px] text-black/35">{formatPrice(item.price)}</del> : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-xl border border-black/10 bg-[#faf8f5] p-1" aria-label={`تعداد ${item.name}`}>
          <button type="button" onClick={() => onIncrease(item.id)} aria-label={`افزایش تعداد ${item.name}`} className="grid size-9 place-items-center rounded-lg text-lg font-bold transition hover:bg-white hover:text-[#dc3b34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34]">+</button>
          <span className="min-w-9 text-center text-sm font-black" aria-live="polite">{formatNumber(item.quantity)}</span>
          <button type="button" onClick={() => onDecrease(item.id)} aria-label={`کاهش تعداد ${item.name}`} className="grid size-9 place-items-center rounded-lg text-lg font-bold transition hover:bg-white hover:text-[#dc3b34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34]">−</button>
        </div>
        <button type="button" onClick={() => onRemove(item.id)} className="min-h-10 px-2 text-xs font-bold text-black/45 transition hover:text-[#b92b25] focus-visible:outline-none focus-visible:underline" aria-label={`حذف ${item.name} از سبد خرید`}>حذف</button>
      </div>
    </article>
  );
}

function SummaryRow({ label, value, accent = false, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-black" : "text-black/60"}`}>
      <dt>{label}</dt>
      <dd className={accent ? "font-bold text-[#a92520]" : strong ? "text-[#1d1916]" : "font-bold text-[#1d1916]"}>{formatPrice(value)}</dd>
    </div>
  );
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function formatPrice(value) {
  return `${formatNumber(Math.round(value))} تومان`;
}
