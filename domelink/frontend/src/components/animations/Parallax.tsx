import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  strength?: number; // px of translateY at max scroll
  className?: string;
}

export default function Parallax({ children, strength = 40, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, strength]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
