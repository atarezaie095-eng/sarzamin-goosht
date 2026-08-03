"use client";

import { useLayoutEffect, useState } from "react";

export default function MotionController() {
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = [...document.querySelectorAll("[data-reveal]")];

    if (reducedMotion || !("IntersectionObserver" in window)) {
      requestAnimationFrame(() => setLoading(false));
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    root.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const observe = (element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    };
    elements.forEach(observe);
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("[data-reveal]")) observe(node);
        node.querySelectorAll?.("[data-reveal]").forEach(observe);
      }));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return loading ? <div aria-hidden="true" className="page-loader" onAnimationEnd={() => setLoading(false)} /> : null;
}
