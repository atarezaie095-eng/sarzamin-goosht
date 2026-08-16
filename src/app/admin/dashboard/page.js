import { requireAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAdminProducts } from "./data";
import ProductsList from "./ProductsList";
import DashboardOverview from "./DashboardOverview";
import { getDashboardOrderOverview } from "./overview-data";
import AdminNavigation from "./AdminNavigation";

export const metadata = {
  title: "پنل مدیریت | سرزمین گوشت",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const { user } = await requireAuthenticatedAdmin();
  const [productsResult, overviewResult] = await Promise.all([
    getAdminProducts(),
    getDashboardOrderOverview(),
  ]);
  const { products, categories, error } = productsResult;

  return (
    <main dir="rtl" className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950 sm:px-6">
      <section className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg shadow-black/5 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
            پنل مدیریت
          </span>
          <AdminNavigation current="dashboard" />
        </div>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">خوش آمدید</h1>
        <p className="mt-3 leading-8 text-zinc-600">
          شما با حساب <span dir="ltr" className="font-semibold text-zinc-900">{user.email}</span> وارد شده‌اید.
        </p>

        <DashboardOverview
          totalProducts={products.length}
          stats={overviewResult.stats}
          error={overviewResult.error}
          productsUnavailable={Boolean(error)}
        />

        <section aria-labelledby="products-management-title" className="mt-10 border-t border-zinc-200 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="products-management-title" className="text-2xl font-black">مدیریت محصولات</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                نمای کلی محصولات ثبت‌شده در فروشگاه
              </p>
            </div>
            {!error ? (
              <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700">
                {new Intl.NumberFormat("fa-IR").format(products.length)} محصول
              </span>
            ) : null}
          </div>

          {error ? (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-800">
              {error}
            </div>
          ) : (
            <ProductsList products={products} categories={categories} />
          )}
        </section>
      </section>
    </main>
  );
}
