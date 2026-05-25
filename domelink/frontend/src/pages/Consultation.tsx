import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section } from "@/components/layout/Layout";
import { api } from "@/lib/api";

const Consultation = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    details: "",
    budget: "",
    timeline: "",
    plotDetails: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createConsultation({
        message: `${formData.name} (${formData.email}${formData.phone ? `, ${formData.phone}` : ""}): ${formData.details}`,
        budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
        timeline: formData.timeline,
        plotDetails: formData.plotDetails
      });
    } catch {
      toast.error("Unable to submit consultation. Please try again.");
      setIsSubmitting(false);
      return;
    }

    toast.success("Consultation request sent.");
    setFormData({ name: "", email: "", phone: "", details: "", budget: "", timeline: "", plotDetails: "" });
    setIsSubmitting(false);
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Consultation"
          title="Schedule a private consultation"
          subtitle="Share your project vision and we will connect you with a verified architect."
          imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          align="center"
          className="pt-20"
        />
        <Section padding="small">
          <Container size="narrow">
            <motion.form
              onSubmit={handleSubmit}
              className="dome-flow pt-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Name</label>
                <input
                  className="dome-input"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Email</label>
                <input
                  className="dome-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Phone</label>
                <input
                  className="dome-input"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption text-muted-foreground block mb-2">Estimated Budget (Optional)</label>
                  <input
                    className="dome-input"
                    type="number"
                    placeholder="e.g. 5000000"
                    value={formData.budget}
                    onChange={(event) => setFormData({ ...formData, budget: event.target.value })}
                  />
                </div>
                <div>
                  <label className="text-caption text-muted-foreground block mb-2">Expected Timeline</label>
                  <input
                    className="dome-input"
                    placeholder="e.g. 6 Months"
                    value={formData.timeline}
                    onChange={(event) => setFormData({ ...formData, timeline: event.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Plot Details / Location</label>
                <input
                  className="dome-input"
                  placeholder="e.g. 2400 sq.ft, Bangalore"
                  value={formData.plotDetails}
                  onChange={(event) => setFormData({ ...formData, plotDetails: event.target.value })}
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Project details</label>
                <textarea
                  className="w-full dome-input rounded-2xl resize-none"
                  rows={4}
                  value={formData.details}
                  onChange={(event) => setFormData({ ...formData, details: event.target.value })}
                />
              </div>
              <motion.button
                type="submit"
                className="w-full dome-button justify-center disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Consultation"}
              </motion.button>
            </motion.form>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Consultation;
