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

      const razorpayKey = order.key ?? order.order?.key ?? order.key_id ?? "";
      const razorpayOrderId = order.orderId ?? order.order?.id ?? order.id;
      const razorpayAmount = order.amount ?? order.order?.amount;
      const razorpayCurrency = order.currency ?? order.order?.currency ?? "INR";

      if (!razorpayKey) {
        toast.error("Razorpay key missing. Please add VITE_RAZORPAY_KEY_ID to frontend env.");
        return;
      }
      if (!razorpayOrderId) {
        toast.error("Payment gateway did not return an order id");
        return;
      }
      if (!razorpayAmount) {
        toast.error("Payment amount is missing");
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: razorpayAmount,
        currency: razorpayCurrency,
        name: "DomeLink",
        description: `${selectedPlan.name} — consultation with ${architectName}`,
        order_id: razorpayOrderId,
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
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        }
      });

      rzp.on("payment.failed", (res: { error?: { description?: string } }) => {
        toast.error(res.error?.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Unable to start payment");
      toast.error(msg);
      setPaying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="w-full md:max-w-2xl max-h-[85vh] flex flex-col bg-background rounded-lg border border-border shadow-xl overflow-hidden relative z-10 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 md:p-8 pb-4 shrink-0 bg-background z-10 border-b border-border/10">
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

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-3">
              {PRICING_PLANS.map((plan) => (
                <PlanOption
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setSelectedPlanId(plan.id)}
                />
              ))}
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 p-6 md:p-8 pt-4 border-t border-border/40 bg-background flex flex-col sm:flex-row gap-3 sm:justify-end">
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
        </div>
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
