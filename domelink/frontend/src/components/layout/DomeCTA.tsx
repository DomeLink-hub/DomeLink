import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface DomeCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const DomeCTA = ({
  title = "Ready to discuss your future home?",
  subtitle = "Share your vision with DomeLink and schedule a private consultation with a verified architect.",
  buttonText = "Get a Free Consultation",
}: DomeCTAProps) => {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 md:px-10 lg:px-14">
        <div className="dome-panel p-10 md:p-14">
          <div className="space-y-6">
            <h2 className="text-display-lg dome-bracket">{title}</h2>
            <p className="text-body text-muted-foreground max-w-2xl">{subtitle}</p>
          </div>
          <div className="mt-10">
            <Link to="/consultation">
              <motion.button
                type="button"
                className="dome-button justify-center w-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {buttonText}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DomeCTA;
