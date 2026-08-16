import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "ورود مدیریت | سرزمین گوشت",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getAuthenticatedAdmin();

  if (user) {
    redirect("/admin/dashboard");
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12 text-zinc-950"
    >
      <section
        aria-labelledby="admin-login-title"
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-black/5 sm:p-9"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-red-700 text-xl font-black text-white">
          س‌گ
        </div>
        <h1 id="admin-login-title" className="text-center text-2xl font-black sm:text-3xl">
          ورود به پنل مدیریت
        </h1>
        <p className="mt-3 text-center text-sm leading-7 text-zinc-600">
          برای ادامه، اطلاعات حساب مدیریت را وارد کنید.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
