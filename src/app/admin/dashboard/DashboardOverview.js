const numberFormatter = new Intl.NumberFormat("fa-IR");

export default function DashboardOverview({ totalProducts, stats, error, productsUnavailable }) {
  const cards = [
    ["تعداد محصولات", productsUnavailable ? null : totalProducts],
    ["کل سفارش‌ها", stats.totalOrders],
    ["در انتظار بررسی", stats.pending],
    ["تأیید شده", stats.confirmed],
    ["در حال آماده‌سازی", stats.preparing],
    ["ارسال شده", stats.shipped],
    ["تکمیل شده", stats.completed],
    ["لغو شده", stats.cancelled],
  ];

  return (
    <section aria-labelledby="dashboard-overview-title" className="mt-9 border-t border-zinc-200 pt-8">
      <div>
        <h2 id="dashboard-overview-title" className="text-2xl font-black">نمای کلی فروشگاه</h2>
        <p className="mt-2 text-sm leading-7 text-zinc-600">خلاصه وضعیت محصولات، سفارش‌ها و فروش قطعی</p>
      </div>

      {error ? <div role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">{error}</div> : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
            <p className="text-xs font-bold leading-6 text-zinc-500">{label}</p>
            <strong className="mt-2 block text-2xl font-black text-zinc-950">{value === null ? "—" : numberFormatter.format(value)}</strong>
          </article>
        ))}
      </div>

      <article className="mt-3 flex flex-col justify-between gap-3 rounded-2xl bg-zinc-900 p-5 text-white sm:flex-row sm:items-center">
        <div><p className="text-sm font-bold text-white/65">فروش امروز</p><p className="mt-1 text-xs text-white/45">سفارش‌های تکمیل‌شده امروز به وقت فروشگاه</p></div>
        <strong className="text-2xl font-black text-white">{numberFormatter.format(stats.todaySales)} تومان</strong>
      </article>
    </section>
  );
}
