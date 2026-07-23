import { useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openPaymentOverlay = useCallback(
    async (
      purpose: "consultation" | "subscription" | "featured",
      payload: any,
      onSuccess?: () => void
    ) => {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      try {
        let response;
        if (purpose === "consultation") {
          response = await api.createConsultationPayment(payload);
        } else if (purpose === "subscription") {
          response = await api.createSubscriptionPayment(payload);
        } else if (purpose === "featured") {
          response = await api.createFeaturedPlacementPayment(payload);
        } else {
          throw new Error("Invalid payment purpose");
        }

        const order = response.order ?? response;
        const payment = response.payment ?? payload;
        const orderId = order?.id;
        if (!orderId) {
          toast.error("Payment gateway did not return an order id");
          return;
        }

        const amount = payment?.amount ?? payload?.amount;
        const currency = payment?.currency ?? payload?.currency ?? "INR";
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY || response?.key || "";
        if (!razorpayKey) {
          toast.error("Razorpay key missing. Configure VITE_RAZORPAY_KEY_ID in frontend env.");
          return;
        }
        if (!amount) {
          toast.error("Payment amount is missing");
          return;
        }

        const options = {
          key: razorpayKey,
          amount: amount * 100,
          currency,
          name: "DomeLink",
          description: `Payment for ${purpose}`,
          order_id: orderId,
          handler: async function (checkoutResponse: any) {
            try {
              await api.verifyPayment({
                orderId: checkoutResponse.razorpay_order_id,
                paymentId: checkoutResponse.razorpay_payment_id,
                signature: checkoutResponse.razorpay_signature,
                purpose,
                ...payload,
              });
              toast.success("Payment successful!");
              if (onSuccess) onSuccess();
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: "Demo User",
            email: "user@example.com",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: function () {
              // Custom dismiss logic if required, generally safe as is for raw function usage
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (res: any) {
          toast.error(res.error.description || "Payment failed");
        });
        rzp.open();
      } catch (err: any) {
        toast.error(err.message || "Failed to initiate payment");
      }
    },
    [loadRazorpayScript]
  );

  return { openPaymentOverlay };
};
