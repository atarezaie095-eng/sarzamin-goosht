"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "./actions";
import { MAX_PRODUCT_IMAGE_SIZE } from "@/lib/product-images";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import ResilientImage from "@/components/ResilientImage";

const fallbackImages = {
  گوشت: "/images/meat.jpg",
  مرغ: "/images/chicken.jpg",
  "سوسیس و کالباس": "/images/sausage.jpg",
  "جوجه طعم دار": "/images/joojeh.jpg",
  "جوجه طعم‌دار": "/images/joojeh.jpg",
};

const currencyFormatter = new Intl.NumberFormat("fa-IR");
const fieldClassName =
  "min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100";

export default function ProductsList({ products, categories }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState(null);

  return (
    <>
      {notice ? (
        <div role="status" aria-live="polite" className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <p>{notice}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="بستن پیام موفقیت" className="grid size-8 shrink-0 place-items-center rounded-lg transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">×</button>
        </div>
      ) : null}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="min-h-11 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 hover:shadow-md active:scale-[.98]"
        >
          افزودن محصول
        </button>
      </div>

      {products.length ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(200px,2fr)_1fr_1fr_.65fr_.65fr_.8fr_auto] gap-4 bg-zinc-50 px-5 py-3 text-xs font-bold text-zinc-500 md:grid"
        >
          <span>محصول</span>
          <span>دسته‌بندی</span>
          <span>قیمت</span>
          <span>تخفیف</span>
          <span>ویژه</span>
          <span>موجودی</span>
          <span>عملیات</span>
        </div>

        <ul aria-label="فهرست محصولات" className="divide-y divide-zinc-200 bg-white">
          {products.map((product) => {
            const categoryName = product.category?.name || "بدون دسته‌بندی";
            const fallbackImage = fallbackImages[categoryName] || "/images/meat.jpg";
            const image = product.image_url || fallbackImage;

            return (
              <li
                key={product.id}
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 sm:px-5 md:grid-cols-[minmax(200px,2fr)_1fr_1fr_.65fr_.65fr_.8fr_auto] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <ResilientImage key={image} src={image} fallbackSrc={fallbackImage} alt={`تصویر ${product.name}`} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-zinc-900">{product.name}</h3>
                    <p className="mt-1 text-xs text-zinc-500">شناسه محصول: {product.id}</p>
                  </div>
                </div>

                <ProductField label="دسته‌بندی">
                  <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    {categoryName}
                  </span>
                </ProductField>

                <ProductField label="قیمت">
                  <span className="font-bold text-zinc-900">
                    {formatPrice(product.price)}
                    {product.unit ? <small className="mr-1 font-normal text-zinc-500">/ {product.unit}</small> : null}
                  </span>
                </ProductField>

                <ProductField label="تخفیف">
                  <span className={product.discount ? "font-bold text-red-700" : "text-zinc-500"}>
                    {product.discount ? `${currencyFormatter.format(product.discount)}٪` : "بدون تخفیف"}
                  </span>
                </ProductField>

                <ProductField label="وضعیت ویژه">
                  <StatusBadge featured={product.featured} />
                </ProductField>

                <ProductField label="وضعیت موجودی">
                  <AvailabilityBadge available={product.available} />
                </ProductField>

                <ProductField label="عملیات">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                    className="min-h-10 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-red-600"
                    aria-label={`ویرایش ${product.name}`}
                  >
                    ویرایش
                  </button>
                </ProductField>
              </li>
            );
          })}
        </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
          <p className="font-bold text-zinc-800">هنوز محصولی ثبت نشده است.</p>
          <p className="mt-2 text-sm text-zinc-500">برای شروع، اولین محصول فروشگاه را اضافه کنید.</p>
        </div>
      )}

      {isCreating ? (
        <CreateProductPanel categories={categories} onClose={() => setIsCreating(false)} onSuccess={setNotice} />
      ) : null}

      {editingProduct ? (
        <EditProductPanel
          key={editingProduct.id}
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSuccess={setNotice}
        />
      ) : null}
    </>
  );
}

