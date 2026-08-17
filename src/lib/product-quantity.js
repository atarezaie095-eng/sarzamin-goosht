export const MAX_PRODUCT_QUANTITY = 10000;
export const QUANTITY_SCALE = 1000;
const kilogramFormatter = new Intl.NumberFormat("fa-IR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function isKilogramUnit(unit) {
  return String(unit ?? "")
    .trim()
    .replace(/[\s\u200c]+/g, "") === "کیلوگرم";
}

export function isWholeChicken(name) {
  return String(name ?? "")
    .trim()
    .replace(/[\s\u200c]+/g, "") === "مرغکامل";
}

export function normalizeQuantity(value, { kilogram = false, wholeChicken = false } = {}) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_PRODUCT_QUANTITY) {
    return null;
  }

  if (!kilogram) return Number.isSafeInteger(quantity) ? quantity : null;

  const scaled = Math.round(quantity * QUANTITY_SCALE);
  if (Math.abs(quantity * QUANTITY_SCALE - scaled) > 1e-7) return null;

  const normalized = scaled / QUANTITY_SCALE;
  if (wholeChicken && normalized < 1.5) return null;
  return normalized;
}

export function combineQuantities(current, added, kilogram = false) {
  const total = Math.min(Number(current) + Number(added), MAX_PRODUCT_QUANTITY);
  return kilogram ? Math.round(total * QUANTITY_SCALE) / QUANTITY_SCALE : Math.trunc(total);
}

export function formatKilogramQuantity(value) {
  return kilogramFormatter.format(Number(value));
}
