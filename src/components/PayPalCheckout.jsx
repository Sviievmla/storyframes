import { useEffect, useState } from "react";

const API_BASE = "https://storyframes-backend-1.onrender.com";

export default function PayPalCheckout({ productId = 1, clientId = "YOUR_CLIENT_ID" }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  useEffect(() => {
    if (!loaded || !window.paypal) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const res = await fetch(`${API_BASE}/pay/paypal?product_id=${productId}`, {
              method: "POST"
            });
            if (!res.ok) {
              const message = await res.text();
              throw new Error(message || "Failed to create PayPal order.");
            }
            const data = await res.json();
            if (!data.orderID) {
              throw new Error("Missing order ID.");
            }
            return data.orderID;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create PayPal order.";
            alert(message);
            throw error;
          }
        },
        onApprove: async (data) => {
          try {
            const res = await fetch(`${API_BASE}/pay/paypal/capture?order_id=${data.orderID}`, {
              method: "POST"
            });
            if (!res.ok) {
              const message = await res.text();
              throw new Error(message || "Failed to capture PayPal order.");
            }
            const capture = await res.json();
            alert("Payment status: " + capture.status);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to capture PayPal order.";
            alert(message);
          }
        }
      })
      .render("#paypal-button-container");
  }, [loaded, productId]);

  return <div id="paypal-button-container"></div>;
}
