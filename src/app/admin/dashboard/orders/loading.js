export default function OrdersLoading() {
  return <main dir="rtl" className="min-h-screen bg-zinc-100 px-4 py-10 sm:px-6"><section className="mx-auto max-w-6xl animate-pulse rounded-3xl bg-white p-6 sm:p-10"><div className="h-7 w-28 rounded bg-zinc-200" /><div className="mt-5 h-10 w-48 rounded bg-zinc-200" /><div className="mt-8 space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-2xl bg-zinc-100" />)}</div><span className="sr-only">در حال دریافت سفارش‌ها...</span></section></main>;
}
