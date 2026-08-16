"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import {
  ProductImageUploadError,
  uploadProductImage,
} from "@/lib/product-images";

const errorState = (message, fields = {}) => ({ status: "error", message, fields });
const MAX_PRODUCT_PRICE = 2_147_483_647;
const MAX_POSTGRES_BIGINT = "9223372036854775807";

export async function createProduct(_previousState, formData) {
  const imageSelection = getImageSelection(formData);

  if (imageSelection.error) {
    return errorState(imageSelection.error, { image: imageSelection.error });
  }

  const image = imageSelection.image;
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    categoryId: String(formData.get("category_id") ?? "").trim(),
    price: parsePrice(formData.get("price")),
    discount: Number(formData.get("discount")),
    unit: String(formData.get("unit") ?? "").trim(),
    featured: formData.get("featured") === "on",
    available: formData.get("available") === "on",
  };
  const fields = validateNewProduct(values);

  if (Object.keys(fields).length) {
    return errorState("لطفاً خطاهای فرم را اصلاح کنید.", fields);
  }

  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return errorState("دسترسی مدیریتی شما معتبر نیست. لطفاً دوباره وارد شوید.");
    }

    const { user, supabase } = admin;
    const categoryValidation = await validateCategory(
      values.categoryId,
      "createProduct",
      supabase,
    );

    if (!categoryValidation.valid) {
      return errorState(categoryValidation.message, {
        category_id: "دسته‌بندی انتخاب‌شده پیدا نشد.",
      });
    }

    const { data, error, status, statusText } = await supabase
      .from("products")
      .insert({
        name: values.name,
        slug: createUniqueSlug(values.name),
        description: values.description || null,
        category_id: values.categoryId,
        price: values.price,
        discount: values.discount,
        unit: values.unit,
        featured: values.featured,
        available: values.available,
        image_url: null,
      })
      .select("id, name, price, discount, category_id, unit, featured, available, image_url")
      .single();

    if (error || !data) {
      console.error(
        "[Supabase:createProduct] Insert failed " +
          JSON.stringify({
            userId: user.id,
            status,
            statusText,
            code: error?.code,
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            rowReturned: Boolean(data),
          }),
      );

      return errorState(
        error?.code === "42501"
          ? "دسترسی لازم برای افزودن محصول وجود ندارد. لطفاً دوباره وارد پنل مدیریت شوید."
          : error?.code === "23505"
            ? "محصولی با مشخصات مشابه وجود دارد. لطفاً دوباره تلاش کنید."
            : "افزودن محصول انجام نشد. لطفاً دوباره تلاش کنید.",
      );
    }

    if (image) {
      let uploadedImage;

      try {
        uploadedImage = await uploadProductImage(image, {
          productId: data.id,
          client: supabase,
        });
      } catch (uploadError) {
        console.error(
          "[Supabase:createProduct] Product created but image upload failed " +
            JSON.stringify({
              productId: data.id,
              code: uploadError instanceof ProductImageUploadError ? uploadError.code : "UNKNOWN",
              message: uploadError instanceof Error ? uploadError.message : String(uploadError),
            }),
        );
        revalidateProductPages();
        return {
          status: "partial",
          message: `محصول ایجاد شد، اما بارگذاری تصویر ناموفق بود. ${getImageErrorMessage(uploadError)}`,
          fields: { image: getImageErrorMessage(uploadError) },
          productId: data.id,
        };
      }

      const imageUrlResponse = await supabase
        .from("products")
        .update({ image_url: uploadedImage.publicUrl })
        .eq("id", data.id)
        .select("id, image_url")
        .maybeSingle();
      const { data: imageUrlData, error: imageUrlError, status: imageUrlStatus } = imageUrlResponse;

      console.info(
        "[Supabase:createProduct] image_url update response " +
          JSON.stringify({
            productId: data.id,
            storagePath: uploadedImage.path,
            publicUrl: uploadedImage.publicUrl,
            data: imageUrlData,
            error: serializePostgrestError(imageUrlError),
            status: imageUrlStatus,
          }),
      );

      if (
        imageUrlError ||
        !imageUrlData ||
        imageUrlData.image_url !== uploadedImage.publicUrl
      ) {
        console.error(
          "[Supabase:createProduct] Product created but image URL update failed " +
            JSON.stringify({
              productId: data.id,
              path: uploadedImage.path,
              publicUrl: uploadedImage.publicUrl,
              data: imageUrlData,
              error: serializePostgrestError(imageUrlError),
              status: imageUrlStatus,
            }),
        );
        revalidateProductPages();
        return {
          status: "partial",
          message: "محصول ایجاد شد، اما ثبت تصویر آن کامل نشد. لطفاً دوباره تلاش کنید.",
          fields: { image: "ثبت تصویر محصول کامل نشد." },
          productId: data.id,
        };
      }
    }

    revalidateProductPages();

    return {
      status: "success",
      message: "محصول جدید با موفقیت افزوده شد.",
      fields: {},
      productId: data.id,
    };
  } catch (error) {
    console.error(
      "[Supabase:createProduct] Unexpected failure " +
        JSON.stringify({
          name: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : String(error),
        }),
    );

    return errorState("ارتباط با سرویس محصولات برقرار نشد. لطفاً دوباره تلاش کنید.");
  }
}

