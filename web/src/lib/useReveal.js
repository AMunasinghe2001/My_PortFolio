"use client";

import { useEffect } from "react";

/**
 * Drives the scroll reveal animation on every `.reveal` element.
 *
 * Unlike a one-shot reveal, elements are *not* unobserved after appearing:
 * they animate in each time they enter the viewport and animate back out when
 * they leave, so the effect plays on the way down and reverses on the way up.
 *
 * The direction an element leaves by decides which way it animates out, which
 * is what makes scrolling up feel like a true reverse rather than a re-entry:
 * something that exits below slides back down, something that exits above
 * slides back up.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    // Without IntersectionObserver, show everything rather than nothing.
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;

          if (entry.isIntersecting) {
            el.classList.remove("reveal-below", "reveal-above");
            el.classList.add("is-visible");
          } else {
            // boundingClientRect.top > 0 means the element sits below the
            // viewport, so it should retreat downward; otherwise it left
            // past the top and retreats upward.
            const below = entry.boundingClientRect.top > 0;
            el.classList.remove("is-visible");
            el.classList.toggle("reveal-below", below);
            el.classList.toggle("reveal-above", !below);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
