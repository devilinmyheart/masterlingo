import { motion, useReducedMotion } from "framer-motion";
import type { IconSpec, MotionPreset } from "@/data/animations";
import { cn } from "@/lib/utils";

// Looping animation presets. Kept short and additive so they read as playful,
// not distracting. Reduced-motion users see a static emoji.
const VARIANTS: Record<MotionPreset, Parameters<typeof motion.span>[0]["animate"]> = {
  bounce: { y: [0, -8, 0], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } },
  wiggle: { rotate: [-6, 6, -6], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } },
  float: { y: [0, -4, 0], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  spin: { rotate: [0, 360], transition: { duration: 3.5, repeat: Infinity, ease: "linear" } },
  pulse: { scale: [1, 1.12, 1], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
  steam: { y: [0, -3, 0], scale: [1, 1.04, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  wave: { rotate: [0, 18, -8, 18, 0], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
};

type Props = {
  icon: IconSpec;
  size?: number;
  label?: string;
  className?: string;
};

export function AnimatedIcon({ icon, size = 96, label, className }: Props) {
  const reduced = useReducedMotion();
  return (
    <span
      role="img"
      aria-label={label ?? icon.emoji}
      className={cn("inline-flex items-center justify-center leading-none", className)}
      style={{ fontSize: size, width: size, height: size }}
    >
      <motion.span
        style={{ display: "inline-block", fontSize: size, lineHeight: 1 }}
        animate={reduced ? undefined : VARIANTS[icon.motion]}
      >
        {icon.emoji}
      </motion.span>
    </span>
  );
}
