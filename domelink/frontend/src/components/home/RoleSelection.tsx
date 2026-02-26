import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RoleSelection = () => {
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const navigate = useNavigate();

  const handleClick = (role: "homeowner" | "architect") => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* DomeLink Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <span className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="dome-orb" />
          DomeLink
        </span>
      </motion.div>

      {/* Homeowner Side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          flex: hoveredSide === "left" ? 1.4 : hoveredSide === "right" ? 0.6 : 1 
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative cursor-pointer group"
        onMouseEnter={() => setHoveredSide("left")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleClick("homeowner")}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-slow ease-editorial group-hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')" 
          }}
        />
        
        {/* Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/40 transition-colors duration-700"
          animate={{ 
            backgroundColor: hoveredSide === "right" ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.4)" 
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dome-kicker text-white/60">Find Your Architect</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
              Homeowner
            </h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: hoveredSide === "left" ? "100px" : "60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-px bg-white/60"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredSide === "left" ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-body text-white/80 max-w-xs"
            >
              Discover verified architects for your dream home
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Architect Side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          flex: hoveredSide === "right" ? 1.4 : hoveredSide === "left" ? 0.6 : 1 
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative cursor-pointer group"
        onMouseEnter={() => setHoveredSide("right")}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => handleClick("architect")}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-slow ease-editorial group-hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')" 
          }}
        />
        
        {/* Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/40 transition-colors duration-700"
          animate={{ 
            backgroundColor: hoveredSide === "left" ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.4)" 
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16 text-right items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dome-kicker text-white/60">Grow Your Practice</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[0.95] mb-6">
              Architect
            </h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: hoveredSide === "right" ? "100px" : "60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-px bg-white/60 ml-auto"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredSide === "right" ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-body text-white/80 max-w-xs"
            >
              Join our curated network and connect with clients
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-center"
      >
        <p className="text-xs text-white/40 tracking-wide">
          Premium Architecture Marketplace
        </p>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
