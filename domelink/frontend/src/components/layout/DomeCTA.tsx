import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CinematicReveal } from "@/components/animations/Reveal";

interface DomeCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  href?: string;
}

const DomeCTA = ({
  title = "Ready to discuss your future home?",
  subtitle = "Share your vision with DomeLink and schedule a private consultation with a verified architect.",
  buttonText = "Get a Free Consultation",
  href = "/consultation",
}: DomeCTAProps) => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="mx-auto w-full max-w-5xl px-6 md:px-10 lg:px-14 relative z-10">
        <CinematicReveal>
          <div className="dome-panel p-10 md:p-14 relative overflow-hidden">
            {/* Ambient orb */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
              <div className="space-y-4">
                <span className="dome-kicker">Begin your project</span>
                <h2 className="text-display-lg dome-bracket">{title}</h2>
                <p className="text-body text-muted-foreground max-w-2xl">{subtitle}</p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link to={href}>
                  <motion.button type="button" className="dome-button justify-center w-full"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
                    {buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/homeowner/avora-estimate">
                  <motion.button type="button" className="dome-button-outline justify-center w-full"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
                    Run Avora Estimate
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </CinematicReveal>
      </div>
    </section>
  );
};

export default DomeCTA;
