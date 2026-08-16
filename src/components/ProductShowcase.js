"use client";

import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import ResilientImage from "./ResilientImage";
import { whatsappOrderLink } from "@/lib/site";
import { useCart } from "@/lib/cart";

const filters = ["همه", "گوشت", "مرغ", "سوسیس و کالباس", "جوجه طعم‌دار"];
const fallbackImages = {
  "گوشت": "/images/meat.jpg",
  "مرغ": "/images/chicken.jpg",
  "سوسیس و کالباس": "/images/sausage.jpg",
  "جوجه طعم‌دار": "/images/joojeh.jpg",
  "جوجه طعم دار": "/images/joojeh.jpg",
};

export default function ProductShowcase({ products = [], error = null, loading = false }) {
  const { addProduct } = useCart();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("همه");
  const normalizedProducts = useMemo(() => products.map(normalizeProduct), [products]);
  const visible = useMemo(() => normalizedProducts.filter((product) => {
    const matchesFilter = filter === "همه" || product.category === filter;
    const searchableText = `${product.name} ${product.description}`;
    return matchesFilter && searchableText.includes(query.trim());
  }), [normalizedProducts, query, filter]);

  return (
    <section id="products" aria-labelledby="products-title" className="bg-[#f6f1eb] py-20 sm:py-25">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div><p className="section-eyebrow">تازه‌های امروز</p><h2 id="products-title" className="section-title text-right">محصولات محبوب</h2><p className="mt-3 text-sm leading-7 text-black/60">محصول مورد نظرتان را پیدا و به‌سادگی سفارش دهید.</p></div>
          {!loading && !error && <label className="flex h-[52px] w-full items-center gap-3 rounded-[.9rem] border border-black/10 bg-white px-4 shadow-sm transition focus-within:border-[#dc3b34] focus-within:shadow-[0_0_0_3px_rgba(220,59,52,.08)] lg:w-80"><span className="sr-only">جستجوی محصول</span><Icon name="search" className="size-5 text-black/40" /><input type="search" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-black/40" placeholder="جستجوی محصول..." /></label>}
        </div>
        {!loading && !error && <div className="hide-scrollbar mt-7 flex gap-2 overflow-x-auto pb-2">
          {filters.map(item => <button type="button" aria-pressed={filter === item} key={item} onClick={() => setFilter(item)} className={`min-h-11 shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 ${filter === item ? "bg-[#1d1916] text-white shadow-lg" : "border border-black/10 bg-white text-black/65 hover:border-[#df3b34] hover:text-[#b92b25]"}`}>{item}</button>)}
        </div>}
        <p className="sr-only" role="status" aria-live="polite">{visible.length} محصول نمایش داده می‌شود.</p>
        {loading ? <ProductSkeletons /> : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center text-sm text-red-700">{error}</div>
        ) : visible.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {visible.map((product, index) => <ProductCard key={product.id} {...product} index={index} onAdd={addProduct} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white p-12 text-center text-sm text-black/45">
            {products.length ? "محصولی با این نام پیدا نشد." : "در حال حاضر محصولی برای نمایش وجود ندارد."}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ id, name, category, description, price, discount, unit, image, image_url, available, index, onAdd }) {
  const priceDetails = getPriceDetails(price, discount);
  const isAvailable = available !== false;
  const fallbackImage = fallbackImages[category] || "/images/meat.jpg";

  return <article className="product-card group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
    <div className={`product-image relative aspect-[4/3.2] overflow-hidden tone-${index}`}><ResilientImage key={image} src={image} fallbackSrc={fallbackImage} alt={name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-black/55">{category}</span>{!isAvailable ? <span className="absolute left-3 top-3 rounded-full bg-[#1d1916]/90 px-3 py-1.5 text-[10px] font-bold text-white">اتمام موجودی</span> : null}</div>
    <div className="p-5"><h3 className="font-extrabold leading-7">{name}</h3><p className="mt-2 min-h-10 text-xs leading-6 text-black/60">{description || "محصول تازه و باکیفیت"}</p><div className="mt-4 flex items-center justify-between border-t border-black/8 pt-4"><div><span className="block text-[11px] text-black/50">قیمت {unit ? `هر ${unit}` : "محصول"}</span><strong className="mt-0.5 block text-sm text-[#a92520]">{priceDetails.current}</strong>{priceDetails.original && <del className="mt-0.5 block text-[10px] text-black/40">{priceDetails.original}</del>}</div>{isAvailable ? <a href={whatsappOrderLink(name)} target="_blank" rel="noopener noreferrer" aria-label={`سفارش ${name} در واتساپ`} className="grid size-12 place-items-center rounded-xl bg-[#191512] text-white shadow-sm transition-all duration-200 hover:bg-[#db3b34] hover:shadow-md active:scale-95"><Icon name="basket" className="size-5" /></a> : null}</div>{isAvailable ? <button type="button" onClick={() => onAdd({ id, name, price, discount, unit, image_url })} aria-label={`افزودن ${name} به سبد خرید`} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#dc3b34] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c8322c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc3b34] focus-visible:ring-offset-2 active:translate-y-0"><Icon name="basket" className="size-5" />افزودن به سبد خرید</button> : <button type="button" disabled className="mt-3 flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-500" aria-label={`${name} به اتمام رسیده است`}>اتمام موجودی</button>}</div>
  </article>;
}

function ProductSkeletons() {
  return <div role="status" aria-label="در حال دریافت محصولات" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {Array.from({ length: 5 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"><div className="aspect-[4/3.2] animate-pulse bg-black/10" /><div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-black/10" /><div className="h-3 w-full animate-pulse rounded bg-black/8" /><div className="h-12 animate-pulse rounded-xl bg-black/8" /></div></div>)}
    <span className="sr-only">در حال دریافت محصولات…</span>
  </div>;
}

function normalizeProduct(product) {
  const category = getCategoryName(product.category);
  return {
    ...product,
    category,
    image: product.image_url || fallbackImages[category] || "/images/meat.jpg",
  };
}

function getCategoryName(categoryRelation) {
  const category = Array.isArray(categoryRelation)
    ? categoryRelation[0]
    : categoryRelation;
  const name = typeof category?.name === "string" ? category.name.trim() : "";

  if (!name) return "بدون دسته‌بندی";
  return name === "جوجه طعم دار" ? "جوجه طعم‌دار" : name;
}

function getPriceDetails(price, discount) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return { current: "استعلام قیمت", original: null };

  const numericDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100);
  const finalPrice = numericDiscount ? numericPrice * (1 - numericDiscount / 100) : numericPrice;
  const format = (value) => `${new Intl.NumberFormat("fa-IR").format(Math.round(value))} تومان`;

  return {
    current: format(finalPrice),
    original: numericDiscount ? format(numericPrice) : null,
  };
}
