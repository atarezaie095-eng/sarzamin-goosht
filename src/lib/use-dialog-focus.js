"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useDialogFocus({ initialFocusRef, onClose, pending }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);

  useEffect(() => {
    onCloseRef.current = onClose;
    pendingRef.current = pending;
  }, [onClose, pending]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trigger = document.activeElement;
    const isolatedElements = isolateBackground(dialog);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const initialTarget = initialFocusRef?.current || getFocusableElements(dialog)[0];
      initialTarget?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!pendingRef.current) onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements(dialog);
      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreBackground(isolatedElements);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [initialFocusRef]);

  return dialogRef;
}

function getFocusableElements(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (element) => element.getClientRects().length > 0,
  );
}

function isolateBackground(dialog) {
  const isolated = [];
  let current = dialog;

  while (current.parentElement && current.parentElement !== document.body) {
    for (const sibling of current.parentElement.children) {
      if (sibling === current || sibling.hasAttribute("inert")) continue;
      sibling.setAttribute("inert", "");
      isolated.push(sibling);
    }
    current = current.parentElement;
  }

  if (current.parentElement === document.body) {
    for (const sibling of document.body.children) {
      if (sibling === current || sibling.hasAttribute("inert")) continue;
      sibling.setAttribute("inert", "");
      isolated.push(sibling);
    }
  }

  return isolated;
}

function restoreBackground(elements) {
  elements.forEach((element) => element.removeAttribute("inert"));
}
