"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { logoutAdmin } from "./logout-actions";

const initialState = { error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "در حال خروج..." : "خروج"}
    </button>
  );
}

export default function LogoutButton() {
  const [state, formAction] = useActionState(logoutAdmin, initialState);

  return (
    <form action={formAction}>
      <SubmitButton />
      {state?.error ? (
        <p role="alert" className="mt-2 max-w-56 text-xs font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
