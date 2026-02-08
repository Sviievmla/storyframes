"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://storyframes-backend-1.onrender.com";

export default function Page() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !window.paypal) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          const res = await fetch(`${API_BASE}/pay/paypal?product_id=1`, { method: "POST" });
          const data = await res.json();
          return data.orderID;
        },
        onApprove: async (data) => {
          const res = await fetch(`${API_BASE}/pay/paypal/capture?order_id=${data.orderID}`, { method: "POST" });
          const capture = await res.json();
          alert("Payment status: " + capture.status);
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