export async function updateProduct(_previousState, formData) {
  const imageSelection = getImageSelection(formData);

  if (imageSelection.error) {
    return errorState(imageSelection.error, { image: imageSelection.error });
  }

  const image = imageSelection.image;
  const rawCategoryId = String(formData.get("category_id") ?? "").trim();
  const values = {
    id: String(formData.get("id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: parsePrice(formData.get("price")),
    discount: Number(formData.get("discount")),
    unit: String(formData.get("unit") ?? "").trim(),
    // PostgreSQL int8 values are kept as decimal strings to avoid unsafe JS
    // number coercion. PostgREST accepts this representation for bigint.
    categoryId: rawCategoryId,
    featured: formData.get("featured") === "on",
    available: formData.get("available") === "on",
  };
  const fields = {};

  if (!isValidPostgresBigintId(values.id)) {
    return errorState("شناسه محصول معتبر نیست.");
  }

  if (values.name.length < 2 || values.name.length > 120) {
    fields.name = "نام محصول باید بین ۲ تا ۱۲۰ نویسه باشد.";
  }

  if (values.description.length > 1000) {
    fields.description = "توضیحات نباید بیشتر از ۱۰۰۰ نویسه باشد.";
  }

  if (!isValidProductPrice(values.price)) {
    fields.price = "قیمت باید یک عدد صحیح بین ۰ تا ۲٬۱۴۷٬۴۸۳٬۶۴۷ تومان باشد.";
  }

  if (!Number.isInteger(values.discount) || values.discount < 0 || values.discount > 100) {
    fields.discount = "تخفیف باید یک عدد صحیح بین ۰ تا ۱۰۰ باشد.";
  }

  if (!/^[1-9]\d*$/.test(values.categoryId)) {
    fields.category_id = "یک دسته‌بندی معتبر انتخاب کنید.";
  }

  if (!values.unit || values.unit.length > 50) {
    fields.unit = "واحد محصول را با حداکثر ۵۰ نویسه وارد کنید.";
  }

  if (Object.keys(fields).length) {
    return errorState("لطفاً خطاهای فرم را اصلاح کنید.", fields);
  }

  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return errorState("دسترسی مدیریتی شما معتبر نیست. لطفاً دوباره وارد شوید.");
    }

    const { user, supabase } = admin;
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id");

    const availableCategoryIds = (categories ?? []).map((category) => String(category.id));

    console.info(
      "[Supabase:updateProduct] Category validation " +
        JSON.stringify({
          selectedCategoryId: values.categoryId,
          selectedCategoryIdType: typeof values.categoryId,
          availableCategoryIds,
        }),
    );

    if (categoryError || !availableCategoryIds.includes(values.categoryId)) {
      if (categoryError) {
        console.error(
          "[Supabase:updateProduct] Category lookup failed " +
            JSON.stringify({
              code: categoryError.code,
              status: categoryError.status,
              message: categoryError.message,
              details: categoryError.details,
              hint: categoryError.hint,
            }),
        );
      }

      return errorState("دسته‌بندی انتخاب‌شده معتبر نیست.", {
        category_id: "دسته‌بندی انتخاب‌شده پیدا نشد.",
      });
    }

    let uploadedImage = null;

    if (image) {
      try {
        uploadedImage = await uploadProductImage(image, {
          productId: values.id,
          client: supabase,
        });
      } catch (uploadError) {
        console.error(
          "[Supabase:updateProduct] Image upload failed " +
            JSON.stringify({
              productId: values.id,
              code: uploadError instanceof ProductImageUploadError ? uploadError.code : "UNKNOWN",
              message: uploadError instanceof Error ? uploadError.message : String(uploadError),
            }),
        );
        return errorState(getImageErrorMessage(uploadError), {
          image: getImageErrorMessage(uploadError),
        });
      }
    }

    const updatePayload = {
      name: values.name,
      description: values.description || null,
      price: values.price,
      discount: values.discount,
      category_id: values.categoryId,
      unit: values.unit,
      featured: values.featured,
      available: values.available,
    };

    if (uploadedImage) {
      updatePayload.image_url = uploadedImage.publicUrl;
    }

    const updateResponse = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", values.id)
      .select("id, name, price, discount, category_id, unit, featured, available, image_url")
      .maybeSingle();

    const { data, error, status, statusText, count } = updateResponse;

    console.info(
      "[Supabase:updateProduct] Complete response " +
        JSON.stringify({
          data,
          error: error
            ? {
                name: error.name,
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
              }
            : null,
          errorCode: error?.code ?? null,
          errorMessage: error?.message ?? null,
          errorDetails: error?.details ?? null,
          errorHint: error?.hint ?? null,
          status,
          statusText,
          count,
          uploadedImage: uploadedImage
            ? { path: uploadedImage.path, publicUrl: uploadedImage.publicUrl }
            : null,
        }),
    );

    if (error || !data) {
      console.error(
        "[Supabase:updateProduct] Update failed " +
          JSON.stringify({
            productId: values.id,
            categoryId: values.categoryId,
            categoryIdType: typeof values.categoryId,
            userId: user.id,
            data,
            error: error
              ? {
                  code: error.code,
                  message: error.message,
                  details: error.details,
                  hint: error.hint,
                }
              : null,
            code: error?.code,
            status,
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            rowReturned: Boolean(data),
            uploadedStoragePath: uploadedImage?.path ?? null,
            uploadedPublicUrl: uploadedImage?.publicUrl ?? null,
          }),
      );

      return errorState(
        uploadedImage
          ? "تصویر بارگذاری شد، اما ثبت آن برای محصول انجام نشد. لطفاً دوباره تلاش کنید."
          :
        error?.code === "42501" || (!error && !data)
          ? "دسترسی لازم برای ویرایش محصول وجود ندارد. لطفاً دوباره وارد پنل مدیریت شوید."
          : "ذخیره تغییرات انجام نشد. لطفاً دوباره تلاش کنید.",
      );
    }

    if (uploadedImage && data.image_url !== uploadedImage.publicUrl) {
      console.error(
        "[Supabase:updateProduct] image_url verification failed " +
          JSON.stringify({
            productId: values.id,
            storagePath: uploadedImage.path,
            expectedPublicUrl: uploadedImage.publicUrl,
            returnedImageUrl: data.image_url,
          }),
      );
      return errorState(
        "تصویر بارگذاری شد، اما ثبت تصویر جدید برای محصول تأیید نشد. لطفاً دوباره تلاش کنید.",
        { image: "ثبت تصویر جدید محصول تأیید نشد." },
      );
    }

    revalidateProductPages();

    return {
      status: "success",
      message: uploadedImage
        ? "تصویر و تغییرات محصول با موفقیت ذخیره شدند."
        : "تغییرات محصول با موفقیت ذخیره شد.",
      fields: {},
    };
  } catch (error) {
    console.error(
      "[Supabase:updateProduct] Unexpected failure " +
        JSON.stringify({
          productId: values.id,
          name: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : String(error),
        }),
    );

    return errorState("ارتباط با سرویس محصولات برقرار نشد. لطفاً دوباره تلاش کنید.");
  }
}

