export default function AdminDashboardLoading() {
  return (
    <main dir="rtl" className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6">
      <section
        role="status"
        aria-label="در حال بارگذاری داشبورد مدیریت"
        className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg shadow-black/5 sm:p-10"
      >
        <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-200" />
        <div className="mt-5 h-10 w-52 animate-pulse rounded-xl bg-zinc-200" />
        <div className="mt-3 h-5 w-72 max-w-full animate-pulse rounded bg-zinc-100" />
        <div className="mt-10 space-y-3 rounded-2xl border border-zinc-200 p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-zinc-100 py-3 last:border-0">
              <div className="size-16 shrink-0 animate-pulse rounded-xl bg-zinc-200" />
              <div className="w-full space-y-2">
                <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">در حال دریافت محصولات…</span>
      </section>
    </main>
  );
}
