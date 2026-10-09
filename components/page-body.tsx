"use client";

import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "motion/react";

// Fades and rises a page's content in on navigation. Goes below the page's
// section bar so the masthead and bar stay still while only the content
// animates. Keyed by pathname so moving between two pages of the same route
// (product → product) replays it; query changes (shop filters) don't.
// Enter-only on purpose: exit animations fight the App Router's instant page
// swap and look janky.
export default function PageBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // reducedMotion="user": visitors who ask for less motion get the fade
    // without the movement.
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
