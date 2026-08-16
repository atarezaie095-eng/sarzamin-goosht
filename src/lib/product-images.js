import { supabase } from "./supabase";

export const PRODUCT_IMAGES_BUCKET = "products";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class ProductImageUploadError extends Error {
  constructor(message, { code = "UPLOAD_FAILED", cause } = {}) {
    super(message, { cause });
    this.name = "ProductImageUploadError";
    this.code = code;
  }
}

/**
 * Uploads a validated product image and returns its public URL.
 * Intended for use by a future client-side admin form.
 */
export async function uploadProductImage(file, options = {}) {
  const {
    folder = "catalog",
    productId,
    maxSize = MAX_PRODUCT_IMAGE_SIZE,
    client = supabase,
  } = options;

  validateImage(file, maxSize);

  if (!client) {
    throw new ProductImageUploadError(
      "تنظیمات اتصال Supabase در دسترس نیست.",
      { code: "SUPABASE_NOT_CONFIGURED" },
    );
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  const objectPath = createObjectPath({ folder, productId, extension });

  console.info(
    "[Supabase:uploadProductImage] Upload started " +
      JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        productId: productId == null ? null : String(productId),
        bucket: PRODUCT_IMAGES_BUCKET,
        path: objectPath,
      }),
  );

  try {
    const uploadResponse = await client.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
    const { data, error } = uploadResponse;

    console.info(
      "[Supabase:uploadProductImage] Upload response " +
        JSON.stringify({
          bucket: PRODUCT_IMAGES_BUCKET,
          generatedPath: objectPath,
          data: data
            ? { id: data.id, path: data.path, fullPath: data.fullPath }
            : null,
          error: serializeStorageError(error),
        }),
    );

    if (error) {
      console.error(
        "[Supabase:uploadProductImage] Upload failed " +
          JSON.stringify({
            bucket: PRODUCT_IMAGES_BUCKET,
            path: objectPath,
            error: serializeStorageError(error),
          }),
      );
      throw new ProductImageUploadError(
        "بارگذاری تصویر محصول با خطا روبه‌رو شد.",
        { code: "STORAGE_UPLOAD_FAILED", cause: error },
      );
    }

    const publicUrl = getProductImagePublicUrl(data.path, { client });

    console.info(
      "[Supabase:uploadProductImage] Upload completed " +
        JSON.stringify({
          bucket: PRODUCT_IMAGES_BUCKET,
          generatedPath: objectPath,
          returnedPath: data.path,
          fullPath: data.fullPath,
          publicUrl,
        }),
    );

    return {
      id: data.id,
      path: data.path,
      fullPath: data.fullPath,
      publicUrl,
    };
  } catch (error) {
    if (error instanceof ProductImageUploadError) throw error;

    console.error(
      "[Supabase:uploadProductImage] Unexpected failure " +
        JSON.stringify({
          bucket: PRODUCT_IMAGES_BUCKET,
          path: objectPath,
          error: serializeStorageError(error),
        }),
    );
    throw new ProductImageUploadError(
      "ارتباط با سرویس بارگذاری تصویر برقرار نشد.",
      { code: "STORAGE_CONNECTION_FAILED", cause: error },
    );
  }
}

export function getProductImagePublicUrl(path, { client = supabase } = {}) {
  if (!client) {
    throw new ProductImageUploadError(
      "تنظیمات اتصال Supabase در دسترس نیست.",
      { code: "SUPABASE_NOT_CONFIGURED" },
    );
  }

  if (typeof path !== "string" || !path.trim()) {
    throw new ProductImageUploadError("مسیر تصویر معتبر نیست.", {
      code: "INVALID_IMAGE_PATH",
    });
  }

  const { data } = client.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new ProductImageUploadError("آدرس عمومی تصویر ایجاد نشد.", {
      code: "PUBLIC_URL_FAILED",
    });
  }

  return data.publicUrl;
}

function validateImage(file, maxSize) {
  if (!file || typeof file.size !== "number" || typeof file.type !== "string") {
    throw new ProductImageUploadError("فایل تصویر معتبر نیست.", {
      code: "INVALID_FILE",
    });
  }

  if (!IMAGE_EXTENSIONS[file.type]) {
    throw new ProductImageUploadError(
      "فرمت تصویر باید JPG، PNG، WebP یا AVIF باشد.",
      { code: "UNSUPPORTED_IMAGE_TYPE" },
    );
  }

  if (file.size <= 0 || file.size > maxSize) {
    throw new ProductImageUploadError(
      `حجم تصویر باید کمتر از ${Math.round(maxSize / 1024 / 1024)} مگابایت باشد.`,
      { code: "IMAGE_TOO_LARGE" },
    );
  }
}

function createObjectPath({ folder, productId, extension }) {
  const safeFolder = sanitizePathSegment(folder) || "catalog";
  const safeProductId = sanitizePathSegment(productId);
  const prefix = safeProductId ? `${safeProductId}-` : "";
  return `${safeFolder}/${prefix}${crypto.randomUUID()}.${extension}`;
}

function sanitizePathSegment(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function serializeStorageError(error) {
  if (!error) return null;

  const cause = error.cause || error.originalError;
  return {
    name: error.name,
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    code: error.code,
    error: error.error,
    cause: cause
      ? {
          name: cause.name,
          message: cause.message,
          code: cause.code,
        }
      : null,
  };
}
