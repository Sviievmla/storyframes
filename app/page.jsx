"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://storyframes-backend-1.onrender.com";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export default function Page() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      console.warn("Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID");
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !window.paypal) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const res = await fetch(`${API_BASE}/pay/paypal?product_id=1`, { method: "POST" });
            if (!res.ok) {
              throw new Error("Failed to create PayPal order");
            }
            const data = await res.json();
            return data.orderID;
          } catch (error) {
            console.error("Create order error:", error);
            throw error;
          }
        },
        onApprove: async (data) => {
          try {
            const res = await fetch(`${API_BASE}/pay/paypal/capture?order_id=${data.orderID}`, { method: "POST" });
            if (!res.ok) {
              throw new Error("Failed to capture PayPal order");
            }
            const capture = await res.json();
            alert("Payment status: " + capture.status);
          } catch (error) {
            console.error("Capture error:", error);
            alert("Payment error. Please try again.");
          }
        }
      })
      .render("#paypal-button-container");
  }, [loaded]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Story Frames Checkout</h1>
      <div id="paypal-button-container" />
    </main>
  );
}
