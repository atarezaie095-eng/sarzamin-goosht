"use client";

import { useEffect, useSyncExternalStore } from "react";

const CART_STORAGE_KEY = "sarzamin-goosht-cart";
const EMPTY_CART = [];
const listeners = new Set();
const MAX_CART_QUANTITY = Number.MAX_SAFE_INTEGER;

let cartItems = EMPTY_CART;
let initialized = false;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

function initializeCart() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const savedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    cartItems = sanitizeSavedCart(savedCart);
  } catch {
    cartItems = EMPTY_CART;
  }

  window.addEventListener("storage", handleStorageChange);
  emitChange();
}

function handleStorageChange(event) {
  if (event.key !== CART_STORAGE_KEY) return;

  try {
    const nextItems = JSON.parse(event.newValue || "[]");
    cartItems = sanitizeSavedCart(nextItems);
  } catch {
    cartItems = EMPTY_CART;
  }

  emitChange();
}

function saveCart(nextItems) {
  initializeCart();
  cartItems = nextItems;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
  } catch (error) {
    console.warn("Cart could not be persisted to localStorage.", error);
  }
  emitChange();
}

function addProduct(product) {
  initializeCart();
  const normalizedProduct = normalizeProduct(product);
  if (!normalizedProduct) return;

  const existingIndex = cartItems.findIndex(
    (item) => String(item.id) === String(normalizedProduct.id),
  );

  if (existingIndex >= 0) {
    saveCart(
      cartItems.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: incrementQuantity(item.quantity) }
          : item,
      ),
    );
    return;
  }

  saveCart([...cartItems, normalizedProduct]);
}

function increaseQuantity(id) {
  initializeCart();
  saveCart(
    cartItems.map((item) =>
      String(item.id) === String(id)
        ? { ...item, quantity: incrementQuantity(item.quantity) }
        : item,
    ),
  );
}

function decreaseQuantity(id) {
  initializeCart();
  const item = cartItems.find((entry) => String(entry.id) === String(id));
  if (!item) return;

  if (item.quantity <= 1) {
    removeProduct(id);
    return;
  }

  saveCart(
    cartItems.map((entry) =>
      String(entry.id) === String(id)
        ? { ...entry, quantity: entry.quantity - 1 }
        : entry,
    ),
  );
}

function removeProduct(id) {
  initializeCart();
  saveCart(cartItems.filter((item) => String(item.id) !== String(id)));
}

function clearCart() {
  saveCart(EMPTY_CART);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    initializeCart();
  }, []);

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    totals: calculateCartTotals(items),
    addProduct,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearCart,
  };
}

export function calculateCartTotals(items) {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const finalTotal = items.reduce(
    (total, item) =>
      total + getEffectiveUnitPrice(item.price, item.discount) * item.quantity,
    0,
  );

  return {
    subtotal: Math.round(subtotal),
    totalDiscount: Math.round(subtotal - finalTotal),
    finalTotal: Math.round(finalTotal),
  };
}

function getEffectiveUnitPrice(price, discount) {
  return Math.round(price * (1 - discount / 100));
}

function normalizeProduct(product) {
  const hasValidId =
    (typeof product?.id === "string" && product.id.trim()) ||
    (typeof product?.id === "number" && Number.isFinite(product.id));
  if (!hasValidId || !String(product.name || "").trim()) {
    return null;
  }

  const price = Number(product.price);
  if (!Number.isFinite(price) || price < 0 || price > Number.MAX_SAFE_INTEGER) return null;

  return {
    id: product.id,
    name: String(product.name).trim(),
    price,
    discount: clampDiscount(product.discount),
    unit: product.unit ? String(product.unit) : "",
    image_url: normalizeImageUrl(product.image_url),
    quantity: 1,
  };
}

function normalizeSavedItem(item) {
  const product = normalizeProduct(item);
  if (!product) return null;

  const quantity = Number(item.quantity);
  return {
    ...product,
    quantity:
      Number.isSafeInteger(quantity) && quantity > 0
        ? Math.min(quantity, MAX_CART_QUANTITY)
        : 1,
  };
}

function sanitizeSavedCart(value) {
  if (!Array.isArray(value)) return EMPTY_CART;

  return value.reduce((items, savedItem) => {
    const item = normalizeSavedItem(savedItem);
    if (!item) return items;

    const existingIndex = items.findIndex(
      (entry) => String(entry.id) === String(item.id),
    );
    if (existingIndex < 0) return [...items, item];

    return items.map((entry, index) =>
      index === existingIndex
        ? {
            ...entry,
            quantity: Math.min(
              entry.quantity + item.quantity,
              MAX_CART_QUANTITY,
            ),
          }
        : entry,
    );
  }, []);
}

function incrementQuantity(quantity) {
  return quantity < MAX_CART_QUANTITY ? quantity + 1 : MAX_CART_QUANTITY;
}

function clampDiscount(discount) {
  const numericDiscount = Number(discount);
  return Number.isFinite(numericDiscount)
    ? Math.min(Math.max(numericDiscount, 0), 100)
    : 0;
}

function normalizeImageUrl(value) {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (url.startsWith("/")) return url;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" ? parsedUrl.href : null;
  } catch {
    return null;
  }
}
