"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

// Slides up and fades in the first time it scrolls into view. Reduced-motion
// visitors get the fade only (PageBody's MotionConfig handles that).
//
// The trigger watches a static sentinel at the element's top edge, not the
// moving element: observing an element that is itself translated off-screen
// made the reveal fire late and in a burst on iOS Safari. Only transform and
// opacity animate.
export default function RevealUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const sentinel = useRef<HTMLSpanElement>(null);
  // Fires once the top edge is 12% of the viewport above the bottom.
  const shown = useInView(sentinel, { once: true, margin: "0px 0px -12% 0px" });

  return (
    <>
      <span ref={sentinel} aria-hidden className="block h-px" />
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 40 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: shown ? "auto" : "transform, opacity" }}
      >
        {children}
      </motion.div>
    </>
  );
}