function validateNewProduct(values) {
  const fields = {};

  if (values.name.length < 2 || values.name.length > 120) {
    fields.name = "نام محصول باید بین ۲ تا ۱۲۰ نویسه باشد.";
  }

  if (values.description.length > 1000) {
    fields.description = "توضیحات نباید بیشتر از ۱۰۰۰ نویسه باشد.";
  }

  if (!/^[1-9]\d*$/.test(values.categoryId)) {
    fields.category_id = "یک دسته‌بندی معتبر انتخاب کنید.";
  }

  if (!isValidProductPrice(values.price)) {
    fields.price = "قیمت باید یک عدد صحیح بین ۰ تا ۲٬۱۴۷٬۴۸۳٬۶۴۷ تومان باشد.";
  }

  if (!Number.isInteger(values.discount) || values.discount < 0 || values.discount > 100) {
    fields.discount = "تخفیف باید یک عدد صحیح بین ۰ تا ۱۰۰ باشد.";
  }

  if (!values.unit || values.unit.length > 50) {
    fields.unit = "واحد محصول را با حداکثر ۵۰ نویسه وارد کنید.";
  }

  return fields;
}

function parsePrice(value) {
  const rawValue = String(value ?? "").trim();
  return rawValue ? Number(rawValue) : Number.NaN;
}

