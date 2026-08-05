"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

/**
 * Scroll reveal: children fade-rise when they enter the viewport (.rv → .in).
 * Elements already on screen at mount stagger in, 70ms apart, matching the
 * reference's activate() behavior. Reduced-motion is handled in CSS.
 */
export function Rv({
  children,
  as: Tag = "div",
  className = "",
  style,
  index = 0,
}: {
  children: ReactNode;
  as?: "div" | "section" | "article" | "p" | "h1" | "h2" | "footer";
  className?: string;
  style?: CSSProperties;
  index?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      const t = setTimeout(() => el.classList.add("in"), index * 70);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`rv ${className}`} style={style}>
      {children}
    </Tag>
  );
}
