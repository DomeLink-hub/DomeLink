import { motion } from "framer-motion";
import { Cuboid } from "lucide-react"; // Using an icon as a safe placeholder for the 3D element

const StudioScene = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-background/20 rounded-3xl flex flex-col items-center justify-center border border-border/40 overflow-hidden relative">
      {/* Soft gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        animate={{ 
          rotateY: [0, 360],
          y: [-10, 10, -10]
        }}
        transition={{ 
          rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="text-primary/40 mb-4"
      >
        <Cuboid size={64} strokeWidth={1} />
      </motion.div>
      
      <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
        Studio Environment Ready
      </p>
    </div>
  );
};

export default StudioScene;