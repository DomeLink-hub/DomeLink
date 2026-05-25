import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PRICING_PLANS,
  formatPlanInr,
  getPlanById,
  suggestPlanIdFromPlotSize,
  type PricingPlan,
} from "@/lib/pricingPlans";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { loadRazorpayScript } from "@/lib/razorpayCheckout";

interface ConsultationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  architectId: string;
  architectName: string;
  consultationId: string;
  onPaymentSuccess: () => void;
}

const ConsultationPaymentModal = ({
  isOpen,
  onClose,
  architectId,
  architectName,
  consultationId,
  onPaymentSuccess,
}: ConsultationPaymentModalProps) => {
  const { user } = useAuth();
  const defaultPlanId = useMemo(
    () => suggestPlanIdFromPlotSize(user?.plotSize),
    [user?.plotSize],
  );
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedPlanId(defaultPlanId);
  }, [isOpen, defaultPlanId]);

  const selectedPlan = getPlanById(selectedPlanId);

  const handleProceed = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    try {
      const order = await api.createPaymentOrder({
        amount: selectedPlan.priceInr,
        planName: selectedPlan.id,
        architectId,
        consultationId,
      });

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Failed to load Razorpay checkout");
        return;
      }

      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "DomeLink",
        description: `${selectedPlan.name} — consultation with ${architectName}`,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await api.verifyBookingPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Your consultation is confirmed.");
            onPaymentSuccess();
            onClose();
          } catch {
            toast.error("Payment verification failed. Contact support if amount was debited.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#1b1612" },
      });

      rzp.on("payment.failed", (res: { error?: { description?: string } }) => {
        toast.error(res.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Unable to start payment");
      toast.error(msg);
    } finally {
      setPaying(false);
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
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-y-auto bg-background z-[61] p-6 md:p-8 rounded-lg border border-border shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="dome-kicker">Consultation package</span>
                <h3 className="text-display-sm mt-1">Choose your plan</h3>
                <p className="text-body-sm text-muted-foreground mt-2">
                  Pay securely via Razorpay (test mode) to confirm your session with {architectName}.
                </p>
              </div>
              <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {PRICING_PLANS.map((plan) => (
                <PlanOption
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id)}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button type="button" className="dome-button-outline" onClick={onClose} disabled={paying}>
                Cancel
              </button>
              <button
                type="button"
                className="dome-button"
                onClick={handleProceed}
                disabled={paying || !selectedPlan}
              >
                {paying ? "Opening checkout…" : `Proceed to Payment — ${selectedPlan ? formatPlanInr(selectedPlan.priceInr) : ""}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function PlanOption({
  plan,
  selected,
  onSelect,
}: {
  plan: PricingPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left dome-card p-4 transition-colors ${
        selected ? "border-primary ring-1 ring-primary/30" : "hover:border-foreground/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body font-medium">{plan.name}</p>
          <p className="text-caption text-muted-foreground">{plan.subtitle}</p>
          <p className="text-body-sm text-muted-foreground mt-2">
            Max {plan.maxSqFt.toLocaleString("en-IN")} sq ft · +{formatPlanInr(plan.perFloorInr)}/floor
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-display-sm">{formatPlanInr(plan.priceInr)}</p>
          {selected && <span className="dome-chip text-xs mt-1">Selected</span>}
        </div>
      </div>
      <Accordion type="single" collapsible className="mt-3" onClick={(e) => e.stopPropagation()}>
        <AccordionItem value="breakdown" className="border-none">
          <AccordionTrigger className="py-2 text-caption text-muted-foreground hover:no-underline">
            Fee breakdown
          </AccordionTrigger>
          <AccordionContent>
            <ul className="grid grid-cols-2 gap-2 text-body-sm text-muted-foreground">
              <li>Architect: {formatPlanInr(plan.breakdown.architect)}</li>
              <li>Platform: {formatPlanInr(plan.breakdown.platform)}</li>
              <li>Marketing: {formatPlanInr(plan.breakdown.marketing)}</li>
              <li>Support: {formatPlanInr(plan.breakdown.support)}</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </button>
  );
}

export default ConsultationPaymentModal;
