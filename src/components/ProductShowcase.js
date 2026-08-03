"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icon";
import { whatsappOrderLink } from "@/lib/site";

const products = [
  { name: "گوشت گوسفندی ممتاز", category: "گوشت", description: "تازه، نرم و مناسب انواع خورشت", image: "/images/meat.jpg" },
  { name: "ران مرغ تازه", category: "مرغ", description: "کشتار روز، پاک‌شده و آماده طبخ", image: "/images/chicken.jpg" },
  { name: "فیله گوساله", category: "گوشت", description: "بدون چربی، مناسب استیک و کباب", image: "/images/meat.jpg" },
  { name: "جوجه زعفرانی", category: "جوجه طعم‌دار", description: "مرینیت ویژه با زعفران ایرانی", image: "/images/joojeh.jpg" },
  { name: "کالباس گوشت ویژه", category: "سوسیس و کالباس", description: "محصول تازه از برندهای معتبر", image: "/images/sausage.jpg" },
];
const filters = ["همه", "گوشت", "مرغ", "سوسیس و کالباس", "جوجه طعم‌دار"];

export default function ProductShowcase() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("همه");
  const visible = useMemo(() => products.filter(p => (filter === "همه" || p.category === filter) && p.name.includes(query.trim())), [query, filter]);
  return (
    <section id="products" aria-labelledby="products-title" className="bg-[#f6f1eb] py-20 sm:py-25">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div data-reveal className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div><p className="section-eyebrow">تازه‌های امروز</p><h2 id="products-title" className="section-title text-right">محصولات محبوب</h2><p className="mt-3 text-sm leading-7 text-black/60">محصول مورد نظرتان را پیدا و به‌سادگی سفارش دهید.</p></div>
          <label className="flex h-[52px] w-full items-center gap-3 rounded-[.9rem] border border-black/10 bg-white px-4 shadow-sm transition focus-within:border-[#dc3b34] focus-within:shadow-[0_0_0_3px_rgba(220,59,52,.08)] lg:w-80"><span className="sr-only">جستجوی محصول</span><Icon name="search" className="size-5 text-black/40" /><input type="search" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-black/40" placeholder="جستجوی محصول..." /></label>
        </div>
        <div className="hide-scrollbar mt-7 flex gap-2 overflow-x-auto pb-2">
          {filters.map(item => <button type="button" aria-pressed={filter === item} key={item} onClick={() => setFilter(item)} className={`min-h-11 shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${filter === item ? "bg-[#1d1916] text-white shadow-lg" : "border border-black/10 bg-white text-black/65 hover:border-[#df3b34] hover:text-[#b92b25]"}`}>{item}</button>)}
        </div>
        <p className="sr-only" role="status" aria-live="polite">{visible.length} محصول نمایش داده می‌شود.</p>
        {visible.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((product, index) => <ProductCard key={product.name} {...product} index={index} />)}
        </div> : <div className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white p-12 text-center text-sm text-black/45">محصولی با این نام پیدا نشد.</div>}
      </div>
    </section>
  );
}

function ProductCard({ name, category, description, image, index }) {
  return <article data-reveal style={{ "--reveal-delay": `${index * 65}ms` }} className="product-card group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
    <div className={`product-image relative aspect-[4/3.2] overflow-hidden tone-${index}`}><Image src={image} alt={name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-black/55">{category}</span></div>
    <div className="p-5"><h3 className="font-extrabold leading-7">{name}</h3><p className="mt-2 min-h-10 text-xs leading-6 text-black/60">{description}</p><div className="mt-4 flex items-center justify-between border-t border-black/8 pt-4"><div><span className="block text-[11px] text-black/50">قیمت هر کیلو</span><strong className="mt-0.5 block text-sm text-[#a92520]">استعلام قیمت</strong></div><a href={whatsappOrderLink(name)} target="_blank" rel="noopener noreferrer" aria-label={`سفارش ${name} در واتساپ`} className="grid size-12 place-items-center rounded-xl bg-[#191512] text-white shadow-sm transition-all duration-200 hover:bg-[#db3b34] hover:shadow-md active:scale-95"><Icon name="basket" className="size-5" /></a></div></div>
  </article>;
}