function isValidProductPrice(price) {
  return Number.isFinite(price)
    && Number.isInteger(price)
    && price >= 0
    && price <= MAX_PRODUCT_PRICE;
}

function isValidPostgresBigintId(id) {
  if (!/^[1-9]\d{0,18}$/.test(id)) return false;
  return id.length < MAX_POSTGRES_BIGINT.length || id <= MAX_POSTGRES_BIGINT;
}

async function validateCategory(categoryId, operation, supabase) {
  const { data, error } = await supabase.from("categories").select("id");

  if (error) {
    console.error(
      `[Supabase:${operation}] Category lookup failed ` +
        JSON.stringify({
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
          hint: error.hint,
        }),
    );
    return { valid: false, message: "دریافت دسته‌بندی‌ها با خطا روبه‌رو شد." };
  }

  const availableCategoryIds = (data ?? []).map((category) => String(category.id));
  return {
    valid: availableCategoryIds.includes(categoryId),
    message: "دسته‌بندی انتخاب‌شده معتبر نیست.",
  };
}

function createUniqueSlug(name) {
  const base = name
    .normalize("NFKC")
    .toLocaleLowerCase("fa-IR")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "product";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function getImageSelection(formData) {
  const image = formData.get("image");
  const expected = formData.get("image_expected") === "true";
  const selectedImage =
    image && typeof image.size === "number" && image.size > 0 ? image : null;

  if (expected && !selectedImage) {
    return {
      image: null,
      error: "فایل تصویر پس از ارسال فرم در مرورگر پاک شده است. لطفاً تصویر را دوباره انتخاب کنید.",
    };
  }

  return { image: selectedImage, error: null };
}

function getImageErrorMessage(error) {
  return error instanceof ProductImageUploadError
    ? error.message
    : "بارگذاری تصویر با خطای پیش‌بینی‌نشده روبه‌رو شد.";
}

function revalidateProductPages() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

function serializePostgrestError(error) {
  if (!error) return null;
  return {
    name: error.name,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  };
}
