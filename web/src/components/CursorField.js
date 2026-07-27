"use client";

import { useEffect, useRef } from "react";
import styles from "./CursorField.module.css";

/**
 * An interactive particle field that trails the pointer, drawn on a canvas
 * behind the hero content.
 *
 * Design constraints that shape this:
 *  - It must never compete with the text, so particles are small, dim and
 *    drawn *behind* everything (the canvas is z-index -1 within the hero).
 *  - It only runs on the home page and fades out as you scroll to the sections
 *    below, so the rest of the site stays calm.
 *  - It is purely decorative: `aria-hidden`, no pointer events, and it does
 *    not render at all for users who prefer reduced motion.
 */
export default function CursorField({ fadeOnScroll = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // --- Ambient drifting dots ---------------------------------------------
    // Density scales with area so a wide monitor isn't sparse and a phone
    // isn't overloaded.
    const COUNT = Math.round(
      Math.min(110, Math.max(36, (width * height) / 16000))
    );

    const dots = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.5 + 0.6,
      a: Math.random() * 0.4 + 0.25,
    }));

    // --- Pointer ------------------------------------------------------------
    const pointer = { x: -9999, y: -9999, active: false };
    const INFLUENCE = 170; // px radius the pointer pushes/links within

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;

      // Comet trail: a few short-lived sparks flung from the cursor.
      if (pointer.active && sparks.length < 90) {
        for (let i = 0; i < 2; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.4 + 0.6;
          sparks.push({
            x: pointer.x,
            y: pointer.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            r: Math.random() * 1.8 + 0.7,
          });
        }
      }
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    /** @type {{x:number,y:number,vx:number,vy:number,life:number,r:number}[]} */
    const sparks = [];

    // --- Fade out as the section scrolls away ------------------------------
    // On the home page the field belongs to the hero only, so it dims as the
    // sections below arrive. On a single-screen page (login) there is nothing
    // to scroll past, so it stays at full strength.
    let fade = 1;
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      fade = Math.max(0, 1 - y / (h * 0.7));
    };
    if (fadeOnScroll) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (fade > 0.01) {
        ctx.globalAlpha = 1;

        // Drifting dots, nudged gently away from the pointer.
        for (const d of dots) {
          d.x += d.vx;
          d.y += d.vy;

          // Wrap around the edges so the field never empties out.
          if (d.x < -10) d.x = width + 10;
          if (d.x > width + 10) d.x = -10;
          if (d.y < -10) d.y = height + 10;
          if (d.y > height + 10) d.y = -10;

          let px = d.x;
          let py = d.y;

          if (pointer.active) {
            const dx = d.x - pointer.x;
            const dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < INFLUENCE && dist > 0.01) {
              // Push outward, strongest closest to the cursor.
              const push = (1 - dist / INFLUENCE) * 26;
              px += (dx / dist) * push;
              py += (dy / dist) * push;

              // Link nearby dots back to the cursor with a faint line.
              ctx.globalAlpha = (1 - dist / INFLUENCE) * 0.28 * fade;
              ctx.strokeStyle = "#0ad0dc";
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(pointer.x, pointer.y);
              ctx.stroke();
            }
          }

          ctx.globalAlpha = d.a * fade;
          ctx.fillStyle = "#7ef9ff";
          ctx.beginPath();
          ctx.arc(px, py, d.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sparks thrown from the cursor.
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94;
          s.vy *= 0.94;
          s.life -= 0.022;

          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = s.life * 0.75 * fade;
          ctx.fillStyle = "#0ad0dc";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, [fadeOnScroll]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
