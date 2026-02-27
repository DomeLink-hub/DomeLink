import { motion } from "framer-motion";
import { ReactNode } from "react";
import PageEnhancer from "./PageEnhancer";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen"
    >
      {children}
      <PageEnhancer />
    </motion.div>
  );
};

export default PageTransition;
