import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (consultationId: string) => void;
  architectId: string;
}

const steps = ["Project", "Preferences", "Confirm"] as const;

const ConsultationModal = ({ isOpen, onClose, onComplete, architectId }: ConsultationModalProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    preferredDate: "",
    projectType: "Residential",
    budget: "",
    plotSize: "",
    preferredStyle: "",
    location: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const consultation = await api.createConsultation({
        architectId,
        message: form.message || "Requesting a consultation",
        preferredDate: form.preferredDate || undefined,
        projectType: form.projectType || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        plotSize: form.plotSize || undefined,
        preferredStyle: form.preferredStyle || undefined,
        location: form.location || undefined,
      });
      toast.success("Consultation booked.");
      onComplete(consultation._id);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to book consultation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-background z-50 p-6 md:p-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-display-sm">Book a consultation</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 text-caption text-muted-foreground mb-6">
              {steps.map((step, index) => (
                <span key={step} className={index === stepIndex ? "text-foreground" : ""}>
                  {step}
                </span>
              ))}
            </div>

            {stepIndex === 0 && (
              <div className="space-y-4">
                <label className="text-caption text-muted-foreground">Project type</label>
                <input
                  className="dome-input"
                  value={form.projectType}
                  onChange={(event) => setForm({ ...form, projectType: event.target.value })}
                />
                <label className="text-caption text-muted-foreground">Budget</label>
                <input
                  className="dome-input"
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: event.target.value })}
                  placeholder="$75,000"
                />
                <label className="text-caption text-muted-foreground">Preferred date</label>
                <input
                  type="date"
                  className="dome-input"
                  value={form.preferredDate}
                  onChange={(event) => setForm({ ...form, preferredDate: event.target.value })}
                />
              </div>
            )}

            {stepIndex === 1 && (
              <div className="space-y-4">
                <label className="text-caption text-muted-foreground">Plot size</label>
                <input
                  className="dome-input"
                  value={form.plotSize}
                  onChange={(event) => setForm({ ...form, plotSize: event.target.value })}
                  placeholder="400 m²"
                />
                <label className="text-caption text-muted-foreground">Preferred style</label>
                <input
                  className="dome-input"
                  value={form.preferredStyle}
                  onChange={(event) => setForm({ ...form, preferredStyle: event.target.value })}
                  placeholder="Minimal, Coastal"
                />
                <label className="text-caption text-muted-foreground">Location</label>
                <input
                  className="dome-input"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="City, Country"
                />
              </div>
            )}

            {stepIndex === 2 && (
              <div className="space-y-4">
                <label className="text-caption text-muted-foreground">Project message</label>
                <textarea
                  className="w-full dome-input rounded-2xl resize-none"
                  rows={4}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder="Share your vision and timeline"
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button className="dome-button-outline" onClick={handleBack} disabled={stepIndex === 0}>
                Back
              </button>
              {stepIndex < steps.length - 1 ? (
                <button className="dome-button" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="dome-button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Confirm"}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConsultationModal;