function CreateProductPanel({ categories, onClose, onSuccess }) {
  const router = useRouter();
  const initialFocusRef = useRef(null);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [state, formAction, pending] = useActionState(createProduct, {
    status: "idle",
    message: "",
    fields: {},
  });

  const dialogRef = useDialogFocus({ initialFocusRef, onClose, pending });

  useEffect(() => {
    if (state.status !== "success" && state.status !== "partial") return;

    router.refresh();
    if (state.status === "partial") return;

    onSuccess(state.message);
    const timer = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(timer);
  }, [onClose, onSuccess, router, state.message, state.status]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]" role="presentation">
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default"
        onClick={() => !pending && onClose()}
      />
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-product-title"
        className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xs font-bold text-red-700">محصول جدید</p>
            <h2 id="create-product-title" className="mt-1 text-2xl font-black text-zinc-950">افزودن محصول</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-xl text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <form action={formAction} aria-busy={pending} noValidate className="mt-6 space-y-5">
          <input type="hidden" name="image_expected" value={hasSelectedImage ? "true" : "false"} />
          <FormField label="نام محصول" htmlFor="create-name" error={state.fields?.name}>
            <input
              id="create-name"
              ref={initialFocusRef}
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              {...fieldErrorProps(state.fields?.name, "create-name-error")}
              className={fieldClassName}
            />
          </FormField>

          <FormField label="توضیحات" htmlFor="create-description" error={state.fields?.description}>
            <textarea
              id="create-description"
              name="description"
              maxLength={1000}
              rows={4}
              {...fieldErrorProps(state.fields?.description, "create-description-error")}
              className={`${fieldClassName} resize-y`}
            />
          </FormField>

          <FormField label="دسته‌بندی" htmlFor="create-category" error={state.fields?.category_id}>
            <select id="create-category" name="category_id" defaultValue="" required {...fieldErrorProps(state.fields?.category_id, "create-category-error")} className={fieldClassName}>
              <option value="" disabled>انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>{category.name}</option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="قیمت (تومان)" htmlFor="create-price" error={state.fields?.price}>
              <input
                id="create-price"
                name="price"
                type="number"
                min="0"
                max="2147483647"
                step="1"
                required
                dir="ltr"
                {...fieldErrorProps(state.fields?.price, "create-price-error")}
                className={`${fieldClassName} text-left`}
              />
            </FormField>

            <FormField label="تخفیف (درصد)" htmlFor="create-discount" error={state.fields?.discount}>
              <input
                id="create-discount"
                name="discount"
                type="number"
                defaultValue="0"
                min="0"
                max="100"
                step="1"
                required
                dir="ltr"
                {...fieldErrorProps(state.fields?.discount, "create-discount-error")}
                className={`${fieldClassName} text-left`}
              />
            </FormField>
          </div>

          <FormField label="واحد" htmlFor="create-unit" error={state.fields?.unit}>
            <input
              id="create-unit"
              name="unit"
              type="text"
              list="product-unit-options"
              required
              maxLength={50}
              placeholder="مثلاً کیلوگرم"
              {...fieldErrorProps(state.fields?.unit, "create-unit-error")}
              className={fieldClassName}
            />
            <datalist id="product-unit-options">
              <option value="کیلوگرم" />
              <option value="عدد" />
              <option value="بسته" />
            </datalist>
          </FormField>

          <ProductImageField
            id="create-image"
            serverError={state.fields?.image}
            uploading={pending && hasSelectedImage}
            onSelectionChange={setHasSelectedImage}
          />

          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span>
              <strong className="block text-sm text-zinc-900">محصول ویژه</strong>
              <small className="mt-1 block text-xs text-zinc-500">نمایش محصول در اولویت فهرست</small>
            </span>
            <input name="featured" type="checkbox" className="size-5 accent-red-700" />
          </label>

          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span>
              <strong className="block text-sm text-zinc-900">موجود</strong>
              <small className="mt-1 block text-xs text-zinc-500">محصول قابل افزودن به سبد خرید باشد</small>
            </span>
            <input name="available" type="checkbox" defaultChecked className="size-5 accent-emerald-600" />
          </label>

          <ActionMessage state={state} />

          <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            <button
              type="submit"
              disabled={pending || state.status === "success"}
              className="min-h-12 flex-1 rounded-xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-65"
            >
              {pending
                ? hasSelectedImage ? "در حال ایجاد و بارگذاری..." : "در حال افزودن..."
                : state.status === "success" ? "افزوده شد" : "افزودن محصول"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="min-h-12 rounded-xl border border-zinc-300 px-5 py-3 font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EditProductPanel({ product, categories, onClose, onSuccess }) {
  const router = useRouter();
  const initialFocusRef = useRef(null);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [state, formAction, pending] = useActionState(updateProduct, {
    status: "idle",
    message: "",
    fields: {},
  });

  const dialogRef = useDialogFocus({ initialFocusRef, onClose, pending });

  useEffect(() => {
    if (state.status !== "success") return;

    router.refresh();
    onSuccess(state.message);
    const timer = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(timer);
  }, [onClose, onSuccess, router, state.message, state.status]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]" role="presentation">
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default"
        onClick={() => !pending && onClose()}
      />
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
        className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xs font-bold text-red-700">ویرایش محصول</p>
            <h2 id="edit-product-title" className="mt-1 text-2xl font-black text-zinc-950">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-xl text-zinc-600 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <form action={formAction} aria-busy={pending} noValidate className="mt-6 space-y-5">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="image_expected" value={hasSelectedImage ? "true" : "false"} />

          <FormField label="نام محصول" htmlFor="edit-name" error={state.fields?.name}>
            <input
              id="edit-name"
              ref={initialFocusRef}
              name="name"
              type="text"
              defaultValue={product.name}
              required
              minLength={2}
              maxLength={120}
              {...fieldErrorProps(state.fields?.name, "edit-name-error")}
              className={fieldClassName}
            />
          </FormField>

          <FormField label="توضیحات" htmlFor="edit-description" error={state.fields?.description}>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={product.description || ""}
              maxLength={1000}
              rows={4}
              {...fieldErrorProps(state.fields?.description, "edit-description-error")}
              className={`${fieldClassName} resize-y`}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="قیمت (تومان)" htmlFor="edit-price" error={state.fields?.price}>
              <input
                id="edit-price"
                name="price"
                type="number"
                defaultValue={product.price}
                min="0"
                max="2147483647"
                step="1"
                required
                dir="ltr"
                {...fieldErrorProps(state.fields?.price, "edit-price-error")}
                className={`${fieldClassName} text-left`}
              />
            </FormField>

            <FormField label="تخفیف (درصد)" htmlFor="edit-discount" error={state.fields?.discount}>
              <input
                id="edit-discount"
                name="discount"
                type="number"
                defaultValue={product.discount || 0}
                min="0"
                max="100"
                step="1"
                required
                dir="ltr"
                {...fieldErrorProps(state.fields?.discount, "edit-discount-error")}
                className={`${fieldClassName} text-left`}
              />
            </FormField>
          </div>

          <FormField label="واحد" htmlFor="edit-unit" error={state.fields?.unit}>
            <input
              id="edit-unit"
              name="unit"
              type="text"
              list="edit-product-unit-options"
              defaultValue={product.unit || ""}
              required
              maxLength={50}
              placeholder="مثلاً کیلوگرم"
              {...fieldErrorProps(state.fields?.unit, "edit-unit-error")}
              className={fieldClassName}
            />
            <datalist id="edit-product-unit-options">
              <option value="کیلوگرم" />
              <option value="عدد" />
              <option value="بسته" />
            </datalist>
          </FormField>

          <FormField label="دسته‌بندی" htmlFor="edit-category" error={state.fields?.category_id}>
            <select
              id="edit-category"
              name="category_id"
              defaultValue={product.category_id}
              required
              {...fieldErrorProps(state.fields?.category_id, "edit-category-error")}
              className={fieldClassName}
            >
              <option value="" disabled>انتخاب دسته‌بندی</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </FormField>

          <ProductImageField
            id="edit-image"
            currentImage={product.image_url}
            serverError={state.fields?.image}
            uploading={pending && hasSelectedImage}
            onSelectionChange={setHasSelectedImage}
          />

          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span>
              <strong className="block text-sm text-zinc-900">محصول ویژه</strong>
              <small className="mt-1 block text-xs text-zinc-500">نمایش محصول در اولویت فهرست</small>
            </span>
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product.featured}
              className="size-5 accent-red-700"
            />
          </label>

          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span>
              <strong className="block text-sm text-zinc-900">موجود</strong>
              <small className="mt-1 block text-xs text-zinc-500">برای اتمام موجودی، این گزینه را غیرفعال کنید</small>
            </span>
            <input
              name="available"
              type="checkbox"
              defaultChecked={product.available !== false}
              className="size-5 accent-emerald-600"
            />
          </label>

          <ActionMessage state={state} />

          <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 flex-1 rounded-xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-65"
            >
              {pending
                ? hasSelectedImage ? "در حال بارگذاری و ذخیره..." : "در حال ذخیره..."
                : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="min-h-12 rounded-xl border border-zinc-300 px-5 py-3 font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormField({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-zinc-800">{label}</label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="mt-2 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function fieldErrorProps(error, errorId) {
  return {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };
}

function ProductImageField({
  id,
  currentImage = null,
  serverError,
  uploading,
  onSelectionChange,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [clientError, setClientError] = useState("");
  const displayedImage = previewUrl || currentImage;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setClientError("");

    if (!file) {
      setPreviewUrl(null);
      onSelectionChange(false);
      return;
    }

    const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

    if (!supportedTypes.includes(file.type)) {
      event.target.value = "";
      setPreviewUrl(null);
      setClientError("فرمت تصویر باید JPG، JPEG، PNG، WebP یا AVIF باشد.");
      onSelectionChange(false);
      return;
    }

    if (file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_SIZE) {
      event.target.value = "";
      setPreviewUrl(null);
      setClientError("حجم تصویر باید حداکثر ۵ مگابایت باشد.");
      onSelectionChange(false);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onSelectionChange(true);
  }

  const error = clientError || serverError;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-zinc-800">تصویر محصول</label>
      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-white sm:w-[120px]">
          {displayedImage ? (
            <ResilientImage
              key={displayedImage}
              src={displayedImage}
              fallbackSrc="/images/meat.jpg"
              alt="پیش‌نمایش تصویر محصول"
              fill
              sizes="120px"
              unoptimized={Boolean(previewUrl)}
              className="object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center px-3 text-center text-xs leading-6 text-zinc-400">
              بدون تصویر
            </span>
          )}
          {uploading ? (
            <span className="absolute inset-0 grid place-items-center bg-black/55 px-2 text-center text-xs font-bold text-white">
              در حال بارگذاری…
            </span>
          ) : null}
        </div>

        <div>
          <input
            id={id}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
            onChange={handleImageChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : `${id}-help`}
            className="block w-full cursor-pointer rounded-xl border border-zinc-300 bg-white text-sm text-zinc-600 file:ml-3 file:min-h-11 file:border-0 file:bg-zinc-900 file:px-4 file:font-bold file:text-white hover:file:bg-red-700"
          />
          <p id={`${id}-help`} className="mt-2 text-xs leading-6 text-zinc-500">
            JPG، JPEG، PNG، WebP یا AVIF — حداکثر ۵ مگابایت
          </p>
          {previewUrl ? <p className="mt-1 text-xs font-medium text-emerald-700">تصویر برای بارگذاری آماده است.</p> : null}
        </div>
      </div>
      {error ? <p id={`${id}-error`} className="mt-2 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function ActionMessage({ state }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="min-h-12">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function ProductField({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm md:block">
      <span className="font-semibold text-zinc-500 md:sr-only">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function StatusBadge({ featured }) {
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${featured ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${featured ? "bg-emerald-500" : "bg-zinc-400"}`} />
      {featured ? "ویژه" : "عادی"}
    </span>
  );
}

function AvailabilityBadge({ available }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${available === false ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
      {available === false ? "اتمام موجودی" : "موجود"}
    </span>
  );
}

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? `${currencyFormatter.format(numericPrice)} تومان` : "ثبت نشده";
}
