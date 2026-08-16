"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdmin } from "./actions";

const initialState = { error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 min-h-12 w-full rounded-xl bg-red-700 px-5 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition duration-200 hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "در حال ورود..." : "ورود به پنل مدیریت"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-zinc-800">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          dir="ltr"
          className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-zinc-800">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-zinc-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100"
        />
      </div>

      <div aria-live="polite" aria-atomic="true" className="min-h-6">
        {state?.error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        ) : null}
      </div>

      <SubmitButton />
    </form>
  );
}
