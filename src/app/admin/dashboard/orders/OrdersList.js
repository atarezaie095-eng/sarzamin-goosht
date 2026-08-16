"use client";

import Image from "next/image";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "./actions";
import { useDialogFocus } from "@/lib/use-dialog-focus";

const currencyFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" });
const statusOptions = [
  ["pending", "در انتظار تأیید"],
  ["confirmed", "تأیید شده"],
  ["preparing", "در حال آماده‌سازی"],
  ["shipped", "ارسال شده"],
  ["completed", "تکمیل شده"],
  ["cancelled", "لغو شده"],
];

export default function OrdersList({ orders, filtersActive = false }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const synchronizeSelectedStatus = useCallback((status) => {
    setSelectedOrder((current) => current ? { ...current, status } : current);
  }, []);

  if (!orders.length) {
    return <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-500">{filtersActive ? "سفارشی مطابق جستجو یا فیلتر انتخاب‌شده پیدا نشد." : "هنوز سفارشی ثبت نشده است."}</div>;
  }

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
        <div className="hidden grid-cols-[.7fr_1.3fr_1fr_1fr_1fr_1.2fr] gap-4 bg-zinc-100 px-5 py-3 text-xs font-bold text-zinc-600 md:grid">
          <span>شماره سفارش</span><span>نام مشتری</span><span>شماره موبایل</span><span>مبلغ کل</span><span>وضعیت</span><span>تاریخ ثبت</span>
        </div>
        <div className="divide-y divide-zinc-200">
          {orders.map((order) => (
            <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="grid w-full gap-3 bg-white px-5 py-4 text-right transition hover:bg-zinc-50 md:grid-cols-[.7fr_1.3fr_1fr_1fr_1fr_1.2fr] md:items-center md:gap-4">
              <OrderField label="شماره سفارش"><strong dir="ltr">#{formatNumber(order.id)}</strong></OrderField>
              <OrderField label="نام مشتری"><span className="font-bold text-zinc-900">{order.customer_name}</span></OrderField>
              <OrderField label="شماره موبایل"><span dir="ltr">{order.phone}</span></OrderField>
              <OrderField label="مبلغ کل"><span className="font-bold">{formatPrice(order.total_price)}</span></OrderField>
              <OrderField label="وضعیت"><StatusBadge status={order.status} /></OrderField>
              <OrderField label="تاریخ ثبت"><time dateTime={order.created_at}>{formatDate(order.created_at)}</time></OrderField>
            </button>
          ))}
        </div>
      </div>
      {selectedOrder ? <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={synchronizeSelectedStatus} /> : null}
    </>
  );
}

function OrderDetails({ order, onClose, onStatusChange }) {
  const router = useRouter();
  const initialFocusRef = useRef(null);
  const [state, formAction, pending] = useActionState(updateOrderStatus, { status: "idle", message: "" });
  const dialogRef = useDialogFocus({ initialFocusRef, onClose, pending });

  useEffect(() => {
    if (state.status !== "success" || !state.orderStatus) return;
    onStatusChange(state.orderStatus);
    router.refresh();
  }, [onStatusChange, router, state.orderStatus, state.status]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]" role="presentation">
      <div aria-hidden="true" className="absolute inset-0 cursor-default" onClick={() => !pending && onClose()} />
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="relative z-10 h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
          <div><p className="text-xs font-bold text-red-700">جزئیات سفارش</p><h2 id="order-details-title" className="mt-1 text-2xl font-black">سفارش #{formatNumber(order.id)}</h2></div>
          <button ref={initialFocusRef} type="button" onClick={onClose} disabled={pending} aria-label="بستن" className="grid size-11 place-items-center rounded-xl bg-zinc-100 text-xl transition hover:bg-zinc-200 disabled:opacity-50">×</button>
        </header>

        <dl className="mt-6 grid gap-4 rounded-2xl bg-zinc-50 p-5 sm:grid-cols-2">
          <Detail label="نام مشتری" value={order.customer_name} />
          <Detail label="شماره موبایل" value={<a href={`tel:${order.phone}`} className="font-semibold text-red-700 underline-offset-4 hover:underline">{order.phone}</a>} dir="ltr" />
          <Detail label="تاریخ ثبت" value={formatDate(order.created_at)} />
          <Detail label="مبلغ کل" value={formatPrice(order.total_price)} />
          <Detail label="آدرس کامل" value={order.address} wide />
          <Detail label="توضیحات" value={order.note || "بدون توضیحات"} wide />
        </dl>

        <form action={formAction} aria-busy={pending} className="mt-6 rounded-2xl border border-zinc-200 p-5">
          <input type="hidden" name="order_id" value={order.id} />
          <label htmlFor={`status-${order.id}`} className="text-sm font-bold">وضعیت سفارش</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <select key={order.status} id={`status-${order.id}`} name="status" defaultValue={order.status} disabled={pending} className="min-h-12 flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-red-700">
              {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-red-700 px-6 font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60">{pending ? "در حال ذخیره..." : "ذخیره وضعیت"}</button>
          </div>
          {state.message ? <p role={state.status === "error" ? "alert" : "status"} className={`mt-3 rounded-xl p-3 text-sm font-medium ${state.status === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{state.message}</p> : null}
        </form>

        <section className="mt-7" aria-labelledby="order-items-title">
          <h3 id="order-items-title" className="text-lg font-black">محصولات سفارش</h3>
          {order.items.length ? (
            <div className="mt-4 space-y-3">
              {order.items.map((item) => <OrderItem key={item.id} item={item} />)}
            </div>
          ) : <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-7 text-center text-sm text-zinc-500">قلمی برای این سفارش ثبت نشده است.</div>}
        </section>
      </section>
    </div>
  );
}

function OrderItem({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  const productName = item.product?.name || `محصول حذف‌شده یا نامشخص (#${formatNumber(item.product_id)})`;
  return (
    <article className="grid gap-4 rounded-2xl border border-zinc-200 p-4 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center">
      <div className="relative size-16 overflow-hidden rounded-xl bg-zinc-100">
        {item.product?.image_url && !imageFailed ? <Image src={item.product.image_url} alt="" fill sizes="64px" className="object-cover" onError={() => setImageFailed(true)} /> : <span className="grid h-full place-items-center text-[10px] text-zinc-400">بدون تصویر</span>}
      </div>
      <div><h4 className="font-bold">{productName}</h4><p className="mt-1 text-xs text-zinc-500">{formatNumber(item.quantity)} عدد × {formatPrice(item.price)}</p></div>
      <strong className="text-sm text-red-700">{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
    </article>
  );
}

function OrderField({ label, children }) { return <span className="flex items-center justify-between gap-4 text-sm text-zinc-600 md:block"><span className="font-semibold text-zinc-500 md:sr-only">{label}</span><span>{children}</span></span>; }
function Detail({ label, value, wide = false, dir }) { return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-xs font-bold text-zinc-500">{label}</dt><dd className="mt-1 text-sm leading-7 text-zinc-900" dir={dir}>{value}</dd></div>; }
function StatusBadge({ status }) { const label = statusOptions.find(([value]) => value === status)?.[1] || "نامشخص"; return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status === "cancelled" ? "bg-red-50 text-red-700" : status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{label}</span>; }
function formatPrice(value) { const number = Number(value); return Number.isFinite(number) ? `${currencyFormatter.format(number)} تومان` : "ثبت نشده"; }
function formatNumber(value) { return currencyFormatter.format(value); }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "تاریخ نامعتبر" : dateFormatter.format(date); }
