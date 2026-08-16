"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { contactLinks } from "@/lib/site";
import { useCart } from "@/lib/cart";

const links = [["خانه", "/#home"], ["محصولات", "/#products"], ["درباره ما", "/#about"], ["تماس با ما", "/#contact"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#17120f]/92 text-white shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative size-11 overflow-hidden rounded-xl bg-white"><Image src="/images/logo.png" alt="" fill sizes="44px" className="object-cover" /></span>
          <span><strong className="block text-lg leading-tight">سرزمین گوشت</strong><small className="text-[10px] text-white/45">تازه، سالم، مطمئن</small></span>
        </Link>
        <nav aria-label="ناوبری اصلی" className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {links.map(([label, href]) => <a className="rounded-md px-1 py-2 transition-colors duration-200 hover:text-white" href={href} key={href}>{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="hidden min-h-11 items-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/25 hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:inline-flex"
          >
            ورود مدیریت
          </Link>
          <Link
            href="/cart"
            aria-label={`سبد خرید با ${itemCount} کالا`}
            className="relative grid size-12 place-items-center rounded-xl border border-white/15 transition-colors hover:bg-white/8"
          >
            <Icon name="basket" />
            {itemCount > 0 ? (
              <span className="absolute -left-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#dc3b34] px-1 text-[10px] font-black text-white">
                {new Intl.NumberFormat("fa-IR").format(itemCount)}
              </span>
            ) : null}
          </Link>
          <a href={contactLinks.phone} className="hidden items-center gap-2 rounded-xl bg-[#dc3b34] px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[#ef4941] sm:flex"><Icon name="phone" className="size-4" /> ثبت سفارش</a>
          <button type="button" aria-label={open ? "بستن منو" : "باز کردن منو"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="grid size-12 place-items-center rounded-xl border border-white/15 transition-colors hover:bg-white/8 md:hidden"><Icon name={open ? "close" : "menu"} /></button>
        </div>
      </div>
      <div id="mobile-navigation" hidden={!open} className="border-t border-white/8 bg-[#17120f] md:hidden">
        <nav aria-label="ناوبری موبایل" className="flex flex-col px-5 py-3">
          {links.map(([label, href]) => <a className="flex min-h-12 items-center border-b border-white/8 px-1 text-[15px] text-white/80 transition-colors last:border-0 hover:text-white" href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
          <Link href="/admin/login" className="flex min-h-12 items-center rounded-md px-1 text-[15px] font-bold text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setOpen(false)}>
            ورود مدیریت
          </Link>
        </nav>
      </div>
    </header>
  );
}
