import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import PageEnhancer from "./PageEnhancer";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReduced ? 0 : -8 }}
      transition={{ duration: prefersReduced ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen"
    >
      {children}
      <PageEnhancer />
    </motion.div>
  );
};

export default PageTransition;
